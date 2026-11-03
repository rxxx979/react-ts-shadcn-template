import { create } from "zustand";

import { isAuthRole, isPermission } from "@/lib/auth";
import type { AuthRole, Permission } from "@/lib/auth";
import { DEFAULT_PERMISSION_CONFIG, parsePermissionConfig } from "@/lib/permission";
import type { PermissionConfig } from "@/lib/permission";
import { useAuthStore } from "@/stores/auth";

type PermissionOverrides = Partial<Record<AuthRole, Partial<Record<Permission, boolean>>>>;

const OVERRIDES_KEY = "permission-overrides";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readOverrides = (): PermissionOverrides => {
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY);

    if (!raw) {
      return {};
    }

    const data: unknown = JSON.parse(raw);

    if (!isRecord(data)) {
      return {};
    }

    const overrides: PermissionOverrides = {};

    for (const [role, value] of Object.entries(data)) {
      if (!isAuthRole(role) || !isRecord(value)) {
        continue;
      }

      const roleOverrides: Partial<Record<Permission, boolean>> = {};

      for (const [permission, enabled] of Object.entries(value)) {
        if (isPermission(permission) && typeof enabled === "boolean") {
          roleOverrides[permission] = enabled;
        }
      }

      overrides[role] = roleOverrides;
    }

    return overrides;
  } catch {
    return {};
  }
};

const writeOverrides = (overrides: PermissionOverrides) => {
  try {
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
  } catch {
    // 忽略存储不可用
  }
};

const applyRoleOverrides = (role: AuthRole, base: PermissionConfig, overrides: PermissionOverrides): Permission[] => {
  const permissions = new Set(base.roles[role]);

  for (const [permission, enabled] of Object.entries(overrides[role] ?? {})) {
    if (!isPermission(permission)) {
      continue;
    }

    if (enabled) {
      permissions.add(permission);
    } else {
      permissions.delete(permission);
    }
  }

  // 避免管理员误关权限管理后无法恢复
  if (role === "admin") {
    permissions.add("permission:manage");
  }

  return [...permissions];
};

const applyOverrides = (base: PermissionConfig, overrides: PermissionOverrides): PermissionConfig => ({
  version: base.version,
  roles: {
    admin: applyRoleOverrides("admin", base, overrides),
    editor: applyRoleOverrides("editor", base, overrides),
    viewer: applyRoleOverrides("viewer", base, overrides),
  },
});

const syncAuthUser = (config: PermissionConfig) => {
  const user = useAuthStore.getState().user;

  if (user) {
    useAuthStore.getState().setUser({ ...user, permissions: [...config.roles[user.role]] });
  }
};

interface PermissionState {
  config: PermissionConfig;
  baseConfig: PermissionConfig;
  loaded: boolean;
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  setPermission: (role: AuthRole, permission: Permission, enabled: boolean) => void;
  reset: () => void;
}

let loadPromise: Promise<void> | null = null;

/**
 * 动态页面权限：public/permission.json + localStorage 覆盖
 */
const usePermissionStore = create<PermissionState>()((set, get) => ({
  config: applyOverrides(DEFAULT_PERMISSION_CONFIG, {}),
  baseConfig: DEFAULT_PERMISSION_CONFIG,
  loaded: false,
  loading: false,
  error: null,

  load: async () => {
    if (get().loaded) {
      return;
    }

    if (loadPromise) {
      return loadPromise;
    }

    set({ loading: true, error: null });

    loadPromise = (async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}permission.json`, { cache: "no-store" });

        if (!response.ok) {
          throw new Error(`无法加载权限配置：${response.status}`);
        }

        const data: unknown = await response.json();
        const baseConfig = parsePermissionConfig(data);

        if (!baseConfig) {
          throw new Error("权限配置格式不正确");
        }

        const config = applyOverrides(baseConfig, readOverrides());
        set({ baseConfig, config, loaded: true, loading: false, error: null });
        syncAuthUser(config);
      } catch (cause) {
        const baseConfig = DEFAULT_PERMISSION_CONFIG;
        const config = applyOverrides(baseConfig, readOverrides());
        set({
          baseConfig,
          config,
          loaded: true,
          loading: false,
          error: cause instanceof Error ? cause.message : "权限配置加载失败",
        });
        syncAuthUser(config);
      } finally {
        loadPromise = null;
      }
    })();

    return loadPromise;
  },

  setPermission: (role, permission, enabled) => {
    if (role === "admin" && permission === "permission:manage") {
      return;
    }

    const overrides = readOverrides();
    overrides[role] = { ...overrides[role], [permission]: enabled };
    writeOverrides(overrides);

    const config = applyOverrides(get().baseConfig, overrides);
    set({ config });
    syncAuthUser(config);
  },

  reset: () => {
    try {
      localStorage.removeItem(OVERRIDES_KEY);
    } catch {
      // 忽略存储不可用
    }

    const config = applyOverrides(get().baseConfig, {});
    set({ config });
    syncAuthUser(config);
  },
}));

export { usePermissionStore };

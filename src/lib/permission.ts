import { z } from "zod";

import { ROLE_PERMISSIONS, isPermission } from "@/lib/auth";
import type { AuthRole, Permission } from "@/lib/auth";

/**
 * 页面权限定义：用于权限面板分组
 */
interface PagePermission {
  permission: Permission;
  label: string;
  description: string;
}

const PAGE_PERMISSIONS: readonly PagePermission[] = [
  { permission: "project:read", label: "项目", description: "项目列表、详情与只读视图" },
  { permission: "component:read", label: "组件库", description: "组件画廊与主题预览" },
  { permission: "stack:read", label: "技术栈", description: "依赖与版本信息" },
  { permission: "stream:read", label: "实时流", description: "SSE 工作台与事件预览" },
  { permission: "settings:update", label: "设置", description: "工作区与个人资料设置" },
  { permission: "file:upload", label: "文件上传", description: "附件与媒体上传工作台" },
  { permission: "permission:manage", label: "权限管理", description: "修改 public/permission.json 中的角色权限" },
];

interface PermissionConfig {
  version: number;
  roles: Record<AuthRole, Permission[]>;
}

const PERMISSION_SCHEMA = z.object({
  version: z.number(),
  roles: z.object({
    admin: z.array(z.string()),
    editor: z.array(z.string()),
    viewer: z.array(z.string()),
  }),
});

const normalizePermissions = (values: readonly string[]): Permission[] => [
  ...new Set(values.filter((permission) => isPermission(permission))),
];

/**
 * 把 JSON 数据规范化为权限配置
 *
 * @param value - 原始 JSON
 */
const parsePermissionConfig = (value: unknown): PermissionConfig | null => {
  const parsed = PERMISSION_SCHEMA.safeParse(value);

  if (!parsed.success) {
    return null;
  }

  return {
    version: parsed.data.version,
    roles: {
      admin: normalizePermissions(parsed.data.roles.admin),
      editor: normalizePermissions(parsed.data.roles.editor),
      viewer: normalizePermissions(parsed.data.roles.viewer),
    },
  };
};

const DEFAULT_PERMISSION_CONFIG: PermissionConfig = {
  version: 1,
  roles: {
    admin: [...ROLE_PERMISSIONS.admin],
    editor: [...ROLE_PERMISSIONS.editor],
    viewer: [...ROLE_PERMISSIONS.viewer],
  },
};

export { DEFAULT_PERMISSION_CONFIG, PAGE_PERMISSIONS, parsePermissionConfig };
export type { PagePermission, PermissionConfig };

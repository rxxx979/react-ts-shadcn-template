import { can } from "@/lib/auth";
import type { Permission } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth";

/**
 * 订阅当前用户并判断一项权限
 *
 * @param permission - 权限
 */
const usePermission = (permission: Permission): boolean => {
  const user = useAuthStore((state) => state.user);
  return can(user, permission);
};

export { usePermission };

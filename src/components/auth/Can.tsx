import type { ReactNode } from "react";

import { can } from "@/lib/auth";
import type { Permission } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth";

interface CanProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * 按钮级权限门：无权限时不渲染子节点
 */
const Can = ({ permission, children, fallback = null }: CanProps) => {
  const user = useAuthStore((state) => state.user);
  return can(user, permission) ? children : fallback;
};

export { Can };

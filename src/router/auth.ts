import { redirect } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

import { authenticate, can, safeRedirect } from "@/lib/auth";
import type { AuthUser, Permission } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth";
import { usePermissionStore } from "@/stores/permission";

interface LoginActionData {
  error?: string;
  email?: string;
}

/**
 * 未登录时带上回跳地址
 *
 * @param request - 当前请求
 */
const loginRedirect = (request: Request): string => {
  const url = new URL(request.url);
  return `/login?redirect=${encodeURIComponent(`${url.pathname}${url.search}`)}`;
};

/**
 * 受保护路由 loader：没有 session 时跳到登录页
 */
const requireAuth = async ({ request }: LoaderFunctionArgs): Promise<AuthUser | Response> => {
  await usePermissionStore.getState().load();
  const user = useAuthStore.getState().user;

  if (!user) {
    return redirect(loginRedirect(request));
  }

  return user;
};

/**
 * 权限守卫；无权限时回到首页
 *
 * @param permission - 需要的权限
 */
const requirePermission =
  (permission: Permission) =>
  async (args: LoaderFunctionArgs): Promise<Response | null> => {
    const user = await requireAuth(args);

    if (user instanceof Response) {
      return user;
    }

    if (!can(user, permission)) {
      return redirect("/");
    }

    return null;
  };

/**
 * 已登录用户访问 /login 时直接回跳
 */
const loginLoader = async ({ request }: LoaderFunctionArgs): Promise<Response | null> => {
  await usePermissionStore.getState().load();
  const user = useAuthStore.getState().user;

  if (user) {
    const url = new URL(request.url);
    return redirect(safeRedirect(url.searchParams.get("redirect")));
  }

  return null;
};

/**
 * Data mode 登录 action
 */
const readField = (form: FormData, key: string): string => {
  const value = form.get(key);
  return typeof value === "string" ? value : "";
};

const loginAction = async ({ request }: ActionFunctionArgs): Promise<LoginActionData | Response> => {
  const form = await request.formData();
  const email = readField(form, "email");
  const password = readField(form, "password");
  await usePermissionStore.getState().load();
  const user = authenticate(email, password);

  if (!user) {
    return { error: "邮箱或密码不正确", email };
  }

  useAuthStore.getState().setUser({
    ...user,
    permissions: [...usePermissionStore.getState().config.roles[user.role]],
  });
  return redirect(safeRedirect(readField(form, "redirect")));
};

/**
 * 清理 session 并返回登录页
 */
const logoutAction = (): Response => {
  useAuthStore.getState().clear();
  return redirect("/login");
};

export { loginAction, loginLoader, logoutAction, requireAuth, requirePermission };
export type { LoginActionData };

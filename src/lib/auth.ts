/**
 * 演示环境角色
 */
type AuthRole = "admin" | "editor" | "viewer";

/**
 * 细粒度权限
 */
type Permission = "permission:manage" | "settings:update";

/**
 * 已登录用户
 */
interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  permissions: Permission[];
}

/**
 * 演示账号（仅用于前端 mock，不包含真实凭据）
 */
interface DemoAccount extends Omit<AuthUser, "permissions"> {
  password: string;
  summary: string;
}

const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  {
    id: "user-admin",
    name: "管理员",
    email: "admin@example.com",
    password: "admin123",
    role: "admin",
    summary: "工作区设置与权限管理",
  },
  {
    id: "user-editor",
    name: "编辑",
    email: "editor@example.com",
    password: "editor123",
    role: "editor",
    summary: "工作区设置与通知",
  },
  {
    id: "user-viewer",
    name: "访客",
    email: "viewer@example.com",
    password: "viewer123",
    role: "viewer",
    summary: "首页与通知",
  },
];

const ROLE_PERMISSIONS: Record<AuthRole, readonly Permission[]> = {
  admin: ["permission:manage", "settings:update"],
  editor: ["settings:update"],
  viewer: [],
};

const ROLE_LABELS: Record<AuthRole, string> = {
  admin: "管理员",
  editor: "编辑",
  viewer: "访客",
};

const ROLE_DESCRIPTIONS: Record<AuthRole, string> = {
  admin: "可管理设置与角色权限。",
  editor: "可修改工作区设置。",
  viewer: "仅可访问首页与通知。",
};

/**
 * 校验角色值
 *
 * @param value - 原始值
 */
const isAuthRole = (value: unknown): value is AuthRole => value === "admin" || value === "editor" || value === "viewer";

const PERMISSION_LIST: readonly Permission[] = ["permission:manage", "settings:update"];

/**
 * 校验权限字符串
 *
 * @param value - 原始值
 */
const isPermission = (value: unknown): value is Permission =>
  typeof value === "string" && PERMISSION_LIST.some((permission) => permission === value);

/**
 * 校验用户对象是否完整
 *
 * @param value - 持久化数据
 */
const isAuthUser = (value: unknown): value is AuthUser => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const user = value as Partial<AuthUser>;
  return (
    typeof user.id === "string"
    && typeof user.name === "string"
    && typeof user.email === "string"
    && isAuthRole(user.role)
    && Array.isArray(user.permissions)
    && user.permissions.every(isPermission)
  );
};

/**
 * 判断用户是否拥有某项权限
 *
 * @param user - 当前用户
 * @param permission - 权限
 */
const can = (user: AuthUser | null | undefined, permission: Permission): boolean =>
  Boolean(user?.permissions.includes(permission));

/**
 * 根据邮箱和密码匹配演示账号
 *
 * @param email - 邮箱
 * @param password - 密码
 */
const authenticate = (email: string, password: string): AuthUser | null => {
  const normalizedEmail = email.trim().toLowerCase();
  const account = DEMO_ACCOUNTS.find((item) => item.email === normalizedEmail);

  if (!account || account.password !== password) {
    return null;
  }

  const { password: _password, summary: _summary, ...user } = account;
  return { ...user, permissions: [...ROLE_PERMISSIONS[user.role]] };
};

/**
 * 只允许站内相对路径，避免开放重定向
 *
 * @param value - 原始 redirect 参数
 */
const safeRedirect = (value: string | null | undefined): string => {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
};

export {
  DEMO_ACCOUNTS,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  ROLE_PERMISSIONS,
  authenticate,
  can,
  isAuthRole,
  isAuthUser,
  isPermission,
  safeRedirect,
};
export type { AuthRole, AuthUser, DemoAccount, Permission };

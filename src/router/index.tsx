import { BellIcon, HomeIcon, SettingsIcon, ShieldCheckIcon } from "lucide-react";
import type { ReactNode } from "react";
import { createBrowserRouter, redirect } from "react-router";
import type { RouteObject } from "react-router";

import { Layout } from "@/components/layout/Layout";
import { RootError } from "@/components/layout/RootError";
import type { Permission } from "@/lib/auth";
import { Home } from "@/pages/Home";
import { Login } from "@/pages/Login";
import { NotFound } from "@/pages/NotFound";
import { Notifications } from "@/pages/Notifications";
import { Permissions } from "@/pages/Permissions";
import { Settings } from "@/pages/Settings";

import { loginAction, loginLoader, logoutAction, requireAuth, requirePermission } from "./auth";
import { settingsAction, settingsLoader } from "./settings";

/**
 * 路由元信息：驱动侧边栏菜单与面包屑（见 layout/Menu.ts 的转换规则）
 */
interface Handler {
  /**
   * 菜单名（侧边栏菜单项 / 分组标签）
   */
  title?: string;
  /**
   * 面包屑文案（缺省时该层级不出现在面包屑中）
   */
  breadcrumb?: string;
  /**
   * 菜单图标
   */
  icon?: ReactNode;
  /**
   * True 时该路由渲染为菜单分组标签节：title 作为节标签，children 作为节内菜单项
   */
  navGroup?: boolean;
  /**
   * True 时内容区忽略 boxed 最大宽度，铺满可用空间
   */
  fluid?: boolean;
  /**
   * 访问该路由所需的权限；缺省表示所有已登录用户
   */
  permission?: Permission;
}

/**
 * 路由项：react-router 的 RouteObject + 自定义元信息 handle
 */
type RouteItem = RouteObject & {
  handle?: Handler;
  children?: RouteItem[];
};

const settingsRouteLoader = async (args: Parameters<typeof settingsLoader>[0]) => {
  const denied = await requirePermission("settings:update")(args);
  return denied ?? settingsLoader(args);
};

const settingsRouteAction = async (
  args: Parameters<typeof settingsAction>[0],
): Promise<Response | Awaited<ReturnType<typeof settingsAction>>> => {
  const denied = await requirePermission("settings:update")(args);
  return denied ?? settingsAction(args);
};

const routes: RouteItem[] = [
  {
    id: "Login",
    path: "/login",
    element: <Login />,
    action: loginAction,
    loader: loginLoader,
    errorElement: <RootError />,
  },
  {
    id: "Logout",
    path: "/logout",
    action: logoutAction,
    loader: () => redirect("/login"),
  },
  {
    id: "App",
    path: "/",
    element: <Layout />,
    errorElement: <RootError />,
    loader: requireAuth,
    children: [
      {
        id: "Home",
        index: true,
        element: <Home />,
        handle: {
          title: "首页",
          breadcrumb: "首页",
          icon: <HomeIcon />,
        },
      },
      {
        id: "Settings",
        path: "settings",
        element: <Settings />,
        loader: settingsRouteLoader,
        action: settingsRouteAction,
        handle: {
          title: "设置",
          breadcrumb: "设置",
          icon: <SettingsIcon />,
          permission: "settings:update",
        },
      },
      {
        id: "Notifications",
        path: "notifications",
        element: <Notifications />,
        handle: {
          title: "通知",
          breadcrumb: "通知",
          icon: <BellIcon />,
        },
      },
      {
        id: "Permissions",
        path: "permissions",
        element: <Permissions />,
        loader: requirePermission("permission:manage"),
        handle: {
          title: "权限",
          breadcrumb: "权限",
          icon: <ShieldCheckIcon />,
          permission: "permission:manage",
        },
      },
      {
        id: "NotFound",
        path: "*",
        element: <NotFound />,
        handle: {
          breadcrumb: "页面未找到",
        },
      },
    ],
  },
];

const router = createBrowserRouter(routes);

export { router, routes };
export type { RouteItem, Handler };

import { BoxesIcon, ComponentIcon, FolderKanbanIcon, HomeIcon, RadioIcon, ShieldCheckIcon } from "lucide-react";
import type { ReactNode } from "react";
import { createBrowserRouter, redirect } from "react-router";
import type { RouteObject } from "react-router";

import { Layout } from "@/components/layout/Layout";
import { RootError } from "@/components/layout/RootError";
import type { Permission } from "@/lib/auth";
import { Home } from "@/pages/Home";
import { Login } from "@/pages/Login";
import { NotFound } from "@/pages/NotFound";
import { Permissions } from "@/pages/Permissions";

import { loginAction, loginLoader, logoutAction, requireAuth, requirePermission } from "./auth";
import { ComponentsPage, ProjectsPage, SsePage, StackPage } from "./lazy";

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
        id: "Projects",
        path: "projects",
        element: <ProjectsPage />,
        loader: requirePermission("project:read"),
        handle: {
          title: "项目",
          breadcrumb: "项目",
          icon: <FolderKanbanIcon />,
          fluid: true,
          permission: "project:read",
        },
      },
      {
        id: "Components",
        path: "components",
        element: <ComponentsPage />,
        loader: requirePermission("component:read"),
        handle: {
          title: "组件",
          breadcrumb: "组件",
          icon: <ComponentIcon />,
          permission: "component:read",
        },
      },
      {
        id: "Stack",
        path: "stack",
        element: <StackPage />,
        loader: requirePermission("stack:read"),
        handle: {
          title: "技术栈",
          breadcrumb: "技术栈",
          icon: <BoxesIcon />,
          permission: "stack:read",
        },
      },
      {
        id: "Sse",
        path: "sse",
        element: <SsePage />,
        loader: requirePermission("stream:read"),
        handle: {
          title: "实时流",
          breadcrumb: "实时流",
          icon: <RadioIcon />,
          permission: "stream:read",
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

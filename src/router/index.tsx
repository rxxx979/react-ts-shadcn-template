import { BoxesIcon, ComponentIcon, HomeIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { createBrowserRouter } from "react-router";
import type { RouteObject } from "react-router";

import { Layout } from "@/components/layout/Layout";
import { Home } from "@/pages/Home";
import { NotFound } from "@/pages/NotFound";

import { ComponentsPage, PageFallback, StackPage } from "./lazy";

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
    path: "/",
    element: <Layout />,
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
        id: "Components",
        path: "components",
        element: (
          <Suspense fallback={<PageFallback />}>
            <ComponentsPage />
          </Suspense>
        ),
        handle: {
          title: "组件",
          breadcrumb: "组件",
          icon: <ComponentIcon />,
        },
      },
      {
        id: "Stack",
        path: "stack",
        element: (
          <Suspense fallback={<PageFallback />}>
            <StackPage />
          </Suspense>
        ),
        handle: {
          title: "技术栈",
          breadcrumb: "技术栈",
          icon: <BoxesIcon />,
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

import type { ReactNode } from "react";

import type { Handler, RouteItem } from "./index";

/**
 * 导航项：从路由表投影出的纯展示数据
 */
interface NavigationEntry {
  path: string;
  title: string;
  breadcrumb: string;
  icon?: ReactNode;
}

/**
 * 规范化路径，避免拼接出 `//` 或末尾斜杠
 *
 * @param path - 原始路径
 */
const normalizePath = (path: string): string => {
  const normalized = path.replaceAll(/\/+/g, "/");
  return normalized === "/" ? normalized : normalized.replace(/\/$/, "");
};

/**
 * 判断路由 handle 是否为导航元信息
 */
const isHandler = (value: unknown): value is Handler =>
  typeof value === "object" && value !== null && ("title" in value || "breadcrumb" in value || "icon" in value);

/**
 * 路由表 → 导航项
 *
 * 只保留同时具备 title 与 breadcrumb 的路由；index 路由继承父路径。
 *
 * @param routes - React-router 路由表
 *
 * @returns 有序导航项
 */
const toNavigation = (routes: readonly RouteItem[]): NavigationEntry[] => {
  const entries: NavigationEntry[] = [];

  const walk = (items: readonly RouteItem[], parentPath: string) => {
    for (const route of items) {
      const path = route.index
        ? parentPath
        : route.path
          ? route.path.startsWith("/")
            ? route.path
            : `${parentPath}/${route.path}`
          : parentPath;
      const normalizedPath = normalizePath(path);
      const handle = isHandler(route.handle) ? route.handle : undefined;
      const { title, breadcrumb, icon } = handle ?? {};

      if (title && breadcrumb) {
        entries.push({ path: normalizedPath, title, breadcrumb, icon });
      }

      if (route.children) {
        walk(route.children, normalizedPath);
      }
    }
  };

  walk(routes, "/");
  return entries;
};

export { toNavigation };
export type { NavigationEntry };

import { lazy } from "react";

/**
 * 懒加载的组件库页面：把全量 shadcn 组件及其依赖隔离到独立 chunk
 */
const ComponentsPage = lazy(async () => {
  const module = await import("@/pages/Components");
  return { default: module.Components };
});

/**
 * 懒加载的技术栈页面
 */
const StackPage = lazy(async () => {
  const module = await import("@/pages/Stack");
  return { default: module.Stack };
});

/**
 * 懒加载的 SSE 演示页面
 */
const SsePage = lazy(async () => {
  const module = await import("@/pages/Sse");
  return { default: module.Sse };
});

export { ComponentsPage, SsePage, StackPage };

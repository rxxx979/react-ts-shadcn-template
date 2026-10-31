import { useHotkeys, useMediaQuery, useWindowEvent } from "@mantine/hooks";
import type { ReactNode } from "react";
import { useLayoutEffect } from "react";

import { applyTheme, STORAGE_KEY } from "@/lib/theme";
import { useThemeStore } from "@/stores/theme";

import { ThemeSheet } from "./ThemeSheet";

/**
 * 主题同步：把配置写到 `<html>`，并处理系统偏好、跨标签页与快捷键
 *
 * 使用 `useLayoutEffect`，保证配置变更在浏览器绘制前生效，拖动滑块无滞后。
 */
const ThemeSync = () => {
  const mode = useThemeStore((state) => state.mode);
  const preset = useThemeStore((state) => state.preset);
  const primary = useThemeStore((state) => state.primary);
  const surface = useThemeStore((state) => state.surface);
  const accent = useThemeStore((state) => state.accent);
  const radius = useThemeStore((state) => state.radius);
  const border = useThemeStore((state) => state.border);
  const font = useThemeStore((state) => state.font);
  const fontSize = useThemeStore((state) => state.fontSize);
  const motion = useThemeStore((state) => state.motion);
  const pageTransition = useThemeStore((state) => state.pageTransition);
  const motionDuration = useThemeStore((state) => state.motionDuration);
  const motionEasing = useThemeStore((state) => state.motionEasing);
  const setPanelOpen = useThemeStore((state) => state.setPanelOpen);

  // 首次渲染即读取系统偏好（默认行为会先返回 false，导致 system 模式闪烁）
  const systemDark = useMediaQuery("(prefers-color-scheme: dark)", undefined, {
    getInitialValueInEffect: false,
  });
  // 显式模式优先；仅 system 模式才采用系统偏好
  const dark = mode === "dark" || (mode === "system" && systemDark);

  useLayoutEffect(() => {
    applyTheme(
      {
        mode,
        preset,
        primary,
        surface,
        accent,
        radius,
        border,
        font,
        fontSize,
        motion,
        pageTransition,
        motionDuration,
        motionEasing,
      },
      dark,
    );
  }, [
    mode,
    preset,
    primary,
    surface,
    accent,
    radius,
    border,
    font,
    fontSize,
    motion,
    pageTransition,
    motionDuration,
    motionEasing,
    dark,
  ]);

  // 跨标签页同步：其它标签修改主题后重新水合
  useWindowEvent("storage", (event) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    void useThemeStore.persist.rehydrate();
  });

  // ⌥⌘T / Ctrl+Alt+T 随时打开外观面板（输入框内不触发；避开浏览器快捷键）
  useHotkeys([["mod+alt+T", () => setPanelOpen(true)]]);

  return null;
};

/**
 * 主题根组件：同步主题、提供全局外观面板
 *
 * @param props.children - 应用内容
 */
const ThemeProvider = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <ThemeSync />
      {children}
      <ThemeSheet />
    </>
  );
};

export { ThemeProvider };

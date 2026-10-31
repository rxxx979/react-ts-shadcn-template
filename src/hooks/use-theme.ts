import { useMediaQuery } from "@mantine/hooks";

import { useThemeStore } from "@/stores/theme";

/**
 * 主题 Hook：zustand 配置 + 系统外观偏好
 *
 * `getInitialValueInEffect: false` 让首次渲染就读取系统偏好，避免 system 模式下先浅后暗的闪烁。
 *
 * @returns 主题配置、动作与解析后的明暗结果
 */
const useTheme = () => {
  const theme = useThemeStore();
  const systemDark = useMediaQuery("(prefers-color-scheme: dark)", undefined, {
    getInitialValueInEffect: false,
  });
  const resolvedMode = theme.mode === "system" ? (systemDark ? "dark" : "light") : theme.mode;

  return { ...theme, resolvedMode };
};

export { useTheme };

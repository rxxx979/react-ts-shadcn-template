import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  DEFAULT_ACCENT,
  DEFAULT_CONFIG,
  DEFAULT_SURFACE,
  STORAGE_KEY,
  STYLE_PRESETS,
  normalizeConfig,
} from "@/lib/theme";
import type {
  MotionEasing,
  PageTransition,
  ThemeConfig,
  ThemeFont,
  ThemeMode,
  ThemeMotion,
  ThemePresetId,
  ThemeStyleId,
  ThemeTint,
} from "@/lib/theme";

/**
 * 主题动作
 */
interface ThemeActions {
  /**
   * 切换明暗模式
   */
  setMode: (mode: ThemeMode) => void;
  /**
   * 切换品牌色板（同时清除自定义品牌色）
   */
  setPreset: (preset: ThemePresetId) => void;
  /**
   * 设置自定义品牌色
   */
  setPrimary: (primary: ThemeTint | null) => void;
  /**
   * 设置界面色调
   */
  setSurface: (surface: ThemeTint) => void;
  /**
   * 设置强调色
   */
  setAccent: (accent: ThemeTint) => void;
  /**
   * 设置圆角基准值
   */
  setRadius: (radius: number) => void;
  /**
   * 设置边框强度
   */
  setBorder: (border: number) => void;
  /**
   * 设置界面字体
   */
  setFont: (font: ThemeFont) => void;
  /**
   * 设置根字号
   */
  setFontSize: (fontSize: number) => void;
  /**
   * 设置动效偏好
   */
  setMotion: (motion: ThemeMotion) => void;
  /**
   * 应用一键风格（不动品牌色与明暗模式）
   */
  applyStyle: (style: ThemeStyleId) => void;
  /**
   * 设置页面入场方式
   */
  setPageTransition: (pageTransition: PageTransition) => void;
  /**
   * 设置动效时长
   */
  setMotionDuration: (motionDuration: number) => void;
  /**
   * 设置动效缓动
   */
  setMotionEasing: (motionEasing: MotionEasing) => void;
  /**
   * 导入主题配置
   */
  importConfig: (config: unknown) => void;
  /**
   * 恢复默认主题
   */
  reset: () => void;
  /**
   * 打开 / 关闭外观设置面板
   */
  setPanelOpen: (panelOpen: boolean) => void;
}

/**
 * 主题 store：持久化配置 + 非持久化的面板开关
 */
type ThemeStore = ThemeConfig & ThemeActions & { panelOpen: boolean };

/**
 * 把 v1（裸配置）或旧版字符串（`"light"` / `"dark"`）迁移为 zustand persist 的存储格式
 *
 * 必须在创建 store 之前执行，persist 才能读到新结构。
 */
const migrateLegacyStorage = () => {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return;
  }
  if (!raw) return;

  try {
    const parsed: unknown = JSON.parse(raw);
    // 已是 v2 包装格式
    if (parsed && typeof parsed === "object" && "state" in parsed) return;
    const config = normalizeConfig(parsed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: config, version: 3 }));
  } catch {
    // 旧版直接存 "light" / "dark"（非 JSON）
    try {
      const mode: ThemeMode = raw === "dark" ? "dark" : raw === "light" ? "light" : "system";
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: normalizeConfig({ mode }), version: 3 }));
    } catch {
      // 存储不可写时忽略，当前会话仍使用默认主题
    }
  }
};

migrateLegacyStorage();

/**
 * 主题 store：所有主题组件共享同一份状态
 */
const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      ...DEFAULT_CONFIG,
      surface: { ...DEFAULT_SURFACE },
      accent: { ...DEFAULT_ACCENT },
      panelOpen: false,

      setMode: (mode) => {
        set({ mode });
      },
      setPreset: (preset) => {
        set({ preset, primary: null });
      },
      setPrimary: (primary) => {
        set({ primary });
      },
      setSurface: (surface) => {
        set({ surface });
      },
      setAccent: (accent) => {
        set({ accent });
      },
      setRadius: (radius) => {
        set({ radius });
      },
      setBorder: (border) => {
        set({ border });
      },
      setFont: (font) => {
        set({ font });
      },
      setFontSize: (fontSize) => {
        set({ fontSize });
      },
      setMotion: (motion) => {
        set({ motion });
      },
      setPageTransition: (pageTransition) => {
        set({ pageTransition });
      },
      setMotionDuration: (motionDuration) => {
        set({ motionDuration });
      },
      setMotionEasing: (motionEasing) => {
        set({ motionEasing });
      },
      importConfig: (config) => {
        set(normalizeConfig(config));
      },
      applyStyle: (style) => {
        const preset = STYLE_PRESETS.find((item) => item.id === style);
        if (!preset) return;
        set({
          ...preset.config,
          surface: { ...preset.config.surface },
          accent: { ...preset.config.accent },
        });
      },
      reset: () => {
        set({
          ...DEFAULT_CONFIG,
          surface: { ...DEFAULT_SURFACE },
          accent: { ...DEFAULT_ACCENT },
        });
      },
      setPanelOpen: (panelOpen) => {
        set({ panelOpen });
      },
    }),
    {
      name: STORAGE_KEY,
      version: 4,
      storage: createJSONStorage(() => localStorage),
      // 只持久化主题配置，不写入面板开关
      partialize: (state) => ({
        mode: state.mode,
        preset: state.preset,
        primary: state.primary,
        surface: state.surface,
        accent: state.accent,
        radius: state.radius,
        border: state.border,
        font: state.font,
        fontSize: state.fontSize,
        motion: state.motion,
        pageTransition: state.pageTransition,
        motionDuration: state.motionDuration,
        motionEasing: state.motionEasing,
      }),
      // 兼容未来版本或损坏数据：统一走校验与补全
      migrate: (persisted) => normalizeConfig(persisted),
      merge: (persisted, current) => ({ ...current, ...normalizeConfig(persisted) }),
    },
  ),
);

export { useThemeStore };
export type { ThemeActions, ThemeStore };

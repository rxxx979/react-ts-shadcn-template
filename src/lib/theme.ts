/**
 * 主题模型与 DOM 应用：色板、品牌自定义色、界面色调、强调色与圆角
 *
 * 本模块只负责「数据 → DOM」的纯逻辑，状态由 `stores/theme.ts`（zustand）持有：
 *
 * - 品牌色：`preset` 决定，`primary` 自定义后覆盖（内联 `--primary` 系列变量）
 * - 界面色调：`surface` 写入 `--surface-h/--surface-c`，由 `styles/index.css` 派生背景 / 侧栏 / 边框
 * - 强调色：`accent` 写入 `--accent-h/--accent-c`，派生悬停 / 选中态
 * - 首帧由 `index.html` 的内联脚本按同一份持久化数据预先应用
 */

/**
 * 主题模式；`system` 跟随操作系统偏好
 */
type ThemeMode = "light" | "dark" | "system";

/**
 * 内置品牌色板标识
 */
type ThemePresetId = "neutral" | "blue" | "indigo" | "violet" | "emerald" | "cyan" | "amber" | "orange" | "rose";

/**
 * 字体选项
 */
type ThemeFont = "geist" | "sans" | "serif" | "mono";

/**
 * 动效偏好
 */
type ThemeMotion = "full" | "reduced";

/**
 * 页面入场方式
 */
type PageTransition = "fade" | "slide" | "scale" | "none";

/**
 * 动效缓动
 */
type MotionEasing = "ease-out" | "ease-in-out" | "linear" | "spring";

/**
 * 缓动选项
 */
interface MotionEasingOption {
  /**
   * 标识
   */
  id: MotionEasing;
  /**
   * 显示名
   */
  label: string;
  /**
   * CSS timing-function
   */
  value: string;
}

/**
 * 内置缓动
 */
const MOTION_EASING_OPTIONS: readonly MotionEasingOption[] = [
  { id: "ease-out", label: "平滑", value: "ease-out" },
  { id: "ease-in-out", label: "柔和", value: "ease-in-out" },
  { id: "linear", label: "线性", value: "linear" },
  { id: "spring", label: "弹性", value: "cubic-bezier(0.34, 1.56, 0.64, 1)" },
];

/**
 * 按 id 取缓动值
 *
 * @param easing - 缓动标识
 *
 * @returns CSS timing-function
 */
const getEasingValue = (easing: MotionEasing): string =>
  MOTION_EASING_OPTIONS.find((option) => option.id === easing)?.value ?? "ease-out";

/**
 * 字体定义：`stack` 直接写入 `--app-font`
 */
interface ThemeFontOption {
  /**
   * 字体标识
   */
  id: ThemeFont;
  /**
   * 设置面板显示名
   */
  label: string;
  /**
   * 完整 font-family 栈
   */
  stack: string;
}

/**
 * 内置字体（Geist 为默认，其余使用系统字体栈）
 */
const FONT_OPTIONS: readonly ThemeFontOption[] = [
  { id: "geist", label: "Geist", stack: '"Geist Variable", ui-sans-serif, system-ui, sans-serif' },
  { id: "sans", label: "无衬线", stack: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif' },
  { id: "serif", label: "衬线", stack: 'ui-serif, Georgia, "Times New Roman", serif' },
  { id: "mono", label: "等宽", stack: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" },
];

/**
 * 可调色相与强度（强度 0–1，映射到各 token 允许的最大彩度）
 */
interface ThemeTint {
  /**
   * 色相（0–360）
   */
  hue: number;
  /**
   * 强度（0–1；0 为无彩色）
   */
  strength: number;
}

/**
 * 品牌色板定义：`swatch` 指向 `styles/index.css` 中的基色变量，保证色点与实际配色同源
 */
interface ThemePreset {
  /**
   * 色板标识（写入 `html[data-theme]`）
   */
  id: ThemePresetId;
  /**
   * 设置面板显示名
   */
  label: string;
  /**
   * 基色 CSS 变量名（定义在 `:root`，供色点预览）
   */
  swatch: string;
  /**
   * 自定义品牌色的色相起点
   */
  hue: number;
  /**
   * 自定义品牌色的彩度起点（0–0.3）
   */
  chroma: number;
}

/**
 * 持久化的主题配置
 */
interface ThemeConfig {
  /**
   * 明暗模式
   */
  mode: ThemeMode;
  /**
   * 品牌色板
   */
  preset: ThemePresetId;
  /**
   * 自定义品牌色；为 null 时使用色板配色
   */
  primary: ThemeTint | null;
  /**
   * 界面色调：背景 / 侧栏 / 边框的冷暖和浓度
   */
  surface: ThemeTint;
  /**
   * 强调色：悬停 / 选中态的色相与浓度
   */
  accent: ThemeTint;
  /**
   * 圆角基准值（rem）
   */
  radius: number;
  /**
   * 边框强度（0–1）：越大边框越清晰
   */
  border: number;
  /**
   * 界面字体
   */
  font: ThemeFont;
  /**
   * 根字号（px）：整体按 rem 缩放
   */
  fontSize: number;
  /**
   * 动效偏好；reduced 时全局关闭动画与过渡
   */
  motion: ThemeMotion;
  /**
   * 页面入场方式
   */
  pageTransition: PageTransition;
  /**
   * 页面入场 / 侧边栏过渡时长（ms）
   */
  motionDuration: number;
  /**
   * 动效缓动
   */
  motionEasing: MotionEasing;
}

/**
 * 内置色板（顺序即设置面板中的展示顺序）
 */
const PRESETS: readonly ThemePreset[] = [
  { id: "neutral", label: "中性", swatch: "--preset-neutral", hue: 250, chroma: 0.02 },
  { id: "blue", label: "远山蓝", swatch: "--preset-blue", hue: 260, chroma: 0.2 },
  { id: "indigo", label: "靛蓝", swatch: "--preset-indigo", hue: 275, chroma: 0.21 },
  { id: "violet", label: "紫罗兰", swatch: "--preset-violet", hue: 300, chroma: 0.22 },
  { id: "emerald", label: "青翠", swatch: "--preset-emerald", hue: 160, chroma: 0.15 },
  { id: "cyan", label: "湖青", swatch: "--preset-cyan", hue: 200, chroma: 0.14 },
  { id: "amber", label: "琥珀", swatch: "--preset-amber", hue: 65, chroma: 0.14 },
  { id: "orange", label: "暖橙", swatch: "--preset-orange", hue: 45, chroma: 0.17 },
  { id: "rose", label: "玫瑰", swatch: "--preset-rose", hue: 15, chroma: 0.18 },
];

/**
 * LocalStorage 持久化键
 */
const STORAGE_KEY = "theme";

/**
 * 品牌自定义色的最大彩度（强度 1 对应值）
 */
const PRIMARY_MAX_CHROMA = 0.3;

/**
 * 界面色调的最大彩度（保持克制，避免背景过饱和）
 */
const SURFACE_MAX_CHROMA = 0.03;

/**
 * 强调色的最大彩度
 */
const ACCENT_MAX_CHROMA = 0.08;

/**
 * 默认界面色调（冷灰）
 */
const DEFAULT_SURFACE: ThemeTint = { hue: 250, strength: 0.15 };

/**
 * 默认强调色（冷灰）
 */
const DEFAULT_ACCENT: ThemeTint = { hue: 250, strength: 0.05 };

/**
 * 默认配置：跟随系统、中性品牌色、冷灰界面、默认圆角
 */
const DEFAULT_CONFIG: ThemeConfig = {
  mode: "system",
  preset: "neutral",
  primary: null,
  surface: DEFAULT_SURFACE,
  accent: DEFAULT_ACCENT,
  radius: 0.625,
  border: 0.4,
  font: "geist",
  fontSize: 16,
  motion: "full",
  pageTransition: "slide",
  motionDuration: 200,
  motionEasing: "ease-out",
};

/**
 * 一键风格标识
 */
type ThemeStyleId = "default" | "minimal" | "paper" | "contrast" | "soft";

/**
 * 一键风格：只覆盖排版、圆角、边框与表面，不动品牌色和明暗模式
 */
interface ThemeStylePreset {
  /**
   * 风格标识
   */
  id: ThemeStyleId;
  /**
   * 显示名
   */
  label: string;
  /**
   * 覆盖的样式字段
   */
  config: Pick<ThemeConfig, "surface" | "accent" | "radius" | "border" | "font" | "fontSize" | "motion">;
}

/**
 * 内置一键风格
 */
const STYLE_PRESETS: readonly ThemeStylePreset[] = [
  {
    id: "default",
    label: "默认",
    config: {
      surface: { ...DEFAULT_SURFACE },
      accent: { ...DEFAULT_ACCENT },
      radius: 0.625,
      border: 0.4,
      font: "geist",
      fontSize: 16,
      motion: "full",
    },
  },
  {
    id: "minimal",
    label: "极简",
    config: {
      surface: { hue: 250, strength: 0.06 },
      accent: { hue: 250, strength: 0.02 },
      radius: 0.5,
      border: 0.25,
      font: "sans",
      fontSize: 16,
      motion: "full",
    },
  },
  {
    id: "paper",
    label: "纸感",
    config: {
      surface: { hue: 70, strength: 0.35 },
      accent: { hue: 70, strength: 0.08 },
      radius: 0.45,
      border: 0.55,
      font: "serif",
      fontSize: 16,
      motion: "full",
    },
  },
  {
    id: "contrast",
    label: "高对比",
    config: {
      surface: { hue: 250, strength: 0 },
      accent: { hue: 250, strength: 0 },
      radius: 0.5,
      border: 0.9,
      font: "sans",
      fontSize: 16,
      motion: "full",
    },
  },
  {
    id: "soft",
    label: "柔和",
    config: {
      surface: { hue: 250, strength: 0.3 },
      accent: { hue: 250, strength: 0.15 },
      radius: 1,
      border: 0.15,
      font: "geist",
      fontSize: 16,
      motion: "full",
    },
  },
];

/**
 * 把数值限制在闭区间内
 *
 * @param value - 原始值
 * @param min - 下限
 * @param max - 上限
 *
 * @returns 限制后的值
 */
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * 判断是否为合法主题模式
 *
 * @param value - 待判断值
 *
 * @returns 类型收窄结果
 */
const isThemeMode = (value: unknown): value is ThemeMode => value === "light" || value === "dark" || value === "system";

/**
 * 判断是否为合法色板标识
 *
 * @param value - 待判断值
 *
 * @returns 类型收窄结果
 */
const isPresetId = (value: unknown): value is ThemePresetId =>
  typeof value === "string" && PRESETS.some((preset) => preset.id === value);

/**
 * 判断是否为合法字体
 *
 * @param value - 待判断值
 *
 * @returns 类型收窄结果
 */
const isThemeFont = (value: unknown): value is ThemeFont =>
  typeof value === "string" && FONT_OPTIONS.some((font) => font.id === value);

/**
 * 判断是否为合法动效偏好
 *
 * @param value - 待判断值
 *
 * @returns 类型收窄结果
 */
const isThemeMotion = (value: unknown): value is ThemeMotion => value === "full" || value === "reduced";

/**
 * 解析色相 + 强度，非法值返回 null
 *
 * @param value - 持久化数据中的字段
 *
 * @returns 合法的色调配置或 null
 */
const parseTint = (value: unknown): ThemeTint | null => {
  if (!value || typeof value !== "object") return null;
  const { hue, strength } = value as Partial<ThemeTint>;
  if (typeof hue !== "number" || typeof strength !== "number") return null;
  return { hue: clamp(hue, 0, 360), strength: clamp(strength, 0, 1) };
};

/**
 * 兼容 v1 的 `{ hue, chroma }` 自定义主色
 *
 * @param value - 旧版 `custom` 字段
 *
 * @returns 新模型下的品牌色或 null
 */
const parseLegacyPrimary = (value: unknown): ThemeTint | null => {
  if (!value || typeof value !== "object") return null;
  const { hue, chroma } = value as { hue?: number; chroma?: number };
  if (typeof hue !== "number" || typeof chroma !== "number") return null;
  return { hue: clamp(hue, 0, 360), strength: clamp(chroma / PRIMARY_MAX_CHROMA, 0, 1) };
};

/**
 * 校验并补全任意来源的配置（v1 / v2 / 损坏数据）
 *
 * @param value - 待校验值
 *
 * @returns 完整的主题配置
 */
const normalizeConfig = (value: unknown): ThemeConfig => {
  const data = (value && typeof value === "object" ? value : {}) as Partial<ThemeConfig> & {
    custom?: unknown;
  };
  return {
    mode: isThemeMode(data.mode) ? data.mode : DEFAULT_CONFIG.mode,
    preset: isPresetId(data.preset) ? data.preset : DEFAULT_CONFIG.preset,
    primary: parseTint(data.primary) ?? parseLegacyPrimary(data.custom),
    surface: parseTint(data.surface) ?? { ...DEFAULT_SURFACE },
    accent: parseTint(data.accent) ?? { ...DEFAULT_ACCENT },
    radius: typeof data.radius === "number" ? clamp(data.radius, 0, 1.25) : DEFAULT_CONFIG.radius,
    border: typeof data.border === "number" ? clamp(data.border, 0, 1) : DEFAULT_CONFIG.border,
    font: isThemeFont(data.font) ? data.font : DEFAULT_CONFIG.font,
    fontSize: typeof data.fontSize === "number" ? clamp(data.fontSize, 14, 17) : DEFAULT_CONFIG.fontSize,
    motion: isThemeMotion(data.motion) ? data.motion : DEFAULT_CONFIG.motion,
    pageTransition:
      data.pageTransition === "fade"
      || data.pageTransition === "scale"
      || data.pageTransition === "none"
      || data.pageTransition === "slide"
        ? data.pageTransition
        : DEFAULT_CONFIG.pageTransition,
    motionDuration:
      typeof data.motionDuration === "number" ? clamp(data.motionDuration, 80, 800) : DEFAULT_CONFIG.motionDuration,
    motionEasing:
      data.motionEasing === "ease-in-out" || data.motionEasing === "linear" || data.motionEasing === "spring"
        ? data.motionEasing
        : DEFAULT_CONFIG.motionEasing,
  };
};

/**
 * 自定义品牌色需要覆盖的 token
 */
const CUSTOM_PRIMARY_PROPERTIES = [
  "--primary",
  "--primary-foreground",
  "--ring",
  "--sidebar-primary",
  "--sidebar-primary-foreground",
  "--sidebar-ring",
] as const;

/**
 * 应用自定义品牌色；无自定义时移除内联变量，回落到色板
 *
 * @param root - 文档根元素
 * @param primary - 自定义品牌色
 * @param dark - 是否暗色
 */
const applyPrimary = (root: HTMLElement, primary: ThemeTint | null, dark: boolean) => {
  if (!primary) {
    for (const property of CUSTOM_PRIMARY_PROPERTIES) root.style.removeProperty(property);
    return;
  }

  // 强度越高越压暗，保证高饱和青绿系上的白字仍有足够对比度
  const lightness = dark ? 0.7 : 0.51 - Math.max(0, primary.strength - 0.5) * 0.12;
  const color = `oklch(${lightness} ${primary.strength * PRIMARY_MAX_CHROMA} ${primary.hue})`;
  const foreground = dark ? "oklch(0.16 0 0)" : "oklch(0.985 0 0)";

  root.style.setProperty("--primary", color);
  root.style.setProperty("--primary-foreground", foreground);
  root.style.setProperty("--ring", color);
  root.style.setProperty("--sidebar-primary", color);
  root.style.setProperty("--sidebar-primary-foreground", foreground);
  root.style.setProperty("--sidebar-ring", color);
};

/**
 * 把主题配置应用到 `<html>`
 *
 * @param config - 主题配置
 * @param dark - 解析后的明暗结果
 */
const applyTheme = (config: ThemeConfig, dark: boolean) => {
  const root = document.documentElement;

  root.classList.toggle("dark", dark);
  // 中性色板走 :root / .dark 的默认值，不写 data-theme
  if (config.preset === "neutral") {
    root.removeAttribute("data-theme");
  } else {
    root.dataset.theme = config.preset;
  }
  root.style.colorScheme = dark ? "dark" : "light";
  root.style.setProperty("--radius", `${config.radius}rem`);
  root.style.setProperty("--border-strength", String(config.border));
  root.style.setProperty(
    "--app-font",
    FONT_OPTIONS.find((font) => font.id === config.font)?.stack ?? FONT_OPTIONS[0].stack,
  );
  root.style.fontSize = `${config.fontSize}px`;
  root.dataset.motion = config.motion;
  root.dataset.pageTransition = config.pageTransition;
  root.style.setProperty("--motion-duration", `${config.motionDuration}ms`);
  root.style.setProperty("--motion-ease", getEasingValue(config.motionEasing));
  // 图表色板跟随品牌色相，避免图表与主题脱节
  root.style.setProperty("--chart-h", String(config.primary?.hue ?? getPreset(config.preset).hue));
  root.style.setProperty("--surface-h", String(config.surface.hue));
  root.style.setProperty("--surface-c", (config.surface.strength * SURFACE_MAX_CHROMA).toFixed(4));
  root.style.setProperty("--accent-h", String(config.accent.hue));
  root.style.setProperty("--accent-c", (config.accent.strength * ACCENT_MAX_CHROMA).toFixed(4));
  applyPrimary(root, config.primary, dark);
};

/**
 * 按 id 查找色板
 *
 * @param id - 色板标识
 *
 * @returns 色板定义（找不到时回落到第一个）
 */
const getPreset = (id: ThemePresetId): ThemePreset => PRESETS.find((preset) => preset.id === id) ?? PRESETS[0];

export {
  ACCENT_MAX_CHROMA,
  DEFAULT_ACCENT,
  DEFAULT_CONFIG,
  FONT_OPTIONS,
  DEFAULT_SURFACE,
  PRESETS,
  PRIMARY_MAX_CHROMA,
  STYLE_PRESETS,
  MOTION_EASING_OPTIONS,
  STORAGE_KEY,
  SURFACE_MAX_CHROMA,
  applyTheme,
  getEasingValue,
  getPreset,
  normalizeConfig,
};
export type {
  ThemeConfig,
  ThemeFont,
  ThemeFontOption,
  ThemeMode,
  MotionEasing,
  PageTransition,
  ThemeMotion,
  ThemePreset,
  ThemePresetId,
  ThemeStyleId,
  ThemeStylePreset,
  ThemeTint,
};

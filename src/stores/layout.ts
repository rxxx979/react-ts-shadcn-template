import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * 侧边栏位置
 */
type SidebarSide = "left" | "right";

/**
 * 侧边栏视觉变体
 */
type SidebarVariant = "inset" | "floating" | "sidebar";

/**
 * 折叠方式（不支持 none：移动端需要抽屉，图标/抽屉已覆盖）
 */
type SidebarCollapsible = "icon" | "offcanvas";

/**
 * 内容区宽度
 */
type ContentWidth = "fluid" | "boxed";

/**
 * 顶栏材质
 */
type HeaderStyle = "glass" | "solid";

/**
 * 内容区背景纹理
 */
type BackgroundPattern = "none" | "dots" | "grid";

/**
 * 侧边栏配置
 */
interface LayoutConfig {
  /**
   * 停靠位置
   */
  side: SidebarSide;
  /**
   * 视觉变体
   */
  variant: SidebarVariant;
  /**
   * 折叠方式
   */
  collapsible: SidebarCollapsible;
  /**
   * 展开宽度（rem）
   */
  width: number;
  /**
   * 是否展开
   */
  open: boolean;
  /**
   * 内容区宽度
   */
  contentWidth: ContentWidth;
  /**
   * 顶栏材质
   */
  headerStyle: HeaderStyle;
  /**
   * 内容区背景纹理
   */
  pattern: BackgroundPattern;
}

/**
 * 侧边栏动作
 */
interface LayoutActions {
  setSide: (side: SidebarSide) => void;
  setVariant: (variant: SidebarVariant) => void;
  setCollapsible: (collapsible: SidebarCollapsible) => void;
  setWidth: (width: number) => void;
  setOpen: (open: boolean) => void;
  setContentWidth: (contentWidth: ContentWidth) => void;
  setHeaderStyle: (headerStyle: HeaderStyle) => void;
  /**
   * 设置背景纹理
   */
  setPattern: (pattern: BackgroundPattern) => void;
  /**
   * 导入布局配置
   */
  importConfig: (config: unknown) => void;
  resetLayout: () => void;
}

/**
 * 布局 store
 */
type LayoutStore = LayoutConfig & LayoutActions;

/**
 * 默认布局：左侧、内嵌变体、图标折叠、16rem、展开
 */
const DEFAULT_LAYOUT: LayoutConfig = {
  side: "left",
  variant: "inset",
  collapsible: "icon",
  width: 16,
  open: true,
  contentWidth: "fluid",
  headerStyle: "glass",
  pattern: "none",
};

/**
 * 限制数值范围
 */
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * 校验持久化配置
 */
const normalizeConfig = (value: unknown): LayoutConfig => {
  const data = (value && typeof value === "object" ? value : {}) as Partial<LayoutConfig>;
  return {
    side: data.side === "right" ? "right" : DEFAULT_LAYOUT.side,
    variant: data.variant === "floating" || data.variant === "sidebar" ? data.variant : DEFAULT_LAYOUT.variant,
    collapsible: data.collapsible === "offcanvas" ? "offcanvas" : DEFAULT_LAYOUT.collapsible,
    width: typeof data.width === "number" ? clamp(data.width, 14, 22) : DEFAULT_LAYOUT.width,
    open: typeof data.open === "boolean" ? data.open : DEFAULT_LAYOUT.open,
    contentWidth: data.contentWidth === "boxed" ? "boxed" : DEFAULT_LAYOUT.contentWidth,
    headerStyle: data.headerStyle === "solid" ? "solid" : DEFAULT_LAYOUT.headerStyle,
    pattern: data.pattern === "dots" || data.pattern === "grid" ? data.pattern : DEFAULT_LAYOUT.pattern,
  };
};

/**
 * 侧边栏布局 store：独立于主题持久化
 */
const useLayoutStore = create<LayoutStore>()(
  persist(
    (set) => ({
      ...DEFAULT_LAYOUT,
      setSide: (side) => {
        set({ side });
      },
      setVariant: (variant) => {
        set({ variant });
      },
      setCollapsible: (collapsible) => {
        set({ collapsible });
      },
      setWidth: (width) => {
        set({ width: clamp(width, 14, 22) });
      },
      setOpen: (open) => {
        set({ open });
      },
      setContentWidth: (contentWidth) => {
        set({ contentWidth });
      },
      setHeaderStyle: (headerStyle) => {
        set({ headerStyle });
      },
      setPattern: (pattern) => {
        set({ pattern });
      },
      importConfig: (config) => {
        set(normalizeConfig(config));
      },
      resetLayout: () => {
        set({ ...DEFAULT_LAYOUT });
      },
    }),
    {
      name: "layout",
      version: 4,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        side: state.side,
        variant: state.variant,
        collapsible: state.collapsible,
        width: state.width,
        open: state.open,
        contentWidth: state.contentWidth,
        headerStyle: state.headerStyle,
        pattern: state.pattern,
      }),
      migrate: (persisted, version) => {
        const config = normalizeConfig(persisted);
        // 旧版默认值为 18rem；自动收窄到新的 16rem，手动调过的其他宽度保留
        if (version < 4 && config.width === 18) config.width = DEFAULT_LAYOUT.width;
        return config;
      },
      merge: (persisted, current) => ({ ...current, ...normalizeConfig(persisted) }),
    },
  ),
);

export { useLayoutStore };
export type {
  BackgroundPattern,
  ContentWidth,
  HeaderStyle,
  LayoutConfig,
  SidebarCollapsible,
  SidebarSide,
  SidebarVariant,
};

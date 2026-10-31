import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { APP_NAME } from "@/lib/env";

/**
 * 应用级配置：品牌信息与界面区块可见性
 */
interface AppConfig {
  /**
   * 应用显示名（品牌块、页脚、首页与文档标题）
   */
  appName: string;
  /**
   * 品牌副标题（留空则隐藏）
   */
  appTagline: string;
  /**
   * 是否显示顶栏面包屑
   */
  showBreadcrumb: boolean;
  /**
   * 是否显示页面页脚
   */
  showFooter: boolean;
  /**
   * 是否显示侧边栏底部用户块
   */
  showSidebarFooter: boolean;
}

/**
 * 应用配置动作
 */
interface AppActions {
  setAppName: (appName: string) => void;
  setAppTagline: (appTagline: string) => void;
  setShowBreadcrumb: (show: boolean) => void;
  setShowFooter: (show: boolean) => void;
  setShowSidebarFooter: (show: boolean) => void;
  /**
   * 导入应用配置
   */
  importConfig: (config: unknown) => void;
  resetApp: () => void;
}

/**
 * 应用 store
 */
type AppStore = AppConfig & AppActions;

/**
 * 默认应用配置
 */
const DEFAULT_APP: AppConfig = {
  appName: APP_NAME,
  appTagline: "管理后台",
  showBreadcrumb: true,
  showFooter: true,
  showSidebarFooter: true,
};

/**
 * 校验持久化配置
 */
const normalizeConfig = (value: unknown): AppConfig => {
  const data = (value && typeof value === "object" ? value : {}) as Partial<AppConfig>;
  return {
    appName: typeof data.appName === "string" && data.appName.trim() ? data.appName.slice(0, 40) : DEFAULT_APP.appName,
    appTagline: typeof data.appTagline === "string" ? data.appTagline.slice(0, 60) : DEFAULT_APP.appTagline,
    showBreadcrumb: typeof data.showBreadcrumb === "boolean" ? data.showBreadcrumb : DEFAULT_APP.showBreadcrumb,
    showFooter: typeof data.showFooter === "boolean" ? data.showFooter : DEFAULT_APP.showFooter,
    showSidebarFooter:
      typeof data.showSidebarFooter === "boolean" ? data.showSidebarFooter : DEFAULT_APP.showSidebarFooter,
  };
};

/**
 * 应用配置 store：品牌与界面可见性
 */
const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...DEFAULT_APP,
      setAppName: (appName) => {
        set({ appName: appName.slice(0, 40) });
      },
      setAppTagline: (appTagline) => {
        set({ appTagline: appTagline.slice(0, 60) });
      },
      setShowBreadcrumb: (showBreadcrumb) => {
        set({ showBreadcrumb });
      },
      setShowFooter: (showFooter) => {
        set({ showFooter });
      },
      setShowSidebarFooter: (showSidebarFooter) => {
        set({ showSidebarFooter });
      },
      importConfig: (config) => {
        set(normalizeConfig(config));
      },
      resetApp: () => {
        set({ ...DEFAULT_APP });
      },
    }),
    {
      name: "app",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        appName: state.appName,
        appTagline: state.appTagline,
        showBreadcrumb: state.showBreadcrumb,
        showFooter: state.showFooter,
        showSidebarFooter: state.showSidebarFooter,
      }),
      migrate: (persisted) => normalizeConfig(persisted),
      merge: (persisted, current) => ({ ...current, ...normalizeConfig(persisted) }),
    },
  ),
);

export { useAppStore };
export type { AppConfig };

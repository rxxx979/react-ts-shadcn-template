import { BoxesIcon, ComponentIcon, HomeIcon } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * 导航项元信息：与 router / Layout 解耦，避免循环导入
 */
interface NavigationEntry {
  path: string;
  title: string;
  breadcrumb: string;
  icon: LucideIcon;
}

const NAVIGATION = {
  home: { path: "/", title: "首页", breadcrumb: "首页", icon: HomeIcon },
  components: { path: "/components", title: "组件", breadcrumb: "组件", icon: ComponentIcon },
  stack: { path: "/stack", title: "技术栈", breadcrumb: "技术栈", icon: BoxesIcon },
} satisfies Record<string, NavigationEntry>;

const NAV_ENTRIES = [NAVIGATION.home, NAVIGATION.components, NAVIGATION.stack];

export { NAVIGATION, NAV_ENTRIES };
export type { NavigationEntry };

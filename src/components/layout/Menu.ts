import type { ReactNode } from "react";

import type { NavigationEntry } from "@/router/navigation";

/**
 * 菜单项：导航渲染的数据契约
 */
interface NavItem {
  /**
   * 菜单名
   */
  title: string;
  /**
   * 跳转地址
   */
  url: string;
  /**
   * 菜单图标
   */
  icon?: ReactNode;
  /**
   * 有 items 的项渲染为可折叠分组，否则渲染为直链
   */
  items?: NavItem[];
  /**
   * 本项为分组标签节：title 显示为节标签，items 渲染为节内菜单项
   */
  section?: boolean;
}

/**
 * 菜单节：连续的无标签项归入同一节
 */
interface NavSection {
  /**
   * 节标签（undefined 表示无标签节）
   */
  label?: string;
  /**
   * 节内菜单项
   */
  items: NavItem[];
}

/**
 * 导航配置 → 侧边栏菜单数据
 *
 * 不依赖 router，避免 Layout → Aside → menu → router → Layout 的循环导入。
 *
 * @returns 菜单项列表
 */
const buildNavItems = (entries: readonly NavigationEntry[]): NavItem[] =>
  entries.map((entry) => ({
    title: entry.title,
    url: entry.path,
    icon: entry.icon,
  }));

/**
 * 菜单项 → 菜单节
 *
 * 分节规则：section 项开启一个带标签的新节，其后的普通项归入该节； 连续的无标签项归入同一个无标签节。
 *
 * @param items - 扁平菜单项（来自 {@link buildNavItems}）
 *
 * @returns 可直接渲染的菜单节列表
 */
const splitSections = (items: NavItem[]): NavSection[] => {
  const sections: NavSection[] = [];
  for (const item of items) {
    if (item.section) {
      sections.push({ label: item.title, items: item.items ?? [] });
    } else if (sections.length > 0 && !sections.at(-1)?.label) {
      sections.at(-1)?.items.push(item);
    } else {
      sections.push({ items: [item] });
    }
  }
  return sections;
};

export { buildNavItems, splitSections };
export type { NavItem, NavSection };

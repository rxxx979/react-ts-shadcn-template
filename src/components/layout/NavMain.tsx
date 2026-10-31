import { cn } from "cn";
import { ChevronRightIcon } from "lucide-react";
import { Link, useLocation } from "react-router";

import { splitSections } from "@/components/layout/Menu";
import type { NavItem } from "@/components/layout/Menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";

/**
 * 折叠态激活项的主色实心块样式（与品牌块同设计语言），展开态维持浅色高亮
 */
const activeTileClasses =
  "group-data-[collapsible=icon]:data-active:bg-sidebar-primary group-data-[collapsible=icon]:data-active:text-sidebar-primary-foreground group-data-[collapsible=icon]:data-active:hover:bg-sidebar-primary group-data-[collapsible=icon]:data-active:hover:text-sidebar-primary-foreground";

const renderLink = (to: string) => <Link to={to} />;
const renderMenuButton = (tooltip: string) => <SidebarMenuButton tooltip={tooltip} />;
const sidebarMenuItem = <SidebarMenuItem />;

/**
 * 单个菜单项，三种形态按序判定：
 *
 * 1. 无子项 → 直链
 * 2. 有子项且侧边栏折叠为 icon → 点击弹出下拉浮层
 * 3. 有子项且展开 → 可折叠分组（就地展开二级菜单）
 *
 * @param props.item - 菜单项
 * @param props.pathname - 当前路径（驱动高亮与默认展开）
 * @param props.collapsed - 侧边栏是否处于 icon 折叠态
 */
const NavMenuItem = ({ item, pathname, collapsed }: { item: NavItem; pathname: string; collapsed: boolean }) => {
  if (!item.items?.length) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          render={renderLink(item.url)}
          isActive={item.url === pathname}
          tooltip={item.title}
          className={activeTileClasses}
        >
          {item.icon}
          <span>{item.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  if (collapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger render={renderMenuButton(item.title)}>
          {item.icon}
          <span>{item.title}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" sideOffset={8} className="w-fit min-w-24">
          {item.items.map((subItem) => (
            <DropdownMenuItem
              key={subItem.title}
              render={renderLink(subItem.url)}
              className={cn(
                "data-highlighted:bg-accent data-highlighted:text-accent-foreground",
                subItem.url === pathname && "bg-accent font-medium",
              )}
            >
              {subItem.icon}
              <span>{subItem.title}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Collapsible
      defaultOpen={item.items.some((subItem) => subItem.url === pathname)}
      className="group/collapsible"
      render={sidebarMenuItem}
    >
      <CollapsibleTrigger render={renderMenuButton(item.title)}>
        {item.icon}
        <span>{item.title}</span>
        <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          {item.items.map((subItem) => (
            <SidebarMenuSubItem key={subItem.title}>
              <SidebarMenuSubButton render={renderLink(subItem.url)} isActive={subItem.url === pathname}>
                {subItem.icon}
                <span>{subItem.title}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
};

/**
 * 侧边栏主菜单：按菜单节分组渲染（节标签 / 折叠态分组短线）
 *
 * @param props.items - 菜单项（来自 `buildNavItems()`）
 */
const NavMain = ({ items }: { items: NavItem[] }) => {
  const { pathname } = useLocation();
  const { state, isMobile } = useSidebar();
  // 折叠为 icon 模式时就地展开的二级菜单会被隐藏，改为点击弹出下拉浮层
  const collapsed = state === "collapsed" && !isMobile;

  return (
    <>
      {splitSections(items).map((section, index) => (
        <SidebarGroup
          key={section.label ?? index}
          className={cn(
            "group-data-[collapsible=icon]:p-1",
            // 折叠态标签隐藏后，用居中短线代替文字标签表达分组
            section.label
              && "group-data-[collapsible=icon]:before:absolute group-data-[collapsible=icon]:before:top-0 group-data-[collapsible=icon]:before:left-1/2 group-data-[collapsible=icon]:before:h-px group-data-[collapsible=icon]:before:w-6 group-data-[collapsible=icon]:before:-translate-x-1/2 group-data-[collapsible=icon]:before:bg-sidebar-border",
          )}
        >
          {section.label && <SidebarGroupLabel>{section.label}</SidebarGroupLabel>}
          <SidebarMenu>
            {section.items.map((item) => (
              <NavMenuItem key={item.title} item={item} pathname={pathname} collapsed={collapsed} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
};

export { NavMain };

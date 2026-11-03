import { ChevronsUpDownIcon, GalleryVerticalEndIcon, LogOutIcon, SearchIcon } from "lucide-react";
import { useMemo } from "react";
import type { ComponentProps } from "react";
import { Link, useSubmit } from "react-router";

import { buildNavItems } from "@/components/layout/Menu";
import { ThemeMenu } from "@/components/theme/ThemeMenu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Kbd } from "@/components/ui/kbd";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useNavigation } from "@/hooks/use-navigation";
import { ROLE_LABELS } from "@/lib/auth";
import { useAppStore } from "@/stores/app";
import { useAuthStore } from "@/stores/auth";

import { NavMain } from "./NavMain";

const brandLink = <Link to="/" />;

/**
 * 侧边栏底部用户块：头像 + 名称，点击弹出操作菜单
 *
 * 菜单内含主题快捷设置（模式 / 色板）与外观设置面板入口；「退出登录」为占位（见 TODO）
 */
const AsideFooter = () => {
  const user = useAuthStore((state) => state.user);
  const submit = useSubmit();
  const trigger = useMemo(
    () =>
      user ? (
        <SidebarMenuButton
          size="lg"
          tooltip={user.name}
          className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
        />
      ) : null,
    [user],
  );

  if (!user || !trigger) {
    return null;
  }

  const handleLogout = () => {
    void submit(null, { method: "post", action: "/logout" });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger render={trigger}>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-full text-sm font-medium">
              {user.name.charAt(0)}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user.name}</span>
              <span className="text-sidebar-foreground/70 truncate text-xs">
                {ROLE_LABELS[user.role]} · {user.email}
              </span>
            </div>
            <ChevronsUpDownIcon className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="end" sideOffset={8} className="min-w-52">
            <ThemeMenu />
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOutIcon />
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
/**
 * 左侧边栏（inset 变体，可折叠为 icon）：品牌块 + 路由菜单 + 底部用户块
 *
 * @param props - 透传给 shadcn `Sidebar` 的属性
 */
interface AsideProps extends ComponentProps<typeof Sidebar> {
  onOpenCommand?: () => void;
}

const Aside = ({ onOpenCommand, ...props }: AsideProps) => {
  const appName = useAppStore((state) => state.appName) || "Shadcn Admin";
  const appTagline = useAppStore((state) => state.appTagline);
  const showSidebarFooter = useAppStore((state) => state.showSidebarFooter);
  const navigation = useNavigation();

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={brandLink} tooltip={appName}>
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <GalleryVerticalEndIcon />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{appName}</span>
                {appTagline && <span className="text-sidebar-foreground/70 truncate text-xs">{appTagline}</span>}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <button
          type="button"
          title="搜索 (⌘K)"
          aria-label="搜索"
          onClick={() => onOpenCommand?.()}
          className="bg-sidebar-accent/50 hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground border-sidebar-border/60 flex h-8 w-full items-center gap-2 rounded-md border px-2 text-xs transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        >
          <SearchIcon className="size-3.5 shrink-0" />
          <span className="truncate group-data-[collapsible=icon]:hidden">搜索</span>
          <Kbd className="ml-auto group-data-[collapsible=icon]:hidden">⌘K</Kbd>
        </button>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={buildNavItems(navigation)} />
      </SidebarContent>
      {showSidebarFooter && (
        <SidebarFooter>
          <AsideFooter />
        </SidebarFooter>
      )}
      <SidebarRail />
    </Sidebar>
  );
};

export { Aside };

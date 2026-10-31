import { cn } from "cn";
import { SearchIcon } from "lucide-react";
import { Link, useMatches } from "react-router";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { Handler } from "@/router";
import { useAppStore } from "@/stores/app";
import { useLayoutStore } from "@/stores/layout";

const renderCrumbLink = (to: string) => <Link to={to} />;
const isHandler = (value: unknown): value is Handler =>
  typeof value === "object" && value !== null && "breadcrumb" in value;

/**
 * 吸顶顶栏：侧边栏折叠按钮 + 面包屑（数据取自路由 handle.breadcrumb）
 *
 * Rounded-t 与 inset 卡片圆角对齐；内容滚动时追加轻阴影强化层级
 */
const Header = ({ onOpenCommand, scrolled = false }: { onOpenCommand?: () => void; scrolled?: boolean }) => {
  const showBreadcrumb = useAppStore((state) => state.showBreadcrumb);
  const headerStyle = useLayoutStore((state) => state.headerStyle);
  const crumbs = useMatches()
    .map((match) => ({ label: isHandler(match.handle) ? match.handle.breadcrumb : undefined, to: match.pathname }))
    .filter((crumb) => crumb.label !== undefined);

  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex h-(--header-height) shrink-0 items-center gap-2 px-3 transition-shadow after:pointer-events-none after:absolute after:right-0 after:bottom-0 after:left-0 after:h-px after:bg-linear-to-r after:from-border/70 after:via-border/40 after:to-transparent md:rounded-t-xl",
        headerStyle === "glass" ? "glass-header" : "bg-background",
        scrolled && "shadow-sm",
      )}
    >
      <SidebarTrigger className="-ml-1" />
      {showBreadcrumb && (
        <>
          <div className="bg-border h-4 w-px" />
          <Breadcrumb>
            <BreadcrumbList>
              {crumbs.map((crumb, index) => (
                <BreadcrumbItem key={crumb.to}>
                  {index > 0 && <BreadcrumbSeparator />}
                  {index === crumbs.length - 1 ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink render={renderCrumbLink(crumb.to)}>{crumb.label}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </>
      )}
      <div className="ml-auto flex items-center gap-1 md:hidden">
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground"
          aria-label="打开命令面板"
          onClick={() => onOpenCommand?.()}
        >
          <SearchIcon />
        </Button>
      </div>
    </header>
  );
};

export { Header };

import { useHotkeys } from "@mantine/hooks";
import { cn } from "cn";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cssVars } from "@/lib/css";
import { useAppStore } from "@/stores/app";
import { useLayoutStore } from "@/stores/layout";

import { Aside } from "./Aside";
import { CommandPalette } from "./CommandPalette";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Main } from "./Main";

const getSidebarStyle = (width: number, showFooter: boolean): CSSProperties =>
  cssVars({
    "--sidebar-width": `${width}rem`,
    "--header-height": "calc(var(--spacing) * 12)",
    "--footer-height": showFooter ? "calc(var(--spacing) * 11)" : "0px",
  });

/**
 * 页面骨架：TooltipProvider + SidebarProvider，组合 Aside 与 Header / Main / Footer
 *
 * 侧边栏的位置、变体、折叠方式、宽度与展开状态来自 `stores/layout.ts`，可运行时调整。
 */
const Layout = () => {
  const side = useLayoutStore((state) => state.side);
  const variant = useLayoutStore((state) => state.variant);
  const collapsible = useLayoutStore((state) => state.collapsible);
  const width = useLayoutStore((state) => state.width);
  const open = useLayoutStore((state) => state.open);
  const setOpen = useLayoutStore((state) => state.setOpen);
  const appName = useAppStore((state) => state.appName) || "Shadcn Admin";
  const showFooter = useAppStore((state) => state.showFooter);
  const [commandOpen, setCommandOpen] = useState(false);
  const openCommand = () => setCommandOpen(true);

  useHotkeys([["mod+K", () => setCommandOpen((open) => !open)]]);

  // 应用名同步到文档标题（首帧由 index.html 内联脚本处理）
  useEffect(() => {
    document.title = appName;
  }, [appName]);

  const inset = (
    <SidebarInset
      className={cn(
        "min-h-0 overflow-hidden",
        // 右侧停靠时 Aside 位于末尾，无法命中 peer 规则的 inset 间距，这里显式补齐
        side === "right" && variant === "inset" && "md:m-2 md:mr-0",
      )}
    >
      <Header onOpenCommand={() => openCommand()} />
      <Main />
      {showFooter && <Footer />}
    </SidebarInset>
  );

  return (
    <TooltipProvider>
      <SidebarProvider
        open={open}
        onOpenChange={(nextOpen) => setOpen(nextOpen)}
        className="h-svh min-h-0 overflow-hidden"
        style={getSidebarStyle(width, showFooter)}
      >
        {side === "left" ? (
          <>
            <Aside side={side} variant={variant} collapsible={collapsible} onOpenCommand={() => openCommand()} />
            {inset}
          </>
        ) : (
          <>
            {inset}
            <Aside side={side} variant={variant} collapsible={collapsible} onOpenCommand={() => openCommand()} />
          </>
        )}
      </SidebarProvider>
      <CommandPalette open={commandOpen} onOpenChange={(nextOpen) => setCommandOpen(nextOpen)} />
    </TooltipProvider>
  );
};

export { Layout };

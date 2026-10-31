import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useThemeStore } from "@/stores/theme";

import { ThemePanel } from "./ThemePanel";

/**
 * 全局外观设置抽屉：开关状态存在 zustand 中，菜单与快捷键都可打开
 */
const ThemeSheet = () => {
  const panelOpen = useThemeStore((state) => state.panelOpen);
  const setPanelOpen = useThemeStore((state) => state.setPanelOpen);

  return (
    <Sheet open={panelOpen} onOpenChange={(nextOpen) => setPanelOpen(nextOpen)}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>外观与布局</SheetTitle>
          <SheetDescription>
            品牌、配色、排版、动效与侧边栏实时生效，配置保存在本地。按 ⌥⌘T 可随时打开。
          </SheetDescription>
        </SheetHeader>
        <ThemePanel />
      </SheetContent>
    </Sheet>
  );
};

export { ThemeSheet };

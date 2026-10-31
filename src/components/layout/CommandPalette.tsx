import {
  BoxesIcon,
  ComponentIcon,
  HomeIcon,
  MonitorIcon,
  MoonIcon,
  PaletteIcon,
  PanelLeftIcon,
  SunIcon,
} from "lucide-react";
import { useNavigate } from "react-router";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";
import { useLayoutStore } from "@/stores/layout";
import { useThemeStore } from "@/stores/theme";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * 全局命令面板（⌘K）：页面跳转、主题模式、外观面板与侧边栏操作
 */
const CommandPalette = ({ open, onOpenChange }: CommandPaletteProps) => {
  const navigate = useNavigate();
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);
  const setPanelOpen = useThemeStore((state) => state.setPanelOpen);
  const sidebarOpen = useLayoutStore((state) => state.open);
  const setSidebarOpen = useLayoutStore((state) => state.setOpen);

  const close = () => onOpenChange(false);

  const go = (path: string) => {
    void navigate(path);
    close();
  };

  const chooseMode = (next: typeof mode) => {
    setMode(next);
    close();
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={(nextOpen) => onOpenChange(nextOpen)}
      title="命令面板"
      description="搜索页面、切换主题或执行操作"
      className="sm:max-w-lg"
    >
      <CommandInput placeholder="搜索页面、主题或操作…" />
      <CommandList className="max-h-96">
        <CommandEmpty>没有找到匹配项。</CommandEmpty>

        <CommandGroup heading="页面">
          <CommandItem value="首页 home" onSelect={() => go("/")}>
            <HomeIcon />
            首页
          </CommandItem>
          <CommandItem value="组件 components" onSelect={() => go("/components")}>
            <ComponentIcon />
            组件库
          </CommandItem>
          <CommandItem value="技术栈 stack dependencies" onSelect={() => go("/stack")}>
            <BoxesIcon />
            技术栈
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="外观">
          <CommandItem value="浅色 light mode" data-checked={mode === "light"} onSelect={() => chooseMode("light")}>
            <SunIcon />
            浅色
          </CommandItem>
          <CommandItem value="深色 dark mode" data-checked={mode === "dark"} onSelect={() => chooseMode("dark")}>
            <MoonIcon />
            深色
          </CommandItem>
          <CommandItem
            value="跟随系统 system mode"
            data-checked={mode === "system"}
            onSelect={() => chooseMode("system")}
          >
            <MonitorIcon />
            跟随系统
          </CommandItem>
          <CommandItem
            value="外观与布局 appearance theme layout"
            onSelect={() => {
              setPanelOpen(true);
              close();
            }}
          >
            <PaletteIcon />
            外观与布局
            <CommandShortcut>⌥⌘T</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="布局">
          <CommandItem
            value="侧边栏 sidebar toggle"
            onSelect={() => {
              setSidebarOpen(!sidebarOpen);
              close();
            }}
          >
            <PanelLeftIcon />
            {sidebarOpen ? "收起侧边栏" : "展开侧边栏"}
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>

      <div className="text-muted-foreground flex items-center justify-between border-t px-3 py-2 text-[11px]">
        <span>↑↓ 选择 · ↵ 打开 · esc 关闭</span>
        <Kbd>⌘K</Kbd>
      </div>
    </CommandDialog>
  );
};

export { CommandPalette };

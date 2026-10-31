import { MonitorIcon, MoonIcon, PaletteIcon, SlidersHorizontalIcon, SunIcon } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/use-theme";
import { PRESETS } from "@/lib/theme";
import type { ThemeMode, ThemePresetId } from "@/lib/theme";

const getSwatchStyle = (swatch: string): CSSProperties => ({ backgroundColor: `var(${swatch})` });
const isThemeMode = (value: string): value is ThemeMode => MODE_OPTIONS.some((option) => option.value === value);
const isThemePreset = (value: string): value is ThemePresetId => PRESETS.some((preset) => preset.id === value);

/**
 * 明暗模式选项
 */
const MODE_OPTIONS: Array<{ value: ThemeMode; label: string; icon: ReactNode }> = [
  { value: "light", label: "浅色", icon: <SunIcon /> },
  { value: "dark", label: "深色", icon: <MoonIcon /> },
  { value: "system", label: "跟随系统", icon: <MonitorIcon /> },
];

/**
 * 侧边栏用户菜单中的主题快捷设置：模式、色板与外观面板入口
 */
const ThemeMenu = () => {
  const { mode, preset, primary, setMode, setPreset, setPanelOpen } = useTheme();

  return (
    <>
      <DropdownMenuGroup>
        <DropdownMenuLabel>主题</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={mode}
          onValueChange={(value) => {
            if (typeof value === "string" && isThemeMode(value)) setMode(value);
          }}
        >
          {MODE_OPTIONS.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value} closeOnClick={false}>
              {option.icon}
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      <DropdownMenuGroup>
        <DropdownMenuLabel className="flex items-center gap-1.5">
          <PaletteIcon className="size-3" />
          色板
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={primary ? "" : preset}
          onValueChange={(value) => {
            if (typeof value === "string" && isThemePreset(value)) setPreset(value);
          }}
        >
          {PRESETS.map((item) => (
            <DropdownMenuRadioItem key={item.id} value={item.id} closeOnClick={false}>
              <span
                aria-hidden
                className="ring-foreground/15 size-3 rounded-full ring-1"
                style={getSwatchStyle(item.swatch)}
              />
              {item.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuGroup>

      <DropdownMenuSeparator />

      <DropdownMenuItem onClick={() => setPanelOpen(true)}>
        <SlidersHorizontalIcon />
        外观与布局…
        <DropdownMenuShortcut>⌥⌘T</DropdownMenuShortcut>
      </DropdownMenuItem>
    </>
  );
};

export { ThemeMenu };

import { useDebouncedCallback } from "@mantine/hooks";
import { cn } from "cn";
import {
  CheckIcon,
  CopyIcon,
  GalleryVerticalEndIcon,
  MonitorIcon,
  MoonIcon,
  RotateCcwIcon,
  SunIcon,
} from "lucide-react";
import type { CSSProperties, ComponentProps, ReactNode } from "react";
import { useId, useRef, useState } from "react";

import { OverlayScrollbar } from "@/components/OverlayScrollbar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SheetFooter } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "@/hooks/use-theme";
import {
  ACCENT_MAX_CHROMA,
  FONT_OPTIONS,
  MOTION_EASING_OPTIONS,
  PRESETS,
  PRIMARY_MAX_CHROMA,
  STYLE_PRESETS,
  SURFACE_MAX_CHROMA,
  getPreset,
} from "@/lib/theme";
import type { PageTransition, ThemeMode } from "@/lib/theme";
import { useAppStore } from "@/stores/app";
import { useLayoutStore } from "@/stores/layout";
import type {
  BackgroundPattern,
  ContentWidth,
  HeaderStyle,
  SidebarCollapsible,
  SidebarSide,
  SidebarVariant,
} from "@/stores/layout";

const singleValue = (value: number): number[] => [value];
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const getSwatchStyle = (swatch: string): CSSProperties => ({ backgroundColor: `var(${swatch})` });
const getChipStyle = (color: string): CSSProperties => ({ backgroundColor: color });
const cancelDialogButton = (
  <Button variant="outline" size="sm">
    取消
  </Button>
);

/**
 * 明暗模式选项
 */
const MODE_OPTIONS: Array<{ value: ThemeMode; label: string; icon: ReactNode }> = [
  { value: "light", label: "浅色", icon: <SunIcon /> },
  { value: "dark", label: "深色", icon: <MoonIcon /> },
  { value: "system", label: "跟随系统", icon: <MonitorIcon /> },
];

/**
 * 侧边栏位置选项
 */
const SIDE_OPTIONS: Array<{ value: SidebarSide; label: string }> = [
  { value: "left", label: "左侧" },
  { value: "right", label: "右侧" },
];

/**
 * 侧边栏变体选项
 */
const VARIANT_OPTIONS: Array<{ value: SidebarVariant; label: string }> = [
  { value: "inset", label: "内嵌" },
  { value: "floating", label: "浮动" },
  { value: "sidebar", label: "标准" },
];

/**
 * 折叠方式选项
 */
const COLLAPSIBLE_OPTIONS: Array<{ value: SidebarCollapsible; label: string }> = [
  { value: "icon", label: "图标" },
  { value: "offcanvas", label: "抽屉" },
];

/**
 * 页面入场选项
 */
const PAGE_TRANSITION_OPTIONS: Array<{ value: PageTransition; label: string }> = [
  { value: "fade", label: "淡入" },
  { value: "slide", label: "上浮" },
  { value: "scale", label: "缩放" },
  { value: "none", label: "无" },
];

/**
 * 内容宽度选项
 */
const CONTENT_WIDTH_OPTIONS: Array<{ value: ContentWidth; label: string }> = [
  { value: "fluid", label: "流式" },
  { value: "boxed", label: "盒式" },
];

/**
 * 顶栏材质选项
 */
const HEADER_STYLE_OPTIONS: Array<{ value: HeaderStyle; label: string }> = [
  { value: "glass", label: "毛玻璃" },
  { value: "solid", label: "纯色" },
];

/**
 * 背景纹理选项
 */
const PATTERN_OPTIONS: Array<{ value: BackgroundPattern; label: string }> = [
  { value: "none", label: "无" },
  { value: "dots", label: "点阵" },
  { value: "grid", label: "网格" },
];

/**
 * 强度 / 圆角滑块使用中性填充：避免所有滑块都沿用品牌色
 */
const neutralSliderClasses =
  "[&_[data-slot=slider-range]]:bg-foreground/20 [&_[data-slot=slider-thumb]]:border-foreground/30";

/**
 * 色相滑块的彩虹轨道（覆盖组件默认底色与区间填充）
 */
const hueTrackClasses =
  "[&_[data-slot=slider-range]]:bg-transparent [&_[data-slot=slider-track]]:bg-[linear-gradient(to_right,oklch(0.65_0.18_0),oklch(0.65_0.18_60),oklch(0.65_0.18_120),oklch(0.65_0.18_180),oklch(0.65_0.18_240),oklch(0.65_0.18_300),oklch(0.65_0.18_360))]";

/**
 * 读取单值滑块的数值（base-ui 的 value 可能是标量，也可能是数组）
 *
 * @param value - 滑块回调值
 *
 * @returns 第一个数值
 */
const firstValue = (value: number | readonly number[]) => (typeof value === "number" ? value : value[0]);

/**
 * 滑块行：左侧标签、右侧数值，下方滑块
 */
type SliderRowProps = Omit<ComponentProps<typeof Slider>, "children"> & {
  /**
   * 左侧标签
   */
  label: string;
  /**
   * 右侧展示值
   */
  display: string;
};

const SliderRow = ({ label, display, ...props }: SliderRowProps) => (
  <div className="space-y-1.5">
    <div className="text-muted-foreground flex items-center justify-between text-xs">
      <span>{label}</span>
      <span className="tabular-nums">{display}</span>
    </div>
    <Slider {...props} />
  </div>
);

/**
 * 一组「色相 + 强度」控制
 *
 * @param props.name - 无障碍名称前缀
 * @param props.hue - 当前色相
 * @param props.strength - 当前强度（0–1）
 * @param props.onHueChange - 色相变更
 * @param props.onStrengthChange - 强度变更
 */
const TintControls = ({
  name,
  hue,
  strength,
  onHueChange,
  onStrengthChange,
}: {
  name: string;
  hue: number;
  strength: number;
  onHueChange: (hue: number) => void;
  onStrengthChange: (strength: number) => void;
}) => (
  <>
    <SliderRow
      label="色相"
      display={`${Math.round(hue)}°`}
      aria-label={`${name}色相`}
      value={singleValue(hue)}
      min={0}
      max={360}
      step={1}
      className={hueTrackClasses}
      onValueChange={(value) => onHueChange(firstValue(value))}
    />
    <SliderRow
      label="强度"
      display={`${Math.round(strength * 100)}%`}
      aria-label={`${name}强度`}
      value={singleValue(strength)}
      min={0}
      max={1}
      step={0.01}
      className={neutralSliderClasses}
      onValueChange={(value) => onStrengthChange(firstValue(value))}
    />
  </>
);

/**
 * 设置面板：应用品牌、快速风格、主题、排版、边框、动效、布局与侧边栏
 *
 * 「复制配置」导出的 JSON 包含主题、布局与应用信息，可用于备份或分享。
 */
const ThemePanel = () => {
  const {
    mode,
    preset,
    primary,
    surface,
    accent,
    radius,
    border,
    font,
    fontSize,
    motion,
    resolvedMode,
    setMode,
    setPreset,
    setPrimary,
    setSurface,
    setAccent,
    setRadius,
    setBorder,
    setFont,
    setFontSize,
    setMotion,
    pageTransition,
    motionDuration,
    motionEasing,
    setPageTransition,
    setMotionDuration,
    setMotionEasing,
    applyStyle,
    importConfig: importThemeConfig,
    reset,
  } = useTheme();
  const activePreset = getPreset(preset);
  const primaryHue = primary?.hue ?? activePreset.hue;
  const primaryStrength = primary?.strength ?? activePreset.chroma / PRIMARY_MAX_CHROMA;
  const {
    side,
    variant,
    collapsible,
    width,
    open,
    contentWidth,
    headerStyle,
    pattern,
    setSide,
    setVariant,
    setCollapsible,
    setWidth,
    setOpen,
    setContentWidth,
    setHeaderStyle,
    setPattern,
    importConfig: importLayoutConfig,
    resetLayout,
  } = useLayoutStore();
  const {
    appName,
    appTagline,
    showBreadcrumb,
    showFooter,
    showSidebarFooter,
    setAppName,
    setAppTagline,
    setShowBreadcrumb,
    setShowFooter,
    setShowSidebarFooter,
    importConfig: importAppConfig,
    resetApp,
  } = useAppStore();
  const appNameId = useId();
  const appTaglineId = useId();
  const controlsRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);

  // 复制反馈只在 1.6s 内显示（自动清理定时器）
  const clearCopied = useDebouncedCallback(() => setCopied(false), 1600);

  /**
   * 导入配置：优先识别 { theme, layout, app }，也兼容单段主题 JSON
   */
  const handleImport = () => {
    try {
      const data: unknown = JSON.parse(importText);
      if (!isRecord(data)) {
        setImportError("需要一个配置对象");
        return;
      }

      const record = data;
      if ("theme" in record || "layout" in record || "app" in record) {
        if (record.theme) importThemeConfig(record.theme);
        if (record.layout) importLayoutConfig(record.layout);
        if (record.app) importAppConfig(record.app);
      } else {
        importThemeConfig(record);
      }

      setImportOpen(false);
      setImportText("");
      setImportError(null);
    } catch {
      setImportError("JSON 格式不正确，请检查后重试");
    }
  };

  /**
   * 导出当前配置到剪贴板
   */
  const copyConfig = async () => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(
          {
            theme: {
              mode,
              preset,
              primary,
              surface,
              accent,
              radius,
              border,
              font,
              fontSize,
              motion,
              pageTransition,
              motionDuration,
              motionEasing,
            },
            layout: { side, variant, collapsible, width, open, contentWidth, headerStyle, pattern },
            app: { appName, appTagline, showBreadcrumb, showFooter, showSidebarFooter },
          },
          null,
          2,
        ),
      );
      setCopied(true);
      clearCopied();
    } catch {
      setCopied(false);
    }
  };

  // 面板色点对彩度做了放大，便于在浅色背景上分辨色相
  const dark = resolvedMode === "dark";
  const primaryLightness = dark ? 0.7 : 0.51 - Math.max(0, primaryStrength - 0.5) * 0.12;
  const primaryChip = `oklch(${primaryLightness} ${primaryStrength * PRIMARY_MAX_CHROMA} ${primaryHue})`;
  const surfaceChip = `oklch(${dark ? 0.62 : 0.78} ${surface.strength * SURFACE_MAX_CHROMA * 4} ${surface.hue})`;
  const accentChip = `oklch(${dark ? 0.62 : 0.8} ${accent.strength * ACCENT_MAX_CHROMA * 1.6} ${accent.hue})`;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative flex min-h-0 flex-1">
        <div
          ref={controlsRef}
          className="no-scrollbar flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 pt-4 pb-4"
        >
          <section className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-muted-foreground text-xs font-medium">应用</h3>
                <p className="text-muted-foreground/70 text-[11px]">品牌信息与界面可见性</p>
              </div>
              <button
                type="button"
                onClick={() => resetApp()}
                className="text-muted-foreground hover:text-foreground shrink-0 text-[11px] underline"
              >
                重置应用
              </button>
            </div>

            <div className="bg-muted/30 flex items-center gap-3 rounded-xl border p-3">
              <div className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-lg shadow-sm">
                <GalleryVerticalEndIcon className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{appName || "Shadcn Admin"}</p>
                <p className="text-muted-foreground truncate text-[11px]">{appTagline || "未设置副标题"}</p>
              </div>
            </div>

            <div className="space-y-3 rounded-xl border p-3">
              <div className="grid gap-1.5">
                <Label htmlFor={appNameId} className="text-muted-foreground text-[11px]">
                  名称
                </Label>
                <Input
                  id={appNameId}
                  value={appName}
                  maxLength={40}
                  onChange={(event) => setAppName(event.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor={appTaglineId} className="text-muted-foreground text-[11px]">
                  副标题
                </Label>
                <Input
                  id={appTaglineId}
                  value={appTagline}
                  maxLength={60}
                  placeholder="留空则隐藏"
                  onChange={(event) => setAppTagline(event.target.value)}
                />
              </div>
            </div>

            <div className="divide-y rounded-xl border">
              <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                <span className="text-xs">显示面包屑</span>
                <Switch
                  aria-label="显示面包屑"
                  checked={showBreadcrumb}
                  onCheckedChange={(checked) => setShowBreadcrumb(checked)}
                />
              </div>
              <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                <span className="text-xs">显示页脚</span>
                <Switch
                  aria-label="显示页脚"
                  checked={showFooter}
                  onCheckedChange={(checked) => setShowFooter(checked)}
                />
              </div>
              <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                <span className="text-xs">显示侧栏用户块</span>
                <Switch
                  aria-label="显示侧栏用户块"
                  checked={showSidebarFooter}
                  onCheckedChange={(checked) => setShowSidebarFooter(checked)}
                />
              </div>
            </div>
          </section>

          <section className="space-y-2.5">
            <h3 className="text-muted-foreground text-xs font-medium">快速风格</h3>
            <div className="grid grid-cols-3 gap-1.5">
              {STYLE_PRESETS.map((preset) => (
                <Button key={preset.id} variant="outline" size="sm" onClick={() => applyStyle(preset.id)}>
                  {preset.label}
                </Button>
              ))}
            </div>
            <p className="text-muted-foreground text-[11px]">
              一键调整排版、圆角、边框与表面，不改变品牌色和明暗模式。
            </p>
          </section>

          <section className="space-y-2.5">
            <h3 className="text-muted-foreground text-xs font-medium">主题模式</h3>
            <div className="grid grid-cols-3 gap-1.5">
              {MODE_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={mode === option.value ? "default" : "outline"}
                  size="sm"
                  aria-pressed={mode === option.value}
                  onClick={() => setMode(option.value)}
                >
                  {option.icon}
                  {option.label}
                </Button>
              ))}
            </div>
          </section>

          <section className="space-y-2.5">
            <h3 className="text-muted-foreground text-xs font-medium">品牌色板</h3>
            <div className="grid grid-cols-3 gap-1.5">
              {PRESETS.map((item) => {
                const active = !primary && preset === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setPreset(item.id)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs transition-colors",
                      active ? "border-ring bg-accent text-accent-foreground" : "border-border hover:bg-accent",
                    )}
                  >
                    <span
                      aria-hidden
                      className="ring-foreground/15 size-2.5 shrink-0 rounded-full ring-1"
                      style={getSwatchStyle(item.swatch)}
                    />
                    <span className="truncate">{item.label}</span>
                    {active && <CheckIcon className="ml-auto size-3 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-3">
            <header className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-xs font-medium">品牌色</h3>
                <p className="text-muted-foreground text-[11px]">主按钮 / 激活态 / 焦点环</p>
              </div>
              <div className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                <span
                  aria-hidden
                  className="ring-foreground/15 size-3 rounded-full ring-1"
                  style={getChipStyle(primaryChip)}
                />
                {primary ? (
                  <button type="button" onClick={() => setPrimary(null)} className="hover:text-foreground underline">
                    重置
                  </button>
                ) : (
                  "跟随色板"
                )}
              </div>
            </header>
            <TintControls
              name="品牌色"
              hue={primaryHue}
              strength={primaryStrength}
              onHueChange={(hue) => setPrimary({ hue, strength: primaryStrength })}
              onStrengthChange={(strength) => setPrimary({ hue: primaryHue, strength })}
            />
          </section>

          <section className="space-y-3">
            <header className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-xs font-medium">界面色调</h3>
                <p className="text-muted-foreground text-[11px]">背景 / 侧栏 / 边框</p>
              </div>
              <span
                aria-hidden
                className="ring-foreground/15 mt-1 size-3 shrink-0 rounded-full ring-1"
                style={getChipStyle(surfaceChip)}
              />
            </header>
            <TintControls
              name="界面色调"
              hue={surface.hue}
              strength={surface.strength}
              onHueChange={(hue) => setSurface({ ...surface, hue })}
              onStrengthChange={(strength) => setSurface({ ...surface, strength })}
            />
          </section>

          <section className="space-y-3">
            <header className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-xs font-medium">强调色</h3>
                <p className="text-muted-foreground text-[11px]">悬停 / 选中态</p>
              </div>
              <div className="text-muted-foreground flex items-center gap-2 text-[11px]">
                <span
                  aria-hidden
                  className="ring-foreground/15 size-3 rounded-full ring-1"
                  style={getChipStyle(accentChip)}
                />
                <button
                  type="button"
                  onClick={() => setAccent({ hue: primaryHue, strength: 0.5 })}
                  className="hover:text-foreground underline"
                >
                  跟随品牌
                </button>
              </div>
            </header>
            <TintControls
              name="强调色"
              hue={accent.hue}
              strength={accent.strength}
              onHueChange={(hue) => setAccent({ ...accent, hue })}
              onStrengthChange={(strength) => setAccent({ ...accent, strength })}
            />
          </section>

          <section className="space-y-3">
            <h3 className="text-muted-foreground text-xs font-medium">排版</h3>
            <div className="grid grid-cols-2 gap-1.5">
              {FONT_OPTIONS.map((option) => (
                <Button
                  key={option.id}
                  variant={font === option.id ? "default" : "outline"}
                  size="sm"
                  aria-pressed={font === option.id}
                  onClick={() => setFont(option.id)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <SliderRow
              label="字号"
              display={`${fontSize}px`}
              aria-label="字号"
              value={singleValue(fontSize)}
              min={14}
              max={17}
              step={0.5}
              className={neutralSliderClasses}
              onValueChange={(value) => setFontSize(firstValue(value))}
            />
          </section>

          <section className="space-y-3">
            <h3 className="text-muted-foreground text-xs font-medium">形状与边框</h3>
            <SliderRow
              label="圆角"
              display={`${Math.round(radius * 16)}px`}
              aria-label="圆角"
              value={singleValue(radius)}
              min={0}
              max={1.25}
              step={0.025}
              className={neutralSliderClasses}
              onValueChange={(value) => setRadius(firstValue(value))}
            />
            <SliderRow
              label="边框强度"
              display={`${Math.round(border * 100)}%`}
              aria-label="边框强度"
              value={singleValue(border)}
              min={0}
              max={1}
              step={0.01}
              className={neutralSliderClasses}
              onValueChange={(value) => setBorder(firstValue(value))}
            />
          </section>

          <section className="space-y-3">
            <h3 className="text-muted-foreground text-xs font-medium">动效</h3>
            <div className="grid grid-cols-2 gap-1.5">
              {PAGE_TRANSITION_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={pageTransition === option.value ? "default" : "outline"}
                  size="sm"
                  aria-pressed={pageTransition === option.value}
                  onClick={() => setPageTransition(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <SliderRow
              label="时长"
              display={`${motionDuration}ms`}
              aria-label="动效时长"
              value={singleValue(motionDuration)}
              min={100}
              max={600}
              step={50}
              className={neutralSliderClasses}
              onValueChange={(value) => setMotionDuration(firstValue(value))}
            />
            <div className="grid grid-cols-2 gap-1.5">
              {MOTION_EASING_OPTIONS.map((option) => (
                <Button
                  key={option.id}
                  variant={motionEasing === option.id ? "default" : "outline"}
                  size="sm"
                  aria-pressed={motionEasing === option.id}
                  onClick={() => setMotionEasing(option.id)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <p className="text-muted-foreground text-[11px]">修改后当前页面会立即重播一次。</p>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-medium">减少动效</h4>
                <p className="text-muted-foreground text-[11px]">关闭所有过渡与入场动画</p>
              </div>
              <Switch
                aria-label="减少动效"
                checked={motion === "reduced"}
                onCheckedChange={(checked) => setMotion(checked ? "reduced" : "full")}
              />
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-muted-foreground text-xs font-medium">布局</h3>
              <button
                type="button"
                onClick={() => resetLayout()}
                className="text-muted-foreground hover:text-foreground text-[11px] underline"
              >
                重置布局
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {CONTENT_WIDTH_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={contentWidth === option.value ? "default" : "outline"}
                  size="sm"
                  aria-pressed={contentWidth === option.value}
                  onClick={() => setContentWidth(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {HEADER_STYLE_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={headerStyle === option.value ? "default" : "outline"}
                  size="sm"
                  aria-pressed={headerStyle === option.value}
                  onClick={() => setHeaderStyle(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {PATTERN_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={pattern === option.value ? "default" : "outline"}
                  size="sm"
                  aria-pressed={pattern === option.value}
                  onClick={() => setPattern(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-muted-foreground text-xs font-medium">侧边栏</h3>
            <div className="grid grid-cols-2 gap-1.5">
              {SIDE_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={side === option.value ? "default" : "outline"}
                  size="sm"
                  aria-pressed={side === option.value}
                  onClick={() => setSide(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {VARIANT_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={variant === option.value ? "default" : "outline"}
                  size="sm"
                  aria-pressed={variant === option.value}
                  onClick={() => setVariant(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {COLLAPSIBLE_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={collapsible === option.value ? "default" : "outline"}
                  size="sm"
                  aria-pressed={collapsible === option.value}
                  onClick={() => setCollapsible(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <SliderRow
              label="宽度"
              display={`${width}rem`}
              aria-label="侧边栏宽度"
              value={singleValue(width)}
              min={14}
              max={22}
              step={0.5}
              className={neutralSliderClasses}
              onValueChange={(value) => setWidth(firstValue(value))}
            />
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-medium">展开侧边栏</h4>
                <p className="text-muted-foreground text-[11px]">收起后仍可用顶栏按钮或 ⌘B 打开</p>
              </div>
              <Switch aria-label="展开侧边栏" checked={open} onCheckedChange={(checked) => setOpen(checked)} />
            </div>
          </section>
        </div>
        <OverlayScrollbar targetRef={controlsRef} />
      </div>

      <SheetFooter className="after:from-border/70 after:via-border/40 relative flex-row gap-2 px-4 py-3 after:pointer-events-none after:absolute after:top-0 after:right-2 after:left-0 after:h-px after:bg-gradient-to-r after:to-transparent">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => reset()}>
          <RotateCcwIcon />
          恢复默认
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={() => setImportOpen(true)}>
          导入
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => {
            void copyConfig();
          }}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? "已复制" : "复制配置"}
        </Button>
      </SheetFooter>

      <Dialog open={importOpen} onOpenChange={(nextOpen) => setImportOpen(nextOpen)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>导入配置</DialogTitle>
            <DialogDescription>粘贴「复制配置」得到的 JSON，会覆盖主题、布局与应用设置。</DialogDescription>
          </DialogHeader>
          <Textarea
            value={importText}
            rows={10}
            spellCheck={false}
            placeholder='{ "theme": { ... }, "layout": { ... }, "app": { ... } }'
            className="font-mono text-xs"
            onChange={(event) => {
              setImportText(event.target.value);
              setImportError(null);
            }}
          />
          {importError && <p className="text-destructive text-xs">{importError}</p>}
          <DialogFooter>
            <DialogClose render={cancelDialogButton} />
            <Button size="sm" onClick={handleImport}>
              导入配置
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { ThemePanel };

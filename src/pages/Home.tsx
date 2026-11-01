import { useMouse } from "@mantine/hooks";
import { cn } from "cn";
import type { CSSProperties } from "react";

import { useAppStore } from "@/stores/app";

/**
 * 漂浮装饰块：呼应品牌方块的细轮廓，缓慢上下浮动
 *
 * @param props.className - 定位与尺寸
 * @param props.delay - 动画延迟（负值提前相位，让多个块错开节奏）
 */
const getFloatStyle = (delay: number): CSSProperties => ({ animationDelay: `${delay}s` });

const getGlowStyle = (x: number, y: number): CSSProperties => ({
  left: x - 210,
  top: y - 210,
  background: "radial-gradient(closest-side, color-mix(in oklab, var(--sidebar-border) 55%, transparent), transparent)",
});

const FloatShape = ({ className, delay }: { className: string; delay: number }) => (
  <div
    aria-hidden
    style={getFloatStyle(delay)}
    className={cn(
      "border-border/70 absolute rounded-2xl border motion-reduce:animate-none animate-[float_7s_ease-in-out_infinite]",
      className,
    )}
  />
);

/**
 * 首页（装饰性）：巨型渐变排印 + 光标柔光跟随 + 漂浮轮廓
 *
 * 纯视觉页，不承载任何业务数据
 */
const Home = () => {
  const appName = useAppStore((state) => state.appName) || "Shadcn Admin";
  // 光标在内容区内的坐标，驱动柔光跟随（@mantine/hooks）
  const { ref, x, y } = useMouse();

  return (
    <section ref={ref} className="relative flex flex-1 items-center justify-center overflow-hidden">
      {/* 漂浮轮廓 */}
      <FloatShape className="top-[20%] left-[14%] size-14" delay={-2} />
      <FloatShape className="top-[26%] right-[18%] size-10 rounded-xl" delay={-4.5} />
      <FloatShape className="bottom-[22%] left-[24%] size-8 rounded-lg" delay={-1} />

      {/* 光标柔光（首次移动前不渲染，避免停在角落） */}
      {(x > 0 || y > 0) && (
        <div
          aria-hidden
          className="pointer-events-none absolute size-105 rounded-full opacity-60 blur-3xl"
          style={getGlowStyle(x, y)}
        />
      )}

      {/* 中心排印 */}
      <div className="relative flex flex-col items-center gap-5 text-center">
        <h1 className="from-foreground to-foreground/25 bg-linear-to-b bg-clip-text text-6xl font-semibold tracking-tight text-transparent md:text-7xl">
          {appName}
        </h1>
        <div className="text-muted-foreground flex items-center gap-3 text-xs tracking-[0.5em]">
          <span className="bg-border h-px w-10" />
          优雅 · 简洁 · 安静
          <span className="bg-border h-px w-10" />
        </div>
      </div>

      {/* 快捷键彩蛋 */}
      <p className="text-muted-foreground absolute bottom-3 flex items-center gap-1.5 text-xs">
        试试
        <kbd className="border-border bg-muted rounded border px-1.5 py-0.5 font-mono text-[10px]">⌘</kbd>
        <kbd className="border-border bg-muted rounded border px-1.5 py-0.5 font-mono text-[10px]">B</kbd>
        折叠侧边栏
      </p>
    </section>
  );
};

export { Home };

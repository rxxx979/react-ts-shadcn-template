import { cn } from "cn";
import { Suspense, useLayoutEffect, useRef } from "react";
import { Outlet, useLocation, useMatches } from "react-router";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageError } from "@/components/layout/PageError";
import { PageFallback } from "@/components/layout/PageFallback";
import { OverlayScrollbar } from "@/components/OverlayScrollbar";
import { getEasingValue } from "@/lib/theme";
import type { PageTransition } from "@/lib/theme";
import type { Handler } from "@/router";
import { useLayoutStore } from "@/stores/layout";
import { useThemeStore } from "@/stores/theme";

/**
 * 页面入场关键帧：使用 Web Animations API，可在不重建页面的情况下随配置变化重播
 */
const PAGE_ANIMATIONS: Record<PageTransition, Keyframe[]> = {
  fade: [{ opacity: 0 }, { opacity: 1 }],
  slide: [
    { opacity: 0, transform: "translateY(8px)" },
    { opacity: 1, transform: "translateY(0)" },
  ],
  scale: [
    { opacity: 0, transform: "scale(0.96)" },
    { opacity: 1, transform: "scale(1)" },
  ],
  none: [],
};

const PAGE_FALLBACK = <PageFallback />;
const PAGE_ERROR = <PageError />;

const isFluidHandler = (value: unknown): value is Handler =>
  typeof value === "object" && value !== null && "fluid" in value && value.fluid === true;

/**
 * 内容区：子路由出口（页面定位由顶栏面包屑承担，不再渲染标题）
 *
 * 路由切换或动效配置变化时重放页面入场动画；动画直接作用于页面内容，不重置滚动位置。
 */
const Main = () => {
  // key 变化会重建节点，让入场动画在每次路由切换时重放
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const fluid = useMatches().some((match) => isFluidHandler(match.handle));
  const ref = useRef<HTMLDivElement>(null);
  const transitionRef = useRef<HTMLDivElement>(null);
  const contentWidth = useLayoutStore((state) => state.contentWidth);
  const pattern = useLayoutStore((state) => state.pattern);
  const pageTransition = useThemeStore((state) => state.pageTransition);
  const motionDuration = useThemeStore((state) => state.motionDuration);
  const motionEasing = useThemeStore((state) => state.motionEasing);
  const motion = useThemeStore((state) => state.motion);

  // 路由切换后回到内容顶部，避免沿用上一条路由的滚动位置
  useLayoutEffect(() => {
    ref.current?.scrollTo({ top: 0 });
  }, []);

  // 页面入场：路由变化或动效配置变化时直接在当前页面重播（layout effect 避免先闪一帧）
  useLayoutEffect(() => {
    const element = transitionRef.current;
    let animation: Animation | undefined;

    if (
      element
      && pageTransition !== "none"
      && motion !== "reduced"
      && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      animation = element.animate(PAGE_ANIMATIONS[pageTransition], {
        duration: motionDuration,
        easing: getEasingValue(motionEasing),
        fill: "both",
      });
      animation.onfinish = () => {
        animation?.cancel();
      };
    }

    return () => animation?.cancel();
  }, [pageTransition, motionDuration, motionEasing, motion]);

  return (
    <div key={pathname} ref={transitionRef} className="relative flex min-h-0 flex-1 flex-col">
      {/* 首页背景铺满内容区，避免 boxed 宽度下左右露出底色 */}
      {isHome && pattern === "none" && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[24px_24px] opacity-40"
        />
      )}
      <div
        ref={ref}
        data-pattern={pattern}
        className="no-scrollbar relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-6 px-4 pt-3 sm:px-5 xl:px-6">
          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col gap-6",
              contentWidth === "boxed" && !isHome && !fluid && "mx-auto w-full max-w-360",
            )}
          >
            <ErrorBoundary key={pathname} fallback={PAGE_ERROR}>
              <Suspense fallback={PAGE_FALLBACK}>
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </div>
      <OverlayScrollbar targetRef={ref} revealOnHover={false} />
    </div>
  );
};

export { Main };

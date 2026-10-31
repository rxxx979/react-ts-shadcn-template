import { cn } from "cn";
import type { CSSProperties, PointerEvent as ReactPointerEvent, RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

const INSET = 4;
const MIN_THUMB = 28;

interface ScrollbarMetrics {
  thumbHeight: number;
  thumbTop: number;
  maxScroll: number;
  maxThumbTop: number;
}

const EMPTY_METRICS: ScrollbarMetrics = {
  thumbHeight: 0,
  thumbTop: 0,
  maxScroll: 0,
  maxThumbTop: 0,
};

const getThumbStyle = (metrics: ScrollbarMetrics): CSSProperties => ({
  height: metrics.thumbHeight,
  transform: `translateY(${metrics.thumbTop}px)`,
});

interface OverlayScrollbarProps {
  /**
   * 需要监听的滚动容器
   */
  targetRef: RefObject<HTMLElement | null>;
  /**
   * 鼠标进入滚动区域时是否显示（嵌套滚动面板建议开启）
   */
  revealOnHover?: boolean;
  className?: string;
}

/**
 * 浮层式细滚动条：不占布局，滚动/悬停时淡入，可拖动或点击轨道跳转
 */
const OverlayScrollbar = ({ targetRef, revealOnHover = true, className }: OverlayScrollbarProps) => {
  const [metrics, setMetrics] = useState<ScrollbarMetrics>(EMPTY_METRICS);
  const [visible, setVisible] = useState(false);
  const [dragging, setDragging] = useState(false);
  const hideTimer = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const hoveringRef = useRef(false);
  const dragStart = useRef({ y: 0, scroll: 0 });

  const clearHideTimer = useCallback(() => {
    if (hideTimer.current !== null) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const scheduleHide = useCallback(
    (delay = 900) => {
      clearHideTimer();
      hideTimer.current = window.setTimeout(() => {
        if (!draggingRef.current && !(revealOnHover && hoveringRef.current)) setVisible(false);
      }, delay);
    },
    [clearHideTimer, revealOnHover],
  );

  const reveal = useCallback(
    (autoHide: boolean) => {
      setVisible(true);
      clearHideTimer();
      if (autoHide) scheduleHide();
    },
    [clearHideTimer, scheduleHide],
  );

  const update = useCallback(() => {
    const target = targetRef.current;
    if (!target) return;

    const viewport = target.clientHeight;
    const content = target.scrollHeight;
    const maxScroll = Math.max(0, content - viewport);
    const trackHeight = Math.max(0, viewport - INSET * 2);
    const thumbHeight =
      maxScroll > 0 ? Math.min(trackHeight, Math.max(MIN_THUMB, (viewport / content) * trackHeight)) : 0;
    const maxThumbTop = Math.max(0, trackHeight - thumbHeight);
    const thumbTop = maxScroll > 0 ? (target.scrollTop / maxScroll) * maxThumbTop : 0;

    setMetrics({ thumbHeight, thumbTop, maxScroll, maxThumbTop });
  }, [targetRef]);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return () => {};

    update();

    const onScroll = () => {
      update();
      setVisible(true);
      scheduleHide();
    };
    const onPointerEnter = () => {
      hoveringRef.current = true;
      if (revealOnHover) reveal(false);
    };
    const onPointerLeave = () => {
      hoveringRef.current = false;
      if (!draggingRef.current) scheduleHide(400);
    };

    target.addEventListener("scroll", onScroll, { passive: true });
    target.addEventListener("pointerenter", onPointerEnter);
    target.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("resize", update);

    const observer = new ResizeObserver(update);
    observer.observe(target);
    Array.from(target.children).forEach((child) => observer.observe(child));

    return () => {
      target.removeEventListener("scroll", onScroll);
      target.removeEventListener("pointerenter", onPointerEnter);
      target.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", update);
      observer.disconnect();
      clearHideTimer();
    };
  }, [targetRef, update, reveal, revealOnHover, scheduleHide, clearHideTimer]);

  const handleTrackPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    const target = targetRef.current;
    if (!target || metrics.maxScroll <= 0) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(
      1,
      Math.max(
        0,
        (event.clientY - rect.top - metrics.thumbHeight / 2) / Math.max(1, rect.height - metrics.thumbHeight),
      ),
    );
    target.scrollTop = ratio * metrics.maxScroll;
    update();
    reveal(false);
  };

  const handleThumbPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const target = targetRef.current;
    if (!target || metrics.maxScroll <= 0) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    draggingRef.current = true;
    setDragging(true);
    dragStart.current = { y: event.clientY, scroll: target.scrollTop };
    clearHideTimer();
    setVisible(true);
  };

  const handleThumbPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const target = targetRef.current;
    if (!target || metrics.maxThumbTop <= 0) return;

    const delta = event.clientY - dragStart.current.y;
    target.scrollTop = dragStart.current.scroll + (delta / metrics.maxThumbTop) * metrics.maxScroll;
    update();
  };

  const handleThumbPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
    scheduleHide(600);
  };

  if (metrics.thumbHeight <= 0) return null;

  return (
    <div
      aria-hidden
      className={cn(
        "group/scrollbar absolute inset-y-1 right-1 z-20 w-2 touch-none select-none transition-opacity duration-150",
        visible || dragging ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        className,
      )}
      onPointerDown={handleTrackPointerDown}
    >
      <div
        className={cn(
          "absolute right-0 w-1 rounded-full bg-foreground/15 transition-[width,background-color] duration-150 group-hover/scrollbar:w-1.5 hover:bg-foreground/30",
          dragging && "w-1.5 bg-foreground/30",
        )}
        style={getThumbStyle(metrics)}
        onPointerDown={handleThumbPointerDown}
        onPointerMove={handleThumbPointerMove}
        onPointerUp={handleThumbPointerUp}
      />
    </div>
  );
};

export { OverlayScrollbar };

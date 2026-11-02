import { useVirtualizer } from "@tanstack/react-virtual";
import type { RefObject } from "react";

interface UseVirtualRowsOptions {
  /**
   * 行数量
   */
  count: number;
  /**
   * 固定行高
   */
  estimateSize: number;
  /**
   * 可视区外的预渲染行数
   */
  overscan?: number;
  /**
   * 滚动容器
   */
  scrollRef: RefObject<HTMLElement | null>;
  /**
   * 滚动容器顶部的固定 header 高度
   */
  scrollMargin?: number;
}

/**
 * 固定行高的虚拟滚动封装
 *
 * @param options - 行数量、行高与滚动容器
 */
const useVirtualRows = ({ count, estimateSize, overscan = 8, scrollRef, scrollMargin = 0 }: UseVirtualRowsOptions) =>
  useVirtualizer({
    count,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimateSize,
    overscan,
    scrollMargin,
  });

export { useVirtualRows };

import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useState } from "react";

import { useDndSensors } from "@/hooks/use-dnd-sensors";

interface UseSortableListOptions {
  /**
   * 当前顺序的 id
   */
  ids: string[];
  /**
   * 排序完成后回调新的 id 顺序
   */
  onReorder: (ids: string[]) => void;
  /**
   * 是否禁用排序
   */
  disabled?: boolean;
}

/**
 * 任意可排序列表的状态封装：表格行、div 列表、卡片列表均可使用
 *
 * @param options - Id 列表、排序回调与禁用状态
 */
const useSortableList = ({ ids, onReorder, disabled = false }: UseSortableListOptions) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useDndSensors();

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);

    if (disabled || !event.over || event.active.id === event.over.id) {
      return;
    }

    const oldIndex = ids.indexOf(String(event.active.id));
    const newIndex = ids.indexOf(String(event.over.id));

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    onReorder(arrayMove(ids, oldIndex, newIndex));
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  return { activeId, sensors, handleDragStart, handleDragEnd, handleDragCancel };
};

export { useSortableList };

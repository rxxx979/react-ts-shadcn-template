import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useState } from "react";

import { useDndSensors } from "@/hooks/use-dnd-sensors";

interface BoardItem {
  id: string;
}

interface UseBoardDndOptions<C extends string, T extends BoardItem> {
  columns: readonly C[];
  initialBoard: Record<C, T[]>;
}

/**
 * 多列看板 DnD：负责跨列移动与列内排序
 *
 * @param options - 列定义与初始数据
 */
const useBoardDnd = <C extends string, T extends BoardItem>({ columns, initialBoard }: UseBoardDndOptions<C, T>) => {
  const [board, setBoard] = useState<Record<C, T[]>>(initialBoard);
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useDndSensors();

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    if (!event.over) return;

    const activeKey = String(event.active.id);
    const overKey = String(event.over.id);
    const source = columns.find((column) => board[column].some((item) => item.id === activeKey));
    const target = columns.find((column) => column === overKey || board[column].some((item) => item.id === overKey));

    if (!source || !target) return;

    setBoard((current) => {
      const sourceItems = current[source];
      const targetItems = current[target];
      const item = sourceItems.find((entry) => entry.id === activeKey);
      if (!item) return current;

      if (source === target) {
        const oldIndex = sourceItems.findIndex((entry) => entry.id === activeKey);
        const newIndex =
          overKey === target ? targetItems.length - 1 : targetItems.findIndex((entry) => entry.id === overKey);
        return {
          ...current,
          [source]: arrayMove(sourceItems, oldIndex, newIndex < 0 ? targetItems.length - 1 : newIndex),
        };
      }

      const targetIndex =
        overKey === target ? targetItems.length : targetItems.findIndex((entry) => entry.id === overKey);
      const nextTarget = [...targetItems];
      nextTarget.splice(targetIndex < 0 ? targetItems.length : targetIndex, 0, item);
      return {
        ...current,
        [source]: sourceItems.filter((entry) => entry.id !== activeKey),
        [target]: nextTarget,
      };
    });
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeItem = activeId
    ? columns.flatMap((column) => board[column]).find((item) => item.id === activeId)
    : undefined;

  return { board, setBoard, activeItem, activeId, sensors, handleDragStart, handleDragEnd, handleDragCancel };
};

export { useBoardDnd };
export type { BoardItem };

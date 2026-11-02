import { KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useState } from "react";

interface UseSortableRowsOptions {
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
 * 行排序的 dnd-kit 状态封装
 *
 * @param options - Id 列表、排序回调与禁用状态
 */
const useSortableRows = ({ ids, onReorder, disabled = false }: UseSortableRowsOptions) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

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

export { useSortableRows };

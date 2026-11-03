import { useSortable } from "@dnd-kit/sortable";

/**
 * 单个可排序元素：table row、div、卡片都可以用
 *
 * @param id - 元素 id
 * @param disabled - 是否禁用拖拽
 */
const useSortableItem = (id: string, disabled = false) => useSortable({ id, disabled });

export { useSortableItem };

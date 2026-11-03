import { closestCorners, DndContext, DragOverlay, useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon } from "lucide-react";
import { useMemo } from "react";

import { useBoardDnd } from "@/hooks/use-board-dnd";
import { useSortableItem } from "@/hooks/use-sortable-item";

type ColumnId = "backlog" | "progress" | "review" | "done";

interface Task {
  id: string;
  title: string;
  owner: string;
  priority: "low" | "medium" | "high";
}

type Board = Record<ColumnId, Task[]>;

const COLUMNS: Array<{ id: ColumnId; label: string }> = [
  { id: "backlog", label: "待处理" },
  { id: "progress", label: "进行中" },
  { id: "review", label: "待验收" },
  { id: "done", label: "已完成" },
];

const INITIAL_BOARD: Board = {
  backlog: [
    { id: "k-1", title: "梳理权限边界", owner: "林舟", priority: "high" },
    { id: "k-2", title: "补充空状态文案", owner: "苏晚", priority: "low" },
  ],
  progress: [
    { id: "k-3", title: "项目详情时间线", owner: "陈默", priority: "medium" },
    { id: "k-4", title: "表格列显隐", owner: "周屿", priority: "high" },
  ],
  review: [{ id: "k-5", title: "设置表单校验", owner: "顾言", priority: "medium" }],
  done: [{ id: "k-6", title: "登录页重构", owner: "林舟", priority: "low" }],
};

const PRIORITY_STYLES = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  high: "bg-destructive/10 text-destructive",
} as const;

const Card = ({ task, overlay = false }: { task: Task; overlay?: boolean }) => (
  <div className={overlay ? "bg-card rounded-lg border p-3 shadow-xl" : "bg-card rounded-lg border p-3 shadow-sm"}>
    <div className="flex items-start gap-2">
      <GripVerticalIcon className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{task.title}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-muted-foreground text-[10px]">{task.owner}</span>
          <span className={`rounded-full px-1.5 py-0.5 font-mono text-[8px] ${PRIORITY_STYLES[task.priority]}`}>
            {task.priority}
          </span>
        </div>
      </div>
    </div>
  </div>
);

const SortableCard = ({ task }: { task: Task }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortableItem(task.id);
  const style = useMemo(
    () => ({ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.35 : 1 }),
    [isDragging, transform, transition],
  );

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card task={task} />
    </div>
  );
};

const KanbanColumn = ({ id, label, tasks }: { id: ColumnId; label: string; tasks: Task[] }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  const itemIds = useMemo(() => tasks.map((task) => task.id), [tasks]);
  return (
    <section className="bg-muted/20 flex min-h-0 flex-col rounded-xl border">
      <header className="flex items-center justify-between border-b px-3 py-2.5">
        <h2 className="text-xs font-medium">{label}</h2>
        <span className="text-muted-foreground font-mono text-[10px]">{tasks.length}</span>
      </header>
      <div
        ref={setNodeRef}
        className={isOver ? "bg-primary/5 min-h-24 flex-1 space-y-2 p-2" : "min-h-24 flex-1 space-y-2 p-2"}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
    </section>
  );
};

/**
 * Kanban 拖拽演示：跨列移动
 */
const Kanban = () => {
  const {
    board,
    activeItem: activeTask,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useBoardDnd({
    columns: COLUMNS.map((column) => column.id),
    initialBoard: INITIAL_BOARD,
  });

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-5">
      <div>
        <h1 className="text-3xl font-semibold tracking-[-0.03em]">看板</h1>
        <p className="text-muted-foreground mt-1 text-sm">拖动卡片跨列移动，使用 dnd-kit 的 sortable 与 overlay。</p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((column) => (
            <KanbanColumn key={column.id} id={column.id} label={column.label} tasks={board[column.id]} />
          ))}
        </div>
        <DragOverlay>{activeTask ? <Card task={activeTask} overlay /> : null}</DragOverlay>
      </DndContext>
    </div>
  );
};

export { Kanban };

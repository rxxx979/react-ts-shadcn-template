import { closestCorners, DndContext, DragOverlay, MeasuringStrategy } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_equals,
  flexRender,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_basic,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import type { ColumnFiltersState, PaginationState, Row, RowSelectionState, SortingState } from "@tanstack/react-table";
import { cn } from "cn";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  Columns3Icon,
  DownloadIcon,
  FolderKanbanIcon,
  GripVerticalIcon,
  InboxIcon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import { useDeferredValue, useMemo, useRef, useState } from "react";
import type { CSSProperties, SubmitEvent } from "react";
import { Link } from "react-router";

import { Can } from "@/components/auth/Can";
import { ProjectStatusBadge } from "@/components/projects/ProjectStatusBadge";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { usePermission } from "@/hooks/use-permission";
import { useRequest } from "@/hooks/use-request";
import { useSortableItem } from "@/hooks/use-sortable-item";
import { useSortableList } from "@/hooks/use-sortable-list";
import { useVirtualRows } from "@/hooks/use-virtual-rows";
import type { Project, ProjectInput, ProjectStatus } from "@/lib/projects";
import {
  createProject,
  listProjects,
  removeProject,
  removeProjects,
  reorderProjects,
  updateProject,
} from "@/lib/projects";

const FILTERS: Array<{ id: "all" | ProjectStatus; label: string }> = [
  { id: "all", label: "全部" },
  { id: "active", label: "进行中" },
  { id: "paused", label: "已暂停" },
  { id: "completed", label: "已完成" },
];

const EMPTY_FORM: ProjectInput = {
  name: "",
  description: "",
  owner: "",
  status: "active",
};

const COLUMN_WIDTHS: Record<string, string> = {
  select: "36px",
  project: "minmax(0,1.8fr)",
  owner: "100px",
  status: "110px",
  updated: "100px",
  actions: "72px",
};
const DEFAULT_GRID = "28px 36px minmax(0,1.8fr) 100px 110px 100px 72px";
const DEFAULT_GRID_STYLE = { gridTemplateColumns: DEFAULT_GRID };
const getGridTemplate = (columnIds: string[]) =>
  ["28px", ...columnIds.map((id) => COLUMN_WIDTHS[id] ?? "100px")].join(" ");
const ROW_HEIGHT = 68;
const HEADER_HEIGHT = 40;
const DATE_FORMATTER = new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric" });
const SKELETON_ROWS = ["one", "two", "three", "four", "five"];
const DROPPABLE_MEASURING = { droppable: { strategy: MeasuringStrategy.Always } };

/**
 * 项目名称与描述
 *
 * @param props.project - 项目
 */
const ProjectIdentity = ({ project, link = false }: { project: Project; link?: boolean }) => (
  <div className="flex min-w-0 items-center gap-3">
    <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg font-mono text-[11px]">
      {project.name.slice(0, 1)}
    </div>
    <div className="min-w-0">
      {link ? (
        <Link to={`/projects/${project.id}`} className="truncate text-sm font-medium hover:underline">
          {project.name}
        </Link>
      ) : (
        <p className="truncate text-sm font-medium">{project.name}</p>
      )}
      <p className="text-muted-foreground mt-0.5 max-w-md truncate text-[11px]">{project.description}</p>
    </div>
  </div>
);

interface ProjectRowProps {
  row: Row<typeof TABLE_FEATURES, Project>;
  virtualStart: number;
  sortable: boolean;
  gridTemplate: string;
}

/**
 * 虚拟行 + 可排序行
 */
const ProjectRow = ({ row, virtualStart, sortable, gridTemplate }: ProjectRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortableItem(row.id, !sortable);
  const dndTransform = CSS.Transform.toString(transform);
  const project = row.original;
  const rowStyle = useMemo<CSSProperties>(
    () => ({
      height: ROW_HEIGHT,
      top: virtualStart,
      transform: dndTransform,
      transition,
      gridTemplateColumns: gridTemplate,
    }),
    [dndTransform, gridTemplate, transition, virtualStart],
  );

  return (
    <div
      ref={setNodeRef}
      role="row"
      className={cn(
        "absolute top-0 left-0 grid w-full items-center border-b border-border/60 bg-card/30 transition-colors hover:bg-muted/20",
        isDragging && "z-20 opacity-30",
      )}
      style={rowStyle}
    >
      <div role="gridcell" className="flex h-full items-center justify-center">
        {sortable && (
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label={`拖动排序 ${project.name}`}
            className="text-muted-foreground hover:text-foreground cursor-grab rounded-md p-1 active:cursor-grabbing"
          >
            <GripVerticalIcon className="size-3.5" />
          </button>
        )}
      </div>

      {row.getVisibleCells().map((cell) => (
        <div
          key={cell.id}
          role="gridcell"
          className={cn("min-w-0 px-3", cell.column.id === "actions" && "flex justify-end")}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </div>
      ))}
    </div>
  );
};

/**
 * 拖拽浮层
 *
 * @param props.project - 正在拖拽的项目
 */
const ProjectOverlay = ({ project }: { project: Project }) => (
  <div
    className="bg-card/95 grid h-17 w-195 items-center rounded-lg border shadow-xl backdrop-blur"
    style={DEFAULT_GRID_STYLE}
  >
    <div />
    <div />
    <div className="px-3">
      <ProjectIdentity project={project} />
    </div>
    <div className="px-3 text-sm">{project.owner}</div>
    <div className="px-3">
      <ProjectStatusBadge status={project.status} />
    </div>
    <div className="text-muted-foreground px-3 font-mono text-[11px]">{DATE_FORMATTER.format(project.updatedAt)}</div>
    <div />
  </div>
);

const TABLE_FEATURES = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: { equals: filterFn_equals },
  sortFns: { basic: sortFn_basic },
});

const projectColumnHelper = createColumnHelper<typeof TABLE_FEATURES, Project>();

interface ProjectColumnActions {
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

/**
 * 项目列定义
 *
 * @param actions - 行操作回调
 */
const createProjectColumns = ({ onEdit, onDelete }: ProjectColumnActions) =>
  projectColumnHelper.columns([
    projectColumnHelper.display({
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            aria-label="选择当前页"
            onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            aria-label={`选择 ${row.original.name}`}
            onCheckedChange={(checked) => row.toggleSelected(checked)}
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    }),
    projectColumnHelper.accessor("name", {
      id: "project",
      header: "项目",
      enableHiding: false,
      cell: ({ row }) => <ProjectIdentity project={row.original} link />,
    }),
    projectColumnHelper.accessor("owner", {
      header: "负责人",
      cell: ({ getValue }) => <span className="text-sm">{getValue()}</span>,
    }),
    projectColumnHelper.accessor("status", {
      header: "状态",
      filterFn: "equals",
      cell: ({ row }) => <ProjectStatusBadge status={row.original.status} />,
    }),
    projectColumnHelper.accessor("updatedAt", {
      header: "更新",
      sortFn: "basic",
      cell: ({ row }) => (
        <span className="text-muted-foreground font-mono text-[11px]">
          {DATE_FORMATTER.format(row.original.updatedAt)}
        </span>
      ),
    }),
    projectColumnHelper.display({
      id: "actions",
      header: "操作",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Can permission="project:update">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`编辑 ${row.original.name}`}
              onClick={() => onEdit(row.original)}
            >
              <PencilIcon />
            </Button>
          </Can>
          <Can permission="project:delete">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`删除 ${row.original.name}`}
              className="text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(row.original)}
            >
              <Trash2Icon />
            </Button>
          </Can>
        </div>
      ),
    }),
  ]);

/**
 * 项目 CRUD 示例页
 */
const Projects = () => {
  const { data, error, loading, mutate, refresh } = useRequest((signal) => listProjects(signal));
  const [query, setQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [manualSort, setManualSort] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 50 });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<ProjectInput>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const scrollRef = useRef<HTMLDivElement>(null);
  const canUpdate = usePermission("project:update");
  const canDelete = usePermission("project:delete");

  const projects = data ?? [];
  const statusFilterValue = columnFilters.find((filter) => filter.id === "status")?.value;
  const statusFilter: "all" | ProjectStatus =
    statusFilterValue === "active" || statusFilterValue === "paused" || statusFilterValue === "completed"
      ? statusFilterValue
      : "all";

  const counts = {
    total: projects.length,
    active: projects.filter((project) => project.status === "active").length,
    paused: projects.filter((project) => project.status === "paused").length,
    completed: projects.filter((project) => project.status === "completed").length,
  };

  const handleOpenCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (project: Project) => {
    setEditing(project);
    setForm({
      name: project.name,
      description: project.description,
      owner: project.owner,
      status: project.status,
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const persistProject = async () => {
    const next: ProjectInput = {
      ...form,
      name: form.name.trim(),
      owner: form.owner.trim(),
      description: form.description.trim(),
    };

    if (!next.name || !next.owner) {
      setFormError("项目名称和负责人不能为空");
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      if (editing) {
        await updateProject(editing.id, next);
        toast.add({ title: "项目已更新", description: next.name, type: "success" });
      } else {
        await createProject(next);
        toast.add({ title: "项目已创建", description: next.name, type: "success" });
      }

      await refresh();
      setDialogOpen(false);
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    void persistProject();
  };

  const handleConfirmDelete = async () => {
    if (!deleting) {
      return;
    }

    setDeletingBusy(true);

    try {
      await removeProject(deleting.id);
      await refresh();
      toast.add({ title: "项目已删除", description: deleting.name, type: "success" });
      setDeleting(null);
    } catch (cause) {
      toast.add({
        title: "删除失败",
        description: cause instanceof Error ? cause.message : "请稍后重试",
        type: "error",
      });
    } finally {
      setDeletingBusy(false);
    }
  };

  const persistReorder = async (ids: string[]) => {
    const previous = projects;
    const byId = new Map(projects.map((project) => [project.id, project]));
    const next = ids.flatMap((id) => {
      const project = byId.get(id);
      return project ? [project] : [];
    });

    if (next.length !== projects.length) {
      return;
    }

    mutate(next);

    try {
      await reorderProjects(ids);
      await refresh();
      toast.add({ title: "排序已保存", type: "success" });
    } catch (cause) {
      mutate(previous);
      toast.add({
        title: "排序保存失败",
        description: cause instanceof Error ? cause.message : "已恢复原来的顺序",
        type: "error",
      });
    }
  };

  const handleReorder = (ids: string[]) => {
    void persistReorder(ids);
  };

  const { activeId, sensors, handleDragStart, handleDragEnd, handleDragCancel } = useSortableList({
    ids: projects.map((project) => project.id),
    onReorder: handleReorder,
    disabled: !manualSort,
  });

  const columns = createProjectColumns({ onEdit: handleOpenEdit, onDelete: setDeleting }).filter(
    (column) => column.id !== "actions" || canUpdate || canDelete,
  );

  const table = useTable({
    features: TABLE_FEATURES,
    data: projects,
    columns,
    getRowId: (row) => row.id,
    state: {
      sorting: manualSort ? [] : sorting,
      columnFilters: manualSort ? [] : columnFilters,
      globalFilter: manualSort ? "" : deferredQuery,
      pagination: manualSort ? { pageIndex: 0, pageSize: Math.max(projects.length, 1) } : pagination,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    autoResetPageIndex: true,
    globalFilterFn: (row, _columnId, filterValue) => {
      const value = String(filterValue).toLowerCase().trim();

      if (!value) {
        return true;
      }

      const project = row.original;
      return [project.name, project.owner, project.description].some((field) => field.toLowerCase().includes(value));
    },
  });

  const rows = table.getRowModel().rows;
  const gridTemplate = getGridTemplate(table.getVisibleLeafColumns().map((column) => column.id));
  const selectedRows = table.getSelectedRowModel().rows;
  const selectedCount = selectedRows.length;
  const pageCount = table.getPageCount();
  const pageIndex = table.state.pagination.pageIndex;
  const totalRows = table.getPrePaginatedRowModel().rows.length;
  const rowIds = useMemo(() => rows.map((row) => row.id), [rows]);
  const rowVirtualizer = useVirtualRows({
    count: rows.length,
    estimateSize: ROW_HEIGHT,
    overscan: 6,
    scrollRef,
    scrollMargin: HEADER_HEIGHT,
  });
  const gridStyle = useMemo<CSSProperties>(() => ({ gridTemplateColumns: gridTemplate }), [gridTemplate]);
  const virtualRows = rowVirtualizer.getVirtualItems();
  const virtualTotalSize = rowVirtualizer.getTotalSize();

  const rowGroupStyle = useMemo<CSSProperties>(() => ({ height: `${virtualTotalSize}px` }), [virtualTotalSize]);
  const activeProject = activeId ? projects.find((project) => project.id === activeId) : undefined;
  const tableHeaders = table.getHeaderGroups()[0]?.headers ?? [];

  const handleStatusFilter = (status: "all" | ProjectStatus) => {
    setColumnFilters(status === "all" ? [] : [{ id: "status", value: status }]);
  };

  const handleBulkDelete = async () => {
    if (selectedCount === 0) return;

    setBulkDeleting(true);
    try {
      await removeProjects(selectedRows.map((row) => row.id));
      setRowSelection({});
      setBulkDeleteOpen(false);
      await refresh();
      toast.add({ title: "批量删除完成", description: `已删除 ${selectedCount} 个项目`, type: "success" });
    } catch (cause) {
      toast.add({
        title: "批量删除失败",
        description: cause instanceof Error ? cause.message : "请稍后重试",
        type: "error",
      });
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleExport = () => {
    const exportRows = selectedCount > 0 ? selectedRows : table.getPrePaginatedRowModel().rows;
    const header = ["id", "name", "owner", "status", "updatedAt"];
    const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const body = exportRows.map((row) => {
      const project = row.original;
      return [project.id, project.name, project.owner, project.status, new Date(project.updatedAt).toISOString()]
        .map((value) => escape(value))
        .join(",");
    });
    const blob = new Blob([`\uFEFF${header.join(",")}\n${body.join("\n")}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "projects.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.add({ title: "已导出 CSV", description: `${exportRows.length} 条项目`, type: "success" });
  };

  const scrollKey = `${pageIndex}:${deferredQuery}:${statusFilter}:${manualSort}`;

  const handleToggleManualSort = () => {
    const next = !manualSort;
    setManualSort(next);

    if (next) {
      setQuery("");
      setSorting([]);
      setColumnFilters([]);
      toast.add({
        title: "手动排序已开启",
        description: "拖动行首手柄调整顺序；筛选和列排序已暂停。",
        type: "info",
      });
    } else {
      toast.add({
        title: "已退出手动排序",
        description: "筛选和列排序已恢复。",
        type: "info",
      });
    }
  };

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-5">
      <h1 className="text-3xl font-semibold tracking-[-0.03em]">项目</h1>

      <div className="bg-muted/20 grid grid-cols-2 divide-x divide-y overflow-hidden rounded-xl border sm:grid-cols-4 sm:divide-y-0">
        {[
          { label: "全部项目", value: counts.total },
          { label: "进行中", value: counts.active },
          { label: "已暂停", value: counts.paused },
          { label: "已完成", value: counts.completed },
        ].map((stat) => (
          <div key={stat.label} className="p-4">
            <p className="text-muted-foreground font-mono text-[9px] tracking-[0.12em] uppercase">{stat.label}</p>
            <p className="mt-1.5 font-mono text-2xl tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1 sm:max-w-xs">
          <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索项目、负责人…"
            className="pl-8"
            aria-label="搜索项目"
            disabled={manualSort}
          />
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => handleStatusFilter(filter.id)}
              aria-pressed={statusFilter === filter.id}
              disabled={manualSort}
              className={cn(
                "rounded-md px-2.5 py-1.5 font-mono text-[10px] tracking-[0.08em] transition-colors disabled:opacity-40",
                statusFilter === filter.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant={manualSort ? "default" : "outline"} size="sm" onClick={handleToggleManualSort}>
            <GripVerticalIcon />
            {manualSort ? "完成排序" : "手动排序"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={loading}>
            <RefreshCwIcon className={cn(loading && "animate-spin")} />
            刷新
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger className="border-input bg-background hover:bg-muted inline-flex h-7 items-center gap-1 rounded-md border px-2 text-xs transition-colors">
              <Columns3Icon className="size-3.5" />列
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>显示列</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllLeafColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(checked) => column.toggleVisibility(checked)}
                  >
                    {typeof column.columnDef.header === "string" ? column.columnDef.header : column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Can permission="project:export">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <DownloadIcon />
              导出 CSV
            </Button>
          </Can>
          <Can permission="project:create">
            <Button size="sm" onClick={handleOpenCreate}>
              <PlusIcon />
              新建项目
            </Button>
          </Can>
        </div>
      </div>

      {selectedCount > 0 && (
        <div className="bg-muted/40 flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-xs">
          <span className="font-medium">已选择 {selectedCount} 项</span>
          <Can permission="project:delete">
            <Button variant="destructive" size="sm" onClick={() => setBulkDeleteOpen(true)}>
              <Trash2Icon />
              批量删除
            </Button>
          </Can>
          <Button variant="ghost" size="sm" onClick={() => setRowSelection({})}>
            清除选择
          </Button>
        </div>
      )}

      {error && (
        <div className="border-destructive/30 bg-destructive/5 text-destructive flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 text-sm">
          <span className="flex-1">{error.message}</span>
          <Button variant="outline" size="sm" onClick={() => void refresh()}>
            重试
          </Button>
        </div>
      )}

      <div className="bg-card/60 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border">
        <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <FolderKanbanIcon className="text-muted-foreground size-3.5" />
            <span className="text-xs font-medium">项目列表</span>
          </div>
          <span className="text-muted-foreground font-mono text-[10px]">
            {manualSort
              ? `${totalRows} 个结果 · 全部显示`
              : `${totalRows} 个结果 · 第 ${pageIndex + 1}/${pageCount} 页`}
          </span>
        </div>

        {loading && !data ? (
          <div className="min-w-195">
            <div className="bg-muted/20 grid h-10 items-center border-b" style={DEFAULT_GRID_STYLE}>
              <span />
              <span />
              {["项目", "负责人", "状态", "更新", "操作"].map((label) => (
                <span key={label} className="text-muted-foreground px-3 text-[11px] font-medium">
                  {label}
                </span>
              ))}
            </div>
            {SKELETON_ROWS.map((row) => (
              <div key={row} className="grid h-17 items-center border-b" style={DEFAULT_GRID_STYLE}>
                <span />
                <span />
                <div className="flex items-center gap-3 px-3">
                  <div className="bg-muted size-8 animate-pulse rounded-lg" />
                  <div className="space-y-1.5">
                    <div className="bg-muted h-3 w-28 animate-pulse rounded-full" />
                    <div className="bg-muted h-2 w-40 animate-pulse rounded-full" />
                  </div>
                </div>
                <div className="px-3">
                  <div className="bg-muted h-3 w-16 animate-pulse rounded-full" />
                </div>
                <div className="px-3">
                  <div className="bg-muted h-4 w-14 animate-pulse rounded-full" />
                </div>
                <div className="px-3">
                  <div className="bg-muted h-3 w-10 animate-pulse rounded-full" />
                </div>
                <div className="flex justify-end px-3">
                  <div className="bg-muted h-6 w-12 animate-pulse rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : rows.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            measuring={DROPPABLE_MEASURING}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div key={scrollKey} ref={scrollRef} className="min-h-0 flex-1 overflow-auto">
              <div role="table" aria-label="项目列表" aria-rowcount={rows.length} className="min-w-195">
                <div
                  role="row"
                  className="bg-card sticky top-0 z-10 grid h-10 items-center border-b px-3"
                  style={gridStyle}
                >
                  <div role="columnheader" aria-label="拖动排序" />
                  {tableHeaders.map((header) => {
                    const sorted = header.column.getIsSorted();
                    const handleSort = header.column.getToggleSortingHandler();
                    const ariaSort = sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none";

                    return (
                      <div
                        key={header.id}
                        role="columnheader"
                        aria-sort={ariaSort}
                        className={cn("px-3", header.column.id === "actions" && "text-right")}
                      >
                        {header.column.getCanSort() ? (
                          <button
                            type="button"
                            onClick={handleSort}
                            disabled={manualSort}
                            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-[11px] font-medium disabled:opacity-50"
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {sorted === "asc" ? (
                              <ArrowUpIcon className="size-3" />
                            ) : sorted === "desc" ? (
                              <ArrowDownIcon className="size-3" />
                            ) : (
                              <ArrowUpDownIcon className="size-3 opacity-40" />
                            )}
                          </button>
                        ) : (
                          <span className="text-muted-foreground text-[11px] font-medium">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
                  <div role="rowgroup" className="relative" style={rowGroupStyle}>
                    {virtualRows.map((virtualRow) => {
                      const row = rows[virtualRow.index];

                      return (
                        <ProjectRow
                          key={row.id}
                          row={row}
                          virtualStart={virtualRow.start - HEADER_HEIGHT}
                          sortable={manualSort}
                          gridTemplate={gridTemplate}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </div>
            </div>

            <DragOverlay>{activeProject ? <ProjectOverlay project={activeProject} /> : null}</DragOverlay>
          </DndContext>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
            <div className="bg-muted flex size-10 items-center justify-center rounded-full">
              <InboxIcon className="text-muted-foreground size-4" />
            </div>
            <p className="mt-4 text-sm font-medium">没有匹配的项目</p>
            <p className="text-muted-foreground mt-1 text-xs">换个关键词，或者创建一个新项目。</p>
            <Can permission="project:create">
              <Button variant="outline" size="sm" className="mt-4" onClick={handleOpenCreate}>
                <PlusIcon />
                新建项目
              </Button>
            </Can>
          </div>
        )}

        {!manualSort && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
            <p className="text-muted-foreground font-mono text-[10px]">
              第 {pageIndex + 1} / {pageCount} 页 · 每页 {pagination.pageSize} 条
            </p>

            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-mono text-[10px]">每页</span>
              <select
                value={pagination.pageSize}
                onChange={(event) => {
                  const nextSize = Number(event.target.value);
                  setPagination({ pageIndex: 0, pageSize: nextSize });
                }}
                aria-label="每页条数"
                className="border-input bg-background focus-visible:border-ring h-7 rounded-md border px-2 font-mono text-[10px] outline-none"
              >
                {[25, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>

              <Button
                variant="outline"
                size="icon-sm"
                aria-label="第一页"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeftIcon />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="上一页"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeftIcon />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="下一页"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRightIcon />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="最后一页"
                onClick={() => table.lastPage()}
                disabled={!table.getCanLastPage()}
              >
                <ChevronsRightIcon />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "编辑项目" : "新建项目"}</DialogTitle>
            <DialogDescription>
              {editing ? "更新项目的基础信息和状态。" : "创建一个新项目，稍后可以继续编辑。"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="project-name">项目名称</Label>
              <Input
                id="project-name"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="例如：设计系统迁移"
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="project-owner">负责人</Label>
              <Input
                id="project-owner"
                value={form.owner}
                onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))}
                placeholder="例如：林舟"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="project-description">描述</Label>
              <Textarea
                id="project-description"
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="一句话说明这个项目要解决什么。"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="project-status">状态</Label>
              <select
                id="project-status"
                value={form.status}
                onChange={(event) => {
                  const { value } = event.target;

                  if (value === "active" || value === "paused" || value === "completed") {
                    setForm((current) => ({ ...current, status: value }));
                  }
                }}
                className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3"
              >
                <option value="active">进行中</option>
                <option value="paused">已暂停</option>
                <option value="completed">已完成</option>
              </select>
            </div>

            {formError && <p className="text-destructive text-xs">{formError}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "保存中…" : "保存"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={bulkDeleteOpen}
        onOpenChange={(open) => {
          setBulkDeleteOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除 {selectedCount} 个项目？</AlertDialogTitle>
            <AlertDialogDescription>选中的项目会被永久删除，这个操作只影响本地 mock 数据。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setBulkDeleteOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={() => void handleBulkDelete()} disabled={bulkDeleting}>
              {bulkDeleting ? "删除中…" : "确认删除"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除项目？</AlertDialogTitle>
            <AlertDialogDescription>
              「{deleting?.name}」会被永久删除。这个操作只影响本地 mock 数据。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              取消
            </Button>
            <Button variant="destructive" onClick={() => void handleConfirmDelete()} disabled={deletingBusy}>
              {deletingBusy ? "删除中…" : "删除"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export { Projects };

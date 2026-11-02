import { cn } from "cn";
import { FolderKanbanIcon, InboxIcon, PencilIcon, PlusIcon, RefreshCwIcon, SearchIcon, Trash2Icon } from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";
import type { SubmitEvent } from "react";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useRequest } from "@/hooks/use-request";
import type { Project, ProjectInput, ProjectStatus } from "@/lib/projects";
import { PROJECT_STATUS_LABELS, createProject, listProjects, removeProject, updateProject } from "@/lib/projects";

const STATUS_META: Record<ProjectStatus, { dot: string; tone: string }> = {
  active: {
    dot: "bg-emerald-500",
    tone: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  paused: { dot: "bg-amber-500", tone: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400" },
  completed: {
    dot: "bg-muted-foreground/60",
    tone: "border-border bg-muted/40 text-muted-foreground",
  },
};

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

const DATE_FORMATTER = new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric" });
const SKELETON_ROWS = ["one", "two", "three", "four"];

/**
 * 项目状态徽标
 *
 * @param props.status - 项目状态
 */
const StatusBadge = ({ status }: { status: ProjectStatus }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[9px] tracking-[0.08em]",
      STATUS_META[status].tone,
    )}
  >
    <span className={cn("size-1.5 rounded-full", STATUS_META[status].dot)} />
    {PROJECT_STATUS_LABELS[status]}
  </span>
);

/**
 * 项目 CRUD 示例页
 */
const Projects = () => {
  const { data, error, loading, refresh } = useRequest((signal) => listProjects(signal));
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ProjectStatus>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<ProjectInput>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const projects = data ?? [];
  const filtered = projects.filter((project) => {
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    const matchesQuery =
      !deferredQuery
      || project.name.toLowerCase().includes(deferredQuery)
      || project.owner.toLowerCase().includes(deferredQuery)
      || project.description.toLowerCase().includes(deferredQuery);

    return matchesStatus && matchesQuery;
  });

  const counts = {
    total: projects.length,
    active: projects.filter((project) => project.status === "active").length,
    paused: projects.filter((project) => project.status === "paused").length,
    completed: projects.filter((project) => project.status === "completed").length,
  };

  useEffect(() => {
    const timer = notice ? window.setTimeout(() => setNotice(null), 3500) : undefined;

    return () => {
      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
    };
  }, [notice]);

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
        setNotice("项目已更新");
      } else {
        await createProject(next);
        setNotice("项目已创建");
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
      setNotice("项目已删除");
      setDeleting(null);
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : "删除失败");
    } finally {
      setDeletingBusy(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b pb-5">
        <div>
          <p className="text-muted-foreground font-mono text-[10px] tracking-[0.26em] uppercase">
            Workspace / Projects
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">项目</h1>
          <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed">
            一个完整的 CRUD 垂直切片：列表、筛选、创建、编辑和删除都由本地 mock service 驱动。
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <PlusIcon />
          新建项目
        </Button>
      </header>

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
          />
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setStatusFilter(filter.id)}
              aria-pressed={statusFilter === filter.id}
              className={cn(
                "rounded-md px-2.5 py-1.5 font-mono text-[10px] tracking-[0.08em] transition-colors",
                statusFilter === filter.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <Button variant="outline" size="sm" className="ml-auto" onClick={() => void refresh()} disabled={loading}>
          <RefreshCwIcon className={cn(loading && "animate-spin")} />
          刷新
        </Button>
      </div>

      {notice && (
        <div
          role="status"
          aria-live="polite"
          className="border-border/70 bg-muted/30 text-muted-foreground rounded-lg border px-3 py-2 text-xs"
        >
          {notice}
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

      <div className="bg-card/60 overflow-hidden rounded-xl border">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <FolderKanbanIcon className="text-muted-foreground size-3.5" />
            <span className="text-xs font-medium">项目列表</span>
          </div>
          <span className="text-muted-foreground font-mono text-[10px]">{filtered.length} 个结果</span>
        </div>

        {loading && !data ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>项目</TableHead>
                  <TableHead>负责人</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>更新</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {SKELETON_ROWS.map((row) => (
                  <TableRow key={row}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="bg-muted size-8 animate-pulse rounded-lg" />
                        <div className="space-y-1.5">
                          <div className="bg-muted h-3 w-28 animate-pulse rounded-full" />
                          <div className="bg-muted h-2 w-40 animate-pulse rounded-full" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="bg-muted h-3 w-16 animate-pulse rounded-full" />
                    </TableCell>
                    <TableCell>
                      <div className="bg-muted h-4 w-14 animate-pulse rounded-full" />
                    </TableCell>
                    <TableCell>
                      <div className="bg-muted h-3 w-10 animate-pulse rounded-full" />
                    </TableCell>
                    <TableCell>
                      <div className="bg-muted ml-auto h-6 w-12 animate-pulse rounded-md" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>项目</TableHead>
                  <TableHead>负责人</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>更新</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div className="flex min-w-64 items-center gap-3">
                        <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg font-mono text-[11px]">
                          {project.name.slice(0, 1)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{project.name}</p>
                          <p className="text-muted-foreground mt-0.5 max-w-md truncate text-[11px]">
                            {project.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{project.owner}</TableCell>
                    <TableCell>
                      <StatusBadge status={project.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-[11px]">
                      {DATE_FORMATTER.format(project.updatedAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`编辑 ${project.name}`}
                          onClick={() => handleOpenEdit(project)}
                        >
                          <PencilIcon />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`删除 ${project.name}`}
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleting(project)}
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="bg-muted flex size-10 items-center justify-center rounded-full">
              <InboxIcon className="text-muted-foreground size-4" />
            </div>
            <p className="mt-4 text-sm font-medium">没有匹配的项目</p>
            <p className="text-muted-foreground mt-1 text-xs">换个关键词，或者创建一个新项目。</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={handleOpenCreate}>
              <PlusIcon />
              新建项目
            </Button>
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

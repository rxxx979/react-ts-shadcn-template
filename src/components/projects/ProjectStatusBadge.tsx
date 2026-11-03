import { cn } from "cn";

import { PROJECT_STATUS_LABELS } from "@/lib/projects";
import type { ProjectStatus } from "@/lib/projects";

const STATUS_META: Record<ProjectStatus, { dot: string; tone: string }> = {
  active: {
    dot: "bg-emerald-500",
    tone: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  paused: {
    dot: "bg-amber-500",
    tone: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  completed: {
    dot: "bg-muted-foreground/60",
    tone: "border-border bg-muted/40 text-muted-foreground",
  },
};

/**
 * 项目状态徽标
 *
 * @param props.status - 项目状态
 */
const ProjectStatusBadge = ({ status }: { status: ProjectStatus }) => (
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

export { ProjectStatusBadge };

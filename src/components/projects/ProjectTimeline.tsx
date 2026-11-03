import { cn } from "cn";
import { CheckIcon, PauseIcon } from "lucide-react";

import type { ProjectActivity, ProjectStatus } from "@/lib/projects";

const STAGES = [
  { label: "需求确认", description: "明确范围、目标和验收标准。" },
  { label: "设计", description: "完成信息架构与视觉方案。" },
  { label: "开发", description: "实现交互、数据和边界状态。" },
  { label: "验收", description: "走查、验收并准备发布。" },
] as const;

const DATE_FORMATTER = new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric" });

const getCurrentStage = (status: ProjectStatus): number => {
  if (status === "completed") {
    return STAGES.length;
  }

  return status === "paused" ? 1 : 2;
};

/**
 * 纵向步骤 + 活动时间线
 *
 * @param props.status - 项目状态
 * @param props.activities - 活动记录
 */
const ProjectTimeline = ({ status, activities }: { status: ProjectStatus; activities: ProjectActivity[] }) => {
  const currentStage = getCurrentStage(status);
  const paused = status === "paused";
  const percent = status === "completed" ? 100 : paused ? 34 : 62;

  return (
    <section className="bg-card/60 rounded-xl border p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium">项目进度</h2>
          <p className="text-muted-foreground mt-1 text-xs">阶段状态与活动记录合并展示。</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl tracking-tight">{percent}%</p>
          <p className="text-muted-foreground mt-0.5 font-mono text-[9px]">
            {status === "completed" ? "已交付" : paused ? "已暂停" : "进行中"}
          </p>
        </div>
      </div>

      <ol className="mt-6">
        {STAGES.map((stage, index) => {
          const done = index < currentStage;
          const current = index === currentStage && status !== "completed";
          const stageActivities = activities.filter((item) => item.stage === index);
          const lastActivity = stageActivities.at(-1);

          return (
            <li key={stage.label} className="relative grid grid-cols-[32px_minmax(0,1fr)] gap-3 pb-6 last:pb-0">
              {index < STAGES.length - 1 && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-8 bottom-0 left-4 w-px transition-colors duration-500",
                    done && "bg-primary",
                    current && !paused && "bg-primary/30",
                    current && paused && "bg-amber-500/30",
                    !done && !current && "bg-border",
                  )}
                />
              )}

              <span
                className={cn(
                  "relative z-10 flex size-8 items-center justify-center rounded-full border font-mono text-[10px] transition-colors duration-500",
                  done && "border-primary bg-primary text-primary-foreground",
                  current && !paused && "border-primary bg-background text-primary ring-4 ring-primary/10",
                  current
                    && paused
                    && "border-amber-500 bg-background text-amber-600 ring-4 ring-amber-500/10 dark:text-amber-400",
                  !done && !current && "border-border bg-background text-muted-foreground/50",
                )}
              >
                {done ? (
                  <CheckIcon className="size-3.5" />
                ) : current && paused ? (
                  <PauseIcon className="size-3" />
                ) : (
                  index + 1
                )}
                {current && !paused && (
                  <span className="border-primary/30 absolute inset-0 animate-ping rounded-full border motion-reduce:animate-none" />
                )}
              </span>

              <div className="min-w-0 pt-0.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <p className={cn("text-sm font-medium", !done && !current && "text-muted-foreground")}>
                      {stage.label}
                    </p>
                    <span
                      className={cn(
                        "font-mono text-[9px]",
                        done && "text-primary",
                        current && !paused && "text-primary",
                        current && paused && "text-amber-600 dark:text-amber-400",
                        !done && !current && "text-muted-foreground/50",
                      )}
                    >
                      {done ? "已完成" : current ? (paused ? "已暂停" : "进行中") : "未开始"}
                    </span>
                  </div>
                  {lastActivity && (
                    <span className="text-muted-foreground font-mono text-[9px]">
                      {DATE_FORMATTER.format(lastActivity.at)}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground mt-1 text-xs leading-5">{stage.description}</p>

                {stageActivities.length > 0 && (
                  <ul className="border-border/70 mt-3 space-y-2.5 border-l pl-4">
                    {stageActivities.map((item) => (
                      <li key={item.id} className="relative">
                        <span className="bg-muted-foreground/40 ring-card absolute top-1.5 -left-[calc(1rem+2.5px)] size-1.5 rounded-full ring-4" />
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <p className="text-xs font-medium">{item.label}</p>
                          <span className="text-muted-foreground font-mono text-[9px]">
                            {DATE_FORMATTER.format(item.at)}
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-0.5 text-[11px] leading-5">
                          {item.description} · {item.actor}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
};

export { ProjectTimeline };

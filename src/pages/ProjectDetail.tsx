import { ArrowLeftIcon, CalendarIcon, UserRoundIcon } from "lucide-react";
import { Link, useLoaderData } from "react-router";

import { ProjectStatusBadge } from "@/components/projects/ProjectStatusBadge";
import { ProjectTimeline } from "@/components/projects/ProjectTimeline";
import { Button } from "@/components/ui/button";
import { getProjectActivity } from "@/lib/projects";
import type { Project } from "@/lib/projects";
import { NotFound } from "@/pages/NotFound";

const projectsLink = <Link to="/projects" />;
const DATE_FORMATTER = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

/**
 * 项目详情：data mode loader + 活动记录
 */
const ProjectDetail = () => {
  const project = useLoaderData<Project | null>();

  if (!project) {
    return <NotFound />;
  }

  const activity = getProjectActivity(project);

  return (
    <div className="flex w-full flex-1 flex-col gap-5">
      <div>
        <Button variant="ghost" size="sm" className="-ml-2" nativeButton={false} render={projectsLink}>
          <ArrowLeftIcon />
          项目
        </Button>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-[-0.04em]">{project.name}</h1>
              <ProjectStatusBadge status={project.status} />
            </div>
            <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">{project.description}</p>
          </div>
          <p className="text-muted-foreground font-mono text-[10px]">
            更新于 {DATE_FORMATTER.format(project.updatedAt)}
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex flex-col gap-5">
          <section className="bg-card/60 rounded-xl border p-5">
            <h2 className="text-sm font-medium">概览</h2>
            <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
              {[
                { label: "负责人", value: project.owner, icon: <UserRoundIcon className="size-3.5" /> },
                {
                  label: "更新时间",
                  value: DATE_FORMATTER.format(project.updatedAt),
                  icon: <CalendarIcon className="size-3.5" />,
                },
                { label: "项目 ID", value: project.id, icon: null },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-muted-foreground flex items-center gap-1.5 font-mono text-[9px] tracking-[0.1em] uppercase">
                    {item.icon}
                    {item.label}
                  </p>
                  <p className="mt-1.5 truncate text-sm font-medium">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          <ProjectTimeline status={project.status} activities={activity} />
        </div>

        <aside className="flex flex-col gap-5">
          <section className="bg-card/60 rounded-xl border p-5">
            <p className="text-muted-foreground font-mono text-[9px] tracking-[0.12em] uppercase">Status</p>
            <div className="mt-3">
              <ProjectStatusBadge status={project.status} />
            </div>
            <p className="text-muted-foreground mt-4 text-xs leading-5">
              项目状态会同步到列表的筛选和统计，详情页数据由 route loader 提供。
            </p>
          </section>

          <section className="bg-card/60 rounded-xl border p-5">
            <p className="text-muted-foreground font-mono text-[9px] tracking-[0.12em] uppercase">Owner</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-full font-mono text-xs">
                {project.owner.slice(0, 1)}
              </div>
              <div>
                <p className="text-sm font-medium">{project.owner}</p>
                <p className="text-muted-foreground text-[11px]">项目负责人</p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export { ProjectDetail };

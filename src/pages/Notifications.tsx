import { CheckCheckIcon, RadioIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { NotificationList } from "@/components/notifications/NotificationList";
import { Button } from "@/components/ui/button";
import type { AppNotification } from "@/stores/notifications";
import { useNotificationStore } from "@/stores/notifications";

const ICON_STYLES = {
  info: "text-sky-600 dark:text-sky-400",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
} as const;

const TODAY_START = new Date().setHours(0, 0, 0, 0);

const NOTIFICATION_TYPES = [
  { type: "info", label: "信息" },
  { type: "success", label: "成功" },
  { type: "warning", label: "提醒" },
] as const;

/**
 * 完整通知中心
 */
const Notifications = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const items = useNotificationStore((state) => state.items);
  const markRead = useNotificationStore((state) => state.markRead);
  const markUnread = useNotificationStore((state) => state.markUnread);
  const handleMarkAllRead = useNotificationStore((state) => state.markAllRead);
  const unread = items.filter((item) => item.readAt === null).length;
  const filtered = useMemo(
    () => (filter === "unread" ? items.filter((item) => item.readAt === null) : items),
    [filter, items],
  );
  const typeCounts = useMemo(
    () => ({
      info: items.filter((item) => item.type === "info").length,
      success: items.filter((item) => item.type === "success").length,
      warning: items.filter((item) => item.type === "warning").length,
    }),
    [items],
  );

  const handleSelect = (item: AppNotification) => {
    markRead(item.id);
    if (item.href) void navigate(item.href);
  };

  const handleToggleRead = (item: AppNotification) => {
    if (item.readAt === null) markRead(item.id);
    else markUnread(item.id);
  };

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">通知</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
            {unread > 0 ? `${unread} 条未读通知` : "全部通知都已读"}
          </p>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCheckIcon />
            全部已读
          </Button>
        )}
      </div>

      <div className="grid min-h-0 gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="bg-card/60 min-w-0 overflow-hidden rounded-xl border">
          <div className="flex flex-wrap items-center gap-1 border-b px-3 py-2">
            {(["all", "unread"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                aria-pressed={filter === value}
                className={
                  filter === value
                    ? "bg-foreground text-background rounded-md px-2.5 py-1.5 font-mono text-[10px]"
                    : "text-muted-foreground hover:bg-muted rounded-md px-2.5 py-1.5 font-mono text-[10px]"
                }
              >
                {value === "all" ? `全部 ${items.length}` : `未读 ${unread}`}
              </button>
            ))}
            <span className="text-muted-foreground/60 ml-auto font-mono text-[9px]">SSE CONNECTED</span>
          </div>

          <NotificationList items={filtered} onSelect={handleSelect} onToggleRead={handleToggleRead} />
        </div>

        <aside className="flex flex-col gap-5 xl:sticky xl:top-0 xl:h-fit">
          <section className="bg-card/60 rounded-xl border p-5">
            <p className="text-muted-foreground font-mono text-[9px] tracking-[0.12em] uppercase">Unread</p>
            <p className="mt-2 font-mono text-4xl tracking-tight">{unread}</p>
            <p className="text-muted-foreground mt-1 text-[11px]">条通知等待查看</p>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-4">
              <div>
                <p className="text-muted-foreground font-mono text-[9px]">今天</p>
                <p className="mt-1 text-sm font-medium">
                  {items.filter((item) => item.createdAt >= TODAY_START).length}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground font-mono text-[9px]">全部</p>
                <p className="mt-1 text-sm font-medium">{items.length}</p>
              </div>
            </div>
          </section>

          <section className="bg-card/60 rounded-xl border p-5">
            <p className="text-muted-foreground font-mono text-[9px] tracking-[0.12em] uppercase">Types</p>
            <div className="mt-3 space-y-2">
              {NOTIFICATION_TYPES.map(({ type, label }) => (
                <div key={type} className="flex items-center justify-between gap-3 text-[11px]">
                  <span className="flex items-center gap-2">
                    <span className={ICON_STYLES[type]}>●</span>
                    {label}
                  </span>
                  <span className="text-muted-foreground font-mono">{typeCounts[type]}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-card/60 rounded-xl border p-5">
            <div className="flex items-center gap-2">
              <RadioIcon className="text-muted-foreground size-3.5" />
              <p className="text-xs font-medium">实时通道</p>
            </div>
            <p className="text-muted-foreground mt-2 text-[11px] leading-5">
              通过本地 mock SSE 推送，每 12 秒生成一条新通知。
            </p>
          </section>
        </aside>
      </div>

      <p className="text-muted-foreground/60 font-mono text-[9px]">当前为本地 mock 通知，点击通知会跳转并标记已读。</p>
    </div>
  );
};

export { Notifications };

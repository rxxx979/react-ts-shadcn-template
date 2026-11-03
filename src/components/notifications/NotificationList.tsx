import { cn } from "cn";
import { CircleAlertIcon, CircleCheckIcon, InfoIcon } from "lucide-react";

import type { AppNotification } from "@/stores/notifications";

const TIME_FORMATTER = new Intl.DateTimeFormat("zh-CN", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const ICONS = { info: InfoIcon, success: CircleCheckIcon, warning: CircleAlertIcon } as const;
const ICON_STYLES = {
  info: "text-sky-600 dark:text-sky-400",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
} as const;

interface NotificationGroup {
  label: string;
  items: AppNotification[];
}

const groupNotifications = (items: AppNotification[]): NotificationGroup[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 24 * 60 * 60 * 1000;
  const groups: NotificationGroup[] = [
    { label: "今天", items: [] },
    { label: "昨天", items: [] },
    { label: "更早", items: [] },
  ];

  for (const item of items) {
    if (item.createdAt >= today) groups[0].items.push(item);
    else if (item.createdAt >= yesterday) groups[1].items.push(item);
    else groups[2].items.push(item);
  }

  return groups.filter((group) => group.items.length > 0);
};

interface NotificationListProps {
  items: AppNotification[];
  onSelect: (item: AppNotification) => void;
  onToggleRead: (item: AppNotification) => void;
  compact?: boolean;
}

const NotificationList = ({ items, onSelect, onToggleRead, compact = false }: NotificationListProps) => {
  if (items.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center px-4 py-12 text-center">
        <p className="text-xs font-medium">暂无通知</p>
        <p className="mt-1 text-[11px]">新的项目更新会出现在这里。</p>
      </div>
    );
  }

  return (
    <div>
      {groupNotifications(items).map((group) => (
        <section key={group.label}>
          <p
            className={cn(
              "text-muted-foreground border-b font-mono text-[9px] tracking-[0.12em] uppercase",
              compact ? "bg-muted/30 px-3 py-1" : "px-5 py-2",
            )}
          >
            {group.label}
          </p>
          {group.items.map((item) => {
            const Icon = ICONS[item.type];
            const unread = item.readAt === null;

            return (
              <div key={item.id} className={cn("border-b last:border-b-0", unread && "bg-primary/[0.035]")}>
                <div
                  className={cn(
                    "flex items-start gap-3 transition-colors hover:bg-muted/30",
                    compact ? "px-3 py-2" : "px-5 py-4",
                  )}
                >
                  <span
                    className={cn(
                      "bg-muted mt-0.5 flex shrink-0 items-center justify-center rounded-full",
                      compact ? "size-5" : "size-8",
                      ICON_STYLES[item.type],
                    )}
                  >
                    <Icon className={compact ? "size-2.5" : "size-4"} />
                  </span>
                  <button type="button" onClick={() => onSelect(item)} className="min-w-0 flex-1 text-left">
                    <span className="flex items-center gap-2">
                      <span className={cn("text-xs", unread ? "font-medium" : "text-muted-foreground")}>
                        {item.title}
                      </span>
                      {unread && <span className="bg-primary size-1.5 shrink-0 rounded-full" />}
                    </span>
                    <span
                      className={cn(
                        "text-muted-foreground mt-1 block leading-4",
                        compact ? "line-clamp-1 text-[9px]" : "text-[11px]",
                      )}
                    >
                      {item.description}
                    </span>
                    <span className="text-muted-foreground/50 mt-1 block font-mono text-[9px]">
                      {TIME_FORMATTER.format(item.createdAt)}
                    </span>
                  </button>
                  {!compact && (
                    <button
                      type="button"
                      onClick={() => onToggleRead(item)}
                      className="text-muted-foreground hover:text-foreground shrink-0 text-[10px]"
                    >
                      {unread ? "已读" : "未读"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
};

export { NotificationList };

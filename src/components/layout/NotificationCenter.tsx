import { BellIcon, CheckCheckIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";

import { NotificationList } from "@/components/notifications/NotificationList";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotificationStream } from "@/hooks/use-notification-stream";
import type { AppNotification } from "@/stores/notifications";
import { useNotificationStore } from "@/stores/notifications";

/**
 * 顶栏通知中心
 */
const NotificationCenter = () => {
  useNotificationStream();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
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

  const handleSelect = (item: AppNotification) => {
    markRead(item.id);
    setOpen(false);
    if (item.href) void navigate(item.href);
  };

  const handleToggleRead = (item: AppNotification) => {
    if (item.readAt === null) markRead(item.id);
    else markUnread(item.id);
  };

  return (
    <Popover open={open} onOpenChange={(next) => setOpen(next)}>
      <PopoverTrigger
        aria-label={unread > 0 ? `通知，${unread} 条未读` : "通知"}
        className="hover:bg-muted text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 relative inline-flex size-8 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-3"
      >
        <BellIcon className="size-4" />
        {unread > 0 && (
          <span className="bg-primary text-primary-foreground ring-background absolute -top-0.5 -right-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-0.5 font-mono text-[7px] ring-2">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[320px] p-0">
        <PopoverHeader className="border-b px-3 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <PopoverTitle className="text-sm">通知</PopoverTitle>
              <PopoverDescription className="text-muted-foreground mt-0.5 text-[10px]">
                {unread > 0 ? `${unread} 条未读` : "全部已读"}
              </PopoverDescription>
            </div>
            {unread > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-[10px] transition-colors"
              >
                <CheckCheckIcon className="size-3" />
                全部已读
              </button>
            )}
          </div>

          <div className="bg-muted/50 mt-2 inline-flex rounded-md p-0.5">
            {(["all", "unread"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                aria-pressed={filter === value}
                className={
                  filter === value
                    ? "bg-background text-foreground rounded px-2 py-1 text-[10px] shadow-sm"
                    : "text-muted-foreground px-2 py-1 text-[10px]"
                }
              >
                {value === "all" ? "全部" : "未读"}
              </button>
            ))}
          </div>
        </PopoverHeader>

        <div className="max-h-72 overflow-y-auto">
          <NotificationList items={filtered} onSelect={handleSelect} onToggleRead={handleToggleRead} compact />
        </div>

        <div className="border-t p-1.5">
          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex w-full items-center justify-center rounded-md px-2 py-2 text-[11px] transition-colors"
          >
            查看全部通知
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export { NotificationCenter };

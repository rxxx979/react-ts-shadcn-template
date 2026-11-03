import { cn } from "cn";
import { BellIcon, CheckCheckIcon, CircleAlertIcon, CircleCheckIcon, InfoIcon } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { AppNotification } from "@/stores/notifications";
import { useNotificationStore } from "@/stores/notifications";

const ICONS = {
  info: InfoIcon,
  success: CircleCheckIcon,
  warning: CircleAlertIcon,
} as const;

const ICON_STYLES = {
  info: "text-sky-600 dark:text-sky-400",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
} as const;

/**
 * 顶栏通知中心
 */
const NotificationCenter = () => {
  const items = useNotificationStore((state) => state.items);
  const handleMarkRead = useNotificationStore((state) => state.markRead);
  const handleMarkAllRead = useNotificationStore((state) => state.markAllRead);
  const unread = items.filter((item) => !item.read).length;

  return (
    <Popover>
      <PopoverTrigger
        aria-label={unread > 0 ? `通知，${unread} 条未读` : "通知"}
        className="hover:bg-muted text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 relative inline-flex size-8 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-3"
      >
        <BellIcon className="size-4" />
        {unread > 0 && (
          <span className="bg-primary text-primary-foreground absolute top-1 right-1 flex size-4 items-center justify-center rounded-full font-mono text-[8px]">
            {unread}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <PopoverHeader className="flex flex-row items-center justify-between gap-3 border-b px-4 py-3">
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
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-[11px] transition-colors"
            >
              <CheckCheckIcon className="size-3" />
              全部已读
            </button>
          )}
        </PopoverHeader>

        <div className="max-h-80 overflow-y-auto">
          {items.map((item) => (
            <NotificationItem key={item.id} item={item} onRead={handleMarkRead} />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

/**
 * 单条通知
 *
 * @param props.item - 通知
 * @param props.onRead - 标记已读
 */
const NotificationItem = ({ item, onRead }: { item: AppNotification; onRead: (id: string) => void }) => {
  const Icon = ICONS[item.type];

  return (
    <button
      type="button"
      onClick={() => onRead(item.id)}
      className={cn(
        "hover:bg-muted/40 flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors last:border-b-0",
        !item.read && "bg-primary/[0.035]",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted",
          ICON_STYLES[item.type],
        )}
      >
        <Icon className="size-3.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className={cn("text-xs", item.read ? "text-muted-foreground" : "font-medium")}>{item.title}</span>
          {!item.read && <span className="bg-primary size-1.5 shrink-0 rounded-full" />}
        </span>
        <span className="text-muted-foreground mt-1 block text-[11px] leading-4">{item.description}</span>
        <span className="text-muted-foreground/50 mt-1 block font-mono text-[9px]">{item.time}</span>
      </span>
    </button>
  );
};

export { NotificationCenter };

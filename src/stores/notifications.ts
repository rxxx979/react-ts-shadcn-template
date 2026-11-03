import { create } from "zustand";

type NotificationType = "info" | "success" | "warning";

interface AppNotification {
  id: string;
  title: string;
  description: string;
  href?: string;
  readAt: number | null;
  createdAt: number;
  type: NotificationType;
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n-1",
    title: "项目已归档",
    description: "「权限模型升级」已完成并归档。",
    href: "/projects/p-04",
    createdAt: Date.now() - 10 * MINUTE,
    readAt: null,
    type: "success",
  },
  {
    id: "n-2",
    title: "权限配置更新",
    description: "组件库权限已对访客关闭。",
    href: "/permissions",
    createdAt: Date.now() - HOUR,
    readAt: null,
    type: "info",
  },
  {
    id: "n-3",
    title: "待处理事项",
    description: "有 3 个项目超过 7 天没有更新。",
    href: "/projects",
    createdAt: Date.now() - 26 * HOUR,
    readAt: Date.now() - 20 * HOUR,
    type: "warning",
  },
];

interface NotificationState {
  items: AppNotification[];
  markRead: (id: string) => void;
  markUnread: (id: string) => void;
  markAllRead: () => void;
  addNotification: (item: Omit<AppNotification, "readAt">) => void;
}

const useNotificationStore = create<NotificationState>()((set) => ({
  items: INITIAL_NOTIFICATIONS,
  markRead: (id) => {
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, readAt: item.readAt ?? Date.now() } : item)),
    }));
  },
  markUnread: (id) => {
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, readAt: null } : item)),
    }));
  },
  markAllRead: () => {
    set((state) => ({ items: state.items.map((item) => ({ ...item, readAt: item.readAt ?? Date.now() })) }));
  },
  addNotification: (item) => {
    set((state) => ({
      items: state.items.some((entry) => entry.id === item.id)
        ? state.items
        : [{ ...item, readAt: null }, ...state.items],
    }));
  },
}));

export { useNotificationStore };
export type { AppNotification, NotificationType };

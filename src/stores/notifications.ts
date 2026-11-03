import { create } from "zustand";

type NotificationType = "info" | "success" | "warning";

interface AppNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: NotificationType;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n-1",
    title: "项目已归档",
    description: "「权限模型升级」已完成并归档。",
    time: "10 分钟前",
    read: false,
    type: "success",
  },
  {
    id: "n-2",
    title: "权限配置更新",
    description: "组件库权限已对访客关闭。",
    time: "1 小时前",
    read: false,
    type: "info",
  },
  {
    id: "n-3",
    title: "待处理事项",
    description: "有 3 个项目超过 7 天没有更新。",
    time: "昨天",
    read: true,
    type: "warning",
  },
];

interface NotificationState {
  items: AppNotification[];
  markRead: (id: string) => void;
  markAllRead: () => void;
}

const useNotificationStore = create<NotificationState>()((set) => ({
  items: INITIAL_NOTIFICATIONS,
  markRead: (id) => {
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, read: true } : item)),
    }));
  },
  markAllRead: () => {
    set((state) => ({ items: state.items.map((item) => ({ ...item, read: true })) }));
  },
}));

export { useNotificationStore };
export type { AppNotification, NotificationType };

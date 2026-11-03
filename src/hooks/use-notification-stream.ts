import { toast } from "@/components/ui/toast";
import { useSSE } from "@/hooks/use-sse";
import { notificationEventSchema } from "@/lib/notification-events";
import { installNotificationSseFetch } from "@/lib/notification-sse";
import { useNotificationStore } from "@/stores/notifications";

installNotificationSseFetch();

/**
 * 实时通知订阅：mock SSE -> store -> 顶栏角标
 */
const useNotificationStream = () => {
  const addNotification = useNotificationStore((state) => state.addNotification);

  return useSSE("/api/notifications/stream", {
    schema: notificationEventSchema,
    onEvent: (message) => {
      addNotification({ ...message.data, createdAt: Date.now() });
      toast.add({
        title: message.data.title,
        description: message.data.description,
        type: "info",
      });
    },
  });
};

export { useNotificationStream };

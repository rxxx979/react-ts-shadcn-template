import { z } from "zod";

const NotificationDataSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  href: z.string().optional(),
  type: z.enum(["info", "success", "warning"]),
});

const notificationEventSchema = z.discriminatedUnion("event", [
  z.object({ event: z.literal("notification"), data: NotificationDataSchema }),
]);

type NotificationPayload = z.infer<typeof NotificationDataSchema>;

export { NotificationDataSchema, notificationEventSchema };
export type { NotificationPayload };

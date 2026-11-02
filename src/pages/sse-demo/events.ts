import { z } from "zod";

const MetaSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  tags: z.array(z.string()),
});

const TokenSchema = z.object({
  text: z.string(),
});

const MetricSchema = z.object({
  label: z.string(),
  value: z.string(),
  hint: z.string(),
});

const DoneSchema = z.object({
  elapsedMs: z.number(),
  events: z.number(),
});

const demoEventSchema = z.discriminatedUnion("event", [
  z.object({ event: z.literal("meta"), data: MetaSchema }),
  z.object({ event: z.literal("token"), data: TokenSchema }),
  z.object({ event: z.literal("metric"), data: MetricSchema }),
  z.object({ event: z.literal("done"), data: DoneSchema }),
]);

type Meta = z.infer<typeof MetaSchema>;
type Metric = z.infer<typeof MetricSchema>;
type Done = z.infer<typeof DoneSchema>;

export { demoEventSchema, DoneSchema, MetricSchema, MetaSchema, TokenSchema };
export type { Done, Meta, Metric };

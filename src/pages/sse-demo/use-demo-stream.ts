import { useState } from "react";

import { useSSE } from "@/hooks/use-sse";
import { installDemoSseFetch } from "@/lib/sse-demo";

import { demoEventSchema } from "./events";
import type { Done, Meta, Metric } from "./events";

installDemoSseFetch();

const STAGES = ["meta", "token", "metric", "done"] as const;
type Stage = (typeof STAGES)[number];

interface LastFrame {
  event: Stage;
  data: unknown;
}

/**
 * Demo 业务状态：把 event 转换成页面可用的数据。
 */
const useDemoStream = () => {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [content, setContent] = useState("");
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [done, setDone] = useState<Done | null>(null);
  const [lastFrame, setLastFrame] = useState<LastFrame | null>(null);

  const {
    status,
    error,
    close,
    reconnect: reconnectStream,
  } = useSSE("/api/sse-demo", {
    schema: demoEventSchema,
    onEvent: (message) => {
      switch (message.event) {
        case "meta":
          setMeta(message.data);
          setContent("");
          setMetrics([]);
          setDone(null);
          setLastFrame({ event: "meta", data: message.data });
          break;
        case "token":
          setContent((current) => current + message.data.text);
          setLastFrame({ event: "token", data: message.data });
          break;
        case "metric":
          setMetrics((current) => [...current, message.data]);
          setLastFrame({ event: "metric", data: message.data });
          break;
        case "done":
          setDone(message.data);
          setLastFrame({ event: "done", data: message.data });
          break;
      }
    },
  });

  const counts: Record<Stage, number> = {
    meta: meta ? 1 : 0,
    token: content.length,
    metric: metrics.length,
    done: done ? 1 : 0,
  };

  const reconnect = () => {
    setMeta(null);
    setContent("");
    setMetrics([]);
    setDone(null);
    setLastFrame(null);
    reconnectStream();
  };

  return { status, error, close, reconnect, meta, content, metrics, done, lastFrame, counts };
};

export { STAGES, useDemoStream };
export type { LastFrame, Stage };

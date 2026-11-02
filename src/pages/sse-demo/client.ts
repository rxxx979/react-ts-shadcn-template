import { sseClient } from "@/lib/sse";

import { demoEventSchema } from "./events";

/**
 * 低层 client 用法：不依赖 React，适合放进 service。
 */
export const createDemoClient = () =>
  sseClient("/api/sse-demo", {
    schema: demoEventSchema,
    onEvent: (message) => {
      switch (message.event) {
        case "meta":
          console.log(message.data.title);
          break;
        case "token":
          console.log(message.data.text);
          break;
        case "metric":
          console.log(message.data.value);
          break;
        case "done":
          console.log(message.data.elapsedMs);
          break;
      }
    },
  });

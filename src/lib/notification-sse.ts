const MOCK_NOTIFICATIONS = [
  {
    id: "live-1",
    title: "实时通知已连接",
    description: "新的项目更新会通过 SSE 实时到达。",
    href: "/projects",
    type: "info" as const,
  },
  {
    id: "live-2",
    title: "项目状态变更",
    description: "「设计系统迁移」进入开发阶段。",
    href: "/projects/p-01",
    type: "success" as const,
  },
  {
    id: "live-3",
    title: "待处理提醒",
    description: "有 2 个项目需要补充负责人。",
    href: "/projects",
    type: "warning" as const,
  },
];

const notificationSseFetch: typeof fetch = (_input, init) => {
  const encoder = new TextEncoder();
  const signal = init?.signal;
  let timer: ReturnType<typeof setInterval> | undefined;
  let finished = false;
  let abortHandler: (() => void) | undefined;

  const stop = () => {
    if (timer !== undefined) clearInterval(timer);
    if (abortHandler) signal?.removeEventListener("abort", abortHandler);
  };

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const finish = () => {
        if (finished) return;
        finished = true;
        stop();
        controller.close();
      };
      const send = (index: number) => {
        if (finished) return;
        const item = MOCK_NOTIFICATIONS[index % MOCK_NOTIFICATIONS.length];
        controller.enqueue(encoder.encode(`event: notification\ndata: ${JSON.stringify(item)}\n\n`));
      };

      abortHandler = finish;
      if (signal?.aborted) {
        finish();
        return;
      }
      signal?.addEventListener("abort", finish, { once: true });

      let index = 0;
      timer = setInterval(() => {
        send(index);
        index += 1;
      }, 12_000);
    },
    cancel() {
      finished = true;
      stop();
    },
  });

  return Promise.resolve(
    new Response(stream, {
      status: 200,
      headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache" },
    }),
  );
};

let installed = false;

/**
 * 只接管通知流地址，其他请求走原生 fetch
 */
const installNotificationSseFetch = () => {
  if (installed || typeof window === "undefined") return;
  installed = true;
  const nativeFetch = globalThis.fetch.bind(globalThis);

  globalThis.fetch = (input, init) => {
    const url = input instanceof Request ? input.url : input.toString();
    return url.endsWith("/api/notifications/stream") ? notificationSseFetch(input, init) : nativeFetch(input, init);
  };
};

export { installNotificationSseFetch };

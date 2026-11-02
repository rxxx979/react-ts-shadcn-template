/**
 * 浏览器内的 SSE demo transport
 *
 * 用 ReadableStream 模拟 text/event-stream，避免为了演示在 Vite 里启动服务。 生产环境不传这个 fetch，connectSSE 会使用全局 fetch。
 */

const CONTENT = [
  "流不是一次性的响应，而是一条持续打开的单向通道。",
  "每个空行分隔的 frame 都是一个事件：event 定义类型，data 承载内容。",
  "token 到达时，界面先更新局部状态，再把片段拼回完整句子。",
  "done 到达时，连接收束，留下一个可以复用的 hook。",
].join("\n\n");

const METRICS = [
  { at: 0.12, data: { label: "First byte", value: "18 ms", hint: "initial flush" } },
  { at: 0.46, data: { label: "Frame types", value: "4", hint: "meta · token · metric · done" } },
  { at: 0.78, data: { label: "Transport", value: "SSE", hint: "text/event-stream" } },
];

/**
 * 模拟一次只吐一个字符的 SSE 流
 */
const demoSseFetch: typeof fetch = (_input, init) => {
  const encoder = new TextEncoder();
  const chunks = CONTENT.split("");
  const signal = init?.signal;
  let timer: ReturnType<typeof setInterval> | undefined;
  let finished = false;
  let abortHandler: (() => void) | undefined;

  const stop = () => {
    if (timer !== undefined) {
      clearInterval(timer);
      timer = undefined;
    }

    if (abortHandler) {
      signal?.removeEventListener("abort", abortHandler);
      abortHandler = undefined;
    }
  };

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const finish = () => {
        if (finished) {
          return;
        }

        finished = true;
        stop();
        controller.close();
      };

      const send = (event: string, data: unknown) => {
        if (finished) {
          return;
        }

        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      abortHandler = finish;

      if (signal?.aborted) {
        finish();
        return;
      }

      signal?.addEventListener("abort", finish, { once: true });

      let index = 0;
      let sentMetrics = 0;
      const startedAt = Date.now();

      send("meta", {
        title: "A stream, not a snapshot.",
        subtitle: "SSE 把一次响应拆成可感知的片段：先到先渲染，最后收束。",
        tags: ["live", "zod", "react"],
      });

      timer = setInterval(() => {
        if (index >= chunks.length) {
          send("done", { elapsedMs: Date.now() - startedAt, events: chunks.length + 1 });
          finish();
          return;
        }

        const progress = index / chunks.length;

        if (sentMetrics < METRICS.length && progress >= METRICS[sentMetrics].at) {
          send("metric", METRICS[sentMetrics].data);
          sentMetrics += 1;
        }

        send("token", { text: chunks[index] });
        index += 1;
      }, 80);
    },
    cancel() {
      if (!finished) {
        finished = true;
        stop();
      }
    },
  });

  return Promise.resolve(
    new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    }),
  );
};

let installed = false;

/**
 * Demo 页面加载时安装网络拦截，只接管 /api/sse-demo
 */
const installDemoSseFetch = () => {
  if (installed || typeof window === "undefined") {
    return;
  }

  installed = true;
  const nativeFetch = globalThis.fetch.bind(globalThis);

  globalThis.fetch = (input, init) => {
    const url = input instanceof Request ? input.url : input.toString();

    if (url.endsWith("/api/sse-demo")) {
      return demoSseFetch(input, init);
    }

    return nativeFetch(input, init);
  };
};

export { installDemoSseFetch };

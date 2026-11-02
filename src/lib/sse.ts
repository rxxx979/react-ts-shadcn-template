import type { z } from "zod";

import { ApiError } from "@/lib/request";

/**
 * SSE 事件元信息
 */
interface SSEMeta {
  /**
   * 服务端 event id
   */
  id?: string;
  /**
   * 服务端建议的重连时间（毫秒）
   */
  retry?: number;
}

interface SSEFrame {
  event: string;
  data: string;
  id?: string;
  retry?: number;
}

/**
 * 单个 event 的运行时处理器
 */
interface SSEEventHandler {
  handle: (raw: unknown, meta: SSEMeta, onError?: (error: Error) => void) => void;
}

/**
 * 按 event 名注册的处理器
 */
type SSEEventHandlers = Partial<Record<string, SSEEventHandler>>;

interface SSEPayload {
  event: string;
  data: unknown;
}

interface SSEBaseOptions extends Omit<RequestInit, "body" | "signal"> {
  /**
   * 请求体；对象会自动 JSON 序列化
   */
  body?: BodyInit | Record<string, unknown> | null;
  /**
   * 中断信号
   */
  signal?: AbortSignal;
  /**
   * 连接建立（HTTP 2xx）后调用
   */
  onOpen?: () => void;
  /**
   * 连接结束或主动关闭时调用
   */
  onClose?: () => void;
  /**
   * 请求失败、schema 校验失败时调用；主动 abort 不会触发
   */
  onError?: (error: Error) => void;
  /**
   * 初始 Last-Event-ID
   */
  lastEventId?: string;
  /**
   * 自定义 fetch，默认使用全局 fetch
   */
  fetch?: typeof fetch;
}

interface SSEEventOptions extends SSEBaseOptions {
  /**
   * 按 event 注册 schema + 处理函数
   */
  events: SSEEventHandlers;
}

interface SSESchemaOptions<S extends z.ZodType<SSEPayload>> extends SSEBaseOptions {
  /**
   * 用 discriminatedUnion schema 描述所有事件
   */
  schema: S;
  /**
   * 收到通过 schema 校验的事件时调用
   */
  onEvent?: (message: z.infer<S> & SSEMeta) => void;
}

type SSEOptions<S extends z.ZodType<SSEPayload> = z.ZodType<SSEPayload>> = SSEEventOptions | SSESchemaOptions<S>;

interface SSEConnection {
  /**
   * 是否已经关闭
   */
  readonly closed: boolean;
  /**
   * 主动关闭连接
   */
  close: () => void;
}

/**
 * 解析一个 SSE frame（空行分隔的一段文本）
 *
 * @param raw - Frame 文本
 *
 * @returns 解析结果；没有 data 字段时返回 null
 */
const parseFrame = (raw: string): SSEFrame | null => {
  let event = "message";
  let data = "";
  let hasData = false;
  let id: string | undefined;
  let retry: number | undefined;

  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.startsWith(":")) {
      continue;
    }

    const separator = line.indexOf(":");
    const field = separator === -1 ? line : line.slice(0, separator);
    let value = separator === -1 ? "" : line.slice(separator + 1);

    if (value.startsWith(" ")) {
      value = value.slice(1);
    }

    switch (field) {
      case "event":
        event = value;
        break;
      case "data":
        data += `${data ? "\n" : ""}${value}`;
        hasData = true;
        break;
      case "id":
        id = value;
        break;
      case "retry": {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
          retry = parsed;
        }
        break;
      }
      default:
        break;
    }
  }

  return hasData ? { event, data, id, retry } : null;
};

/**
 * 默认 data 解析：JSON 优先，失败时保留原始字符串
 *
 * @param raw - 原始 data
 */
const parseData = (raw: string): unknown => {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw;
  }
};

/**
 * 判断请求体是否需要 JSON 序列化
 *
 * @param body - 请求体
 */
const isJsonBody = (body: unknown): body is Record<string, unknown> =>
  typeof body === "object"
  && body !== null
  && !(body instanceof FormData)
  && !(body instanceof URLSearchParams)
  && !(body instanceof Blob)
  && !(body instanceof ArrayBuffer)
  && !ArrayBuffer.isView(body)
  && !(body instanceof ReadableStream);

/**
 * 创建一个带 Zod 校验的 event 处理器
 *
 * @param schema - 当前 event 的 data schema
 * @param onData - 校验通过后的处理函数
 */
const sseEvent = <S extends z.ZodType>(
  schema: S,
  onData: (data: z.infer<S>, meta: SSEMeta) => void,
): SSEEventHandler => ({
  handle: (raw, meta, onError) => {
    const parsed = schema.safeParse(raw);

    if (!parsed.success) {
      onError?.(parsed.error);
      return;
    }

    onData(parsed.data, meta);
  },
});

/**
 * 连接 SSE 流
 *
 * 使用 fetch 读取 `text/event-stream`；每个 event 用独立 schema 做运行时校验。
 *
 * @example
 *   connectSSE("/api/chat/stream", {
 *     events: {
 *       token: sseEvent(z.object({ text: z.string() }), (data) => {
 *         console.log(data.text);
 *       }),
 *       done: sseEvent(z.object({ id: z.string() }), (data) => {
 *         console.log(data.id);
 *       }),
 *     },
 *   });
 *
 * @param url - SSE 地址
 * @param options - 请求配置与事件定义
 *
 * @returns 可关闭的连接句柄
 */
function connectSSE<S extends z.ZodType<SSEPayload>>(url: string, options: SSESchemaOptions<S>): SSEConnection;
function connectSSE(url: string, options: SSEEventOptions): SSEConnection;
function connectSSE(url: string, options: SSEOptions): SSEConnection {
  const { body, signal, onOpen, onClose, onError, lastEventId, headers, fetch: fetchImpl = fetch, ...init } = options;
  const events = "events" in options ? options.events : undefined;
  const schema = "schema" in options ? options.schema : undefined;
  const onEvent = "onEvent" in options ? options.onEvent : undefined;
  const controller = new AbortController();
  const jsonBody = isJsonBody(body);
  let closed = false;

  const abort = () => {
    controller.abort();
  };

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener("abort", abort, { once: true });
    }
  }

  const cleanup = () => {
    signal?.removeEventListener("abort", abort);
  };

  const close = () => {
    if (closed) {
      return;
    }

    closed = true;
    controller.abort();
    cleanup();
    onClose?.();
  };

  const emit = (frame: SSEFrame) => {
    if (schema) {
      const parsed = schema.safeParse({ event: frame.event, data: parseData(frame.data) });

      if (!parsed.success) {
        onError?.(parsed.error);
        return;
      }

      onEvent?.({ ...parsed.data, id: frame.id, retry: frame.retry });
      return;
    }

    const handler = events?.[frame.event];

    if (!handler) {
      return;
    }

    handler.handle(parseData(frame.data), { id: frame.id, retry: frame.retry }, onError);
  };

  const consume = async () => {
    const finalHeaders = new Headers(headers);

    if (!finalHeaders.has("Accept")) {
      finalHeaders.set("Accept", "text/event-stream");
    }

    if (jsonBody && !finalHeaders.has("Content-Type")) {
      finalHeaders.set("Content-Type", "application/json");
    }

    if (lastEventId) {
      finalHeaders.set("Last-Event-ID", lastEventId);
    }

    const response = await fetchImpl(url, {
      ...init,
      headers: finalHeaders,
      body: jsonBody ? JSON.stringify(body) : body,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new ApiError(`SSE request failed with status ${response.status}`, { status: response.status });
    }

    if (!response.body) {
      throw new ApiError("SSE response has no body");
    }

    onOpen?.();

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let result = await reader.read();

    while (!result.done) {
      buffer += decoder.decode(result.value, { stream: true });
      buffer = buffer.replaceAll("\r\n", "\n");
      let boundary = buffer.indexOf("\n\n");

      while (boundary !== -1) {
        const raw = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        const frame = parseFrame(raw);

        if (frame) {
          emit(frame);
        }

        boundary = buffer.indexOf("\n\n");
      }

      result = await reader.read();
    }
  };

  const start = async () => {
    try {
      await consume();
    } catch (cause) {
      if (!controller.signal.aborted) {
        onError?.(cause instanceof Error ? cause : new Error(String(cause)));
      }
    } finally {
      close();
    }
  };

  void start();

  return {
    get closed() {
      return closed;
    },
    close,
  };
}

export { connectSSE, connectSSE as sseClient, parseFrame, sseEvent };
export type {
  SSEConnection,
  SSEEventOptions,
  SSEEventHandler,
  SSEEventHandlers,
  SSEFrame,
  SSEOptions,
  SSEPayload,
  SSESchemaOptions,
};

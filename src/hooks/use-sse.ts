import { useCallback, useEffect, useRef, useState } from "react";
import type { z } from "zod";

import { connectSSE } from "@/lib/sse";
import type { SSEConnection, SSEPayload, SSESchemaOptions } from "@/lib/sse";

/**
 * SSE 连接状态
 */
type SSEStatus = "idle" | "connecting" | "open" | "closed";

interface UseSSEOptions<S extends z.ZodType<SSEPayload>> extends Omit<
  SSESchemaOptions<S>,
  "onOpen" | "onClose" | "onError"
> {
  /**
   * 是否启用；false 时保持 idle 并关闭连接
   */
  enabled?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Error) => void;
}

interface UseSSEResult {
  /**
   * 当前连接状态
   */
  status: SSEStatus;
  /**
   * 最近一次连接或校验错误
   */
  error: Error | null;
  /**
   * 主动关闭连接
   */
  close: () => void;
  /**
   * 重新连接
   */
  reconnect: () => void;
}

/**
 * 在组件生命周期内管理 SSE 连接
 *
 * @example
 *   const schema = z.discriminatedUnion("event", [
 *     z.object({
 *       event: z.literal("token"),
 *       data: z.object({ text: z.string() }),
 *     }),
 *   ]);
 *
 *   const { status } = useSSE("/api/chat/stream", {
 *     schema,
 *     onEvent: (message) => {
 *       if (message.event === "token") {
 *         setText((current) => current + message.data.text);
 *       }
 *     },
 *   });
 *
 * @param url - SSE 地址
 * @param options - 请求配置、事件定义与生命周期回调
 *
 * @returns SSE 状态与控制器
 */
const useSSE = <S extends z.ZodType<SSEPayload>>(url: string, options: UseSSEOptions<S>): UseSSEResult => {
  const { schema, onEvent, enabled = true, onOpen, onClose, onError, ...request } = options;
  const [status, setStatus] = useState<SSEStatus>(() => (enabled ? "connecting" : "idle"));
  const [error, setError] = useState<Error | null>(null);
  const connectionRef = useRef<SSEConnection | null>(null);
  const optionsRef = useRef({ schema, onEvent, onOpen, onClose, onError, request });

  useEffect(() => {
    optionsRef.current = { schema, onEvent, onOpen, onClose, onError, request };
  });

  const close = useCallback(() => {
    connectionRef.current?.close();
    connectionRef.current = null;
    setStatus("closed");
  }, []);

  const connect = useCallback(() => {
    const current = optionsRef.current;

    connectionRef.current = connectSSE(url, {
      ...current.request,
      schema: current.schema,
      onEvent: current.onEvent,
      onOpen: () => {
        setError(null);
        setStatus("open");
        current.onOpen?.();
      },
      onError: (cause) => {
        setError(cause);
        current.onError?.(cause);
      },
      onClose: () => {
        setStatus("closed");
        current.onClose?.();
      },
    });
  }, [url]);

  const reconnect = useCallback(() => {
    connectionRef.current?.close();
    connectionRef.current = null;
    setError(null);
    setStatus("connecting");
    connect();
  }, [connect]);

  useEffect(() => {
    if (!enabled) {
      return () => {};
    }

    connect();

    return () => {
      connectionRef.current?.close();
      connectionRef.current = null;
    };
  }, [enabled, connect]);

  return {
    status: enabled ? status : "idle",
    error,
    close,
    reconnect,
  };
};

export { useSSE };
export type { SSEStatus, UseSSEOptions, UseSSEResult };

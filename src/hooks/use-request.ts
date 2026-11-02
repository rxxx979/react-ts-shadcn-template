import { useCallback, useEffect, useRef, useState } from "react";

import { request } from "@/lib/request";
import type { QueryParams, RequestBody } from "@/lib/request";

type Method = "get" | "post" | "put" | "delete";

/**
 * 类型安全的 endpoint 描述
 *
 * `response` 仅用于类型推导，不会发送到服务端。
 *
 * @template M - HTTP method
 * @template Q - Query 类型
 * @template B - JSON body 类型
 * @template R - Response data 类型
 */
interface Endpoint<Q extends QueryParams = QueryParams, B extends RequestBody = RequestBody, R = unknown> {
  method: Method;
  url: string;
  headers?: HeadersInit;
  query?: Q;
  json?: B;
  response?: R;
}

/**
 * 创建 endpoint，同时保留 method / query / body / response 的泛型
 *
 * @param endpoint - Endpoint 配置
 */
const defineEndpoint = <Q extends QueryParams = QueryParams, B extends RequestBody = RequestBody, R = unknown>(
  endpoint: Omit<Endpoint<Q, B, R>, "response">,
): Endpoint<Q, B, R> => endpoint;

/**
 * UseRequest 配置
 *
 * @template T - 请求返回的数据类型
 */
interface UseRequestOptions<T> {
  /**
   * 是否在挂载时立即执行，默认 true
   */
  immediate?: boolean;
  /**
   * 请求成功后的回调
   */
  onSuccess?: (data: T) => void;
  /**
   * 请求失败后的回调
   */
  onError?: (error: Error) => void;
}

/**
 * URL 形式的额外请求配置
 *
 * @template T - 请求返回的数据类型
 */
interface UseRequestUrlOptions<T> extends UseRequestOptions<T> {
  method?: Method;
  headers?: HeadersInit;
  query?: QueryParams;
  body?: RequestBody;
}

/**
 * UseRequest 返回值
 *
 * @template T - 请求返回的数据类型
 */
interface UseRequestResult<T> {
  /**
   * 最近一次成功请求的数据
   */
  data: T | undefined;
  /**
   * 最近一次请求错误
   */
  error: Error | null;
  /**
   * 是否有请求进行中
   */
  loading: boolean;
  /**
   * 手动执行一次请求
   */
  run: () => Promise<T | undefined>;
  /**
   * 重新执行一次请求
   */
  refresh: () => Promise<T | undefined>;
  /**
   * 取消当前请求并结束 loading
   */
  cancel: () => void;
  /**
   * 本地更新 data，不触发请求
   */
  mutate: (data: T | undefined) => void;
}

type UseRequestSource<T> = ((signal: AbortSignal) => Promise<T>) | string | Endpoint<QueryParams, RequestBody, T>;

/**
 * 将 unknown 异常规范化为 Error
 *
 * @param value - Catch 到的任意值
 */
const toError = (value: unknown): Error => (value instanceof Error ? value : new Error(String(value)));

/**
 * 请求 Hook
 *
 * 支持三种形式：
 *
 * 1. Endpoint descriptor
 * 2. URL + 请求配置
 * 3. 自定义 service
 *
 * @example
 *   const user = defineEndpoint<{ id: string }, never, User>({
 *     method: "get",
 *     url: "/user",
 *     query: { id: "1" },
 *   });
 *
 *   const { data } = useRequest(user);
 *
 * @example
 *   const { data } = useRequest<User>("/user", {
 *     query: { id: "1" },
 *   });
 *
 * @example
 *   const { data } = useRequest((signal) => request<User>("/user", { signal }));
 *
 * @param source - Endpoint、URL 或自定义 service
 * @param options - 执行与回调配置
 *
 * @returns Data / error / loading 以及控制方法
 */
const useRequest = <T>(source: UseRequestSource<T>, options: UseRequestUrlOptions<T> = {}): UseRequestResult<T> => {
  const { immediate = true, onSuccess, onError, ...requestConfig } = options;
  const [data, setData] = useState<T>();
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(immediate);
  const sourceRef = useRef(source);
  const configRef = useRef(requestConfig);
  const callbacksRef = useRef({ onSuccess, onError });
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    sourceRef.current = source;
    configRef.current = requestConfig;
  });

  useEffect(() => {
    callbacksRef.current = { onSuccess, onError };
  }, [onSuccess, onError]);

  const run = useCallback(async (): Promise<T | undefined> => {
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const current = sourceRef.current;
      const next =
        typeof current === "function"
          ? await current(controller.signal)
          : typeof current === "string"
            ? await request<T>(current, { ...configRef.current, signal: controller.signal })
            : await request<T>(current.url, {
                method: current.method,
                headers: current.headers,
                query: current.query,
                body: current.json,
                signal: controller.signal,
              });

      if (requestId !== requestIdRef.current) {
        return undefined;
      }

      setData(next);
      setLoading(false);
      callbacksRef.current.onSuccess?.(next);
      return next;
    } catch (cause) {
      if (controller.signal.aborted || requestId !== requestIdRef.current) {
        return undefined;
      }

      const nextError = toError(cause);
      setError(nextError);
      setLoading(false);
      callbacksRef.current.onError?.(nextError);
      return undefined;
    }
  }, []);

  const cancel = useCallback(() => {
    requestIdRef.current += 1;
    abortRef.current?.abort();
    setLoading(false);
  }, []);

  const refresh = useCallback(() => run(), [run]);

  const mutate = useCallback((next: T | undefined) => {
    setData(next);
  }, []);

  useEffect(() => {
    const timer = immediate
      ? window.setTimeout(() => {
          void run();
        }, 0)
      : undefined;

    return () => {
      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
      requestIdRef.current += 1;
      abortRef.current?.abort();
    };
  }, [immediate, run]);

  return { data, error, loading, run, refresh, cancel, mutate };
};

export { defineEndpoint, useRequest };
export type { Endpoint, Method, UseRequestOptions, UseRequestResult, UseRequestUrlOptions };

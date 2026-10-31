import { useCallback, useEffect, useRef, useState } from "react";

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

/**
 * 将 unknown 异常规范化为 Error
 *
 * @param value - Catch 到的任意值
 */
const toError = (value: unknown): Error => (value instanceof Error ? value : new Error(String(value)));

/**
 * 请求 Hook：管理 loading / data / error，自动处理竞态与卸载
 *
 * @example
 *   const { data, loading, refresh } = useRequest((signal) => request<Project[]>("/projects", { signal }));
 *
 * @param service - 请求函数，接收 AbortSignal 以便取消
 * @param options - 立即执行与回调配置
 *
 * @returns Data / error / loading 以及手动控制方法
 */
const useRequest = <T>(
  service: (signal: AbortSignal) => Promise<T>,
  options: UseRequestOptions<T> = {},
): UseRequestResult<T> => {
  const { immediate = true, onSuccess, onError } = options;
  const [data, setData] = useState<T>();
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(immediate);
  // 用 ref 保存最新 service / 回调，避免它们每次渲染都重新触发 immediate 请求
  const serviceRef = useRef(service);
  const callbacksRef = useRef({ onSuccess, onError });
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    serviceRef.current = service;
  }, [service]);

  useEffect(() => {
    callbacksRef.current = { onSuccess, onError };
  }, [onSuccess, onError]);

  const run = useCallback(async (): Promise<T | undefined> => {
    // requestId 用于忽略过期请求；abort 用于真正取消 fetch
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const next = await serviceRef.current(controller.signal);

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
    // 让在途响应失效，并中止底层 fetch
    requestIdRef.current += 1;
    abortRef.current?.abort();
    setLoading(false);
  }, []);

  const refresh = useCallback(() => run(), [run]);

  const mutate = useCallback((next: T | undefined) => {
    setData(next);
  }, []);

  useEffect(() => {
    // 延迟到下一个事件循环执行，避免在 effect 内同步 setState
    const timer = immediate
      ? window.setTimeout(() => {
          void run();
        }, 0)
      : undefined;

    return () => {
      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
      // 卸载时让在途请求失效并取消
      requestIdRef.current += 1;
      abortRef.current?.abort();
    };
  }, [immediate, run]);

  return { data, error, loading, run, refresh, cancel, mutate };
};

export { useRequest };
export type { UseRequestOptions, UseRequestResult };

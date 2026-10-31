import { API_BASE_URI } from "@/lib/env";

/**
 * HTTP 请求封装
 *
 * - 自动拼接 `VITE_API_BASE_URI`
 * - 统一 query 序列化、JSON body 与请求头
 * - 解包常见的 `{ code, data, message }` 响应
 * - HTTP 错误与业务错误统一抛出 {@link ApiError}
 */

/**
 * 接口统一响应包装
 *
 * @template T - Data 的业务类型
 */
interface Result<T = unknown> {
  code: number;
  data?: T;
  message?: string;
}

/**
 * 分页数据
 *
 * @template T - 列表项类型
 */
interface PageData<T = unknown> {
  total?: number;
  pageSize?: number;
  pageNo?: number;
  items: T[];
}

/**
 * 分页接口响应
 *
 * @template T - 列表项类型
 */
type PageResult<T = unknown> = Result<PageData<T>>;

/**
 * 单个 query 值：null / undefined 会被忽略
 */
type QueryValue = string | number | boolean | null | undefined;

/**
 * Query 参数表，数组会展开为重复 key
 */
type QueryParams = Record<string, QueryValue | QueryValue[]>;

/**
 * 请求体：普通对象 / 数组会 JSON 序列化，其余 BodyInit 原样传递
 */
type RequestBody = BodyInit | Record<string, unknown> | unknown[] | null;

/**
 * 请求配置
 *
 * @template T - 响应 data 的业务类型
 */
interface RequestOptions<T = unknown> extends Omit<RequestInit, "body"> {
  /**
   * 查询参数，null / undefined 会被忽略
   */
  query?: QueryParams;
  /**
   * 请求体；普通对象 / 数组会自动 JSON 序列化
   */
  body?: RequestBody;
  /**
   * 自定义响应解析
   *
   * 不传时按 `Result` 包装解包；传了则完全由调用方接管解析。
   */
  parse?: (payload: unknown) => T;
}

/**
 * 请求错误：HTTP 非 2xx 或业务 code 非成功时抛出
 */
class ApiError extends Error {
  /**
   * HTTP 状态码
   */
  readonly status?: number;
  /**
   * 业务 code
   */
  readonly code?: number;
  /**
   * 原始响应体或错误详情
   */
  readonly details?: unknown;

  /**
   * @param message - 可展示的错误信息
   * @param options - HTTP 状态、业务 code 与原始详情
   */
  constructor(message: string, options: { status?: number; code?: number; details?: unknown } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
  }
}

/**
 * 判断是否为接口包装结构
 *
 * @param value - 已解析的响应体
 *
 * @returns 是否包含数字类型的 code 字段
 */
const isResult = <T>(value: unknown): value is Result<T> =>
  typeof value === "object" && value !== null && "code" in value && typeof value.code === "number";

/**
 * 判断是否为成功业务码：兼容 0 与 200 两种约定
 *
 * @param code - 业务响应码
 */
const isSuccessCode = (code: number): boolean => code === 0 || code === 200;

/**
 * 从错误响应中提取 message
 *
 * @param value - 错误响应体
 *
 * @returns 可用的错误文案
 */
const getErrorMessage = (value: unknown): string | undefined => {
  if (typeof value !== "object" || value === null || !("message" in value)) {
    return undefined;
  }

  return typeof value.message === "string" ? value.message : undefined;
};

/**
 * 判断请求体是否需要 JSON 序列化
 *
 * FormData、URLSearchParams、Blob、ArrayBuffer、TypedArray 与 ReadableStream 都应原样交给 fetch，不能 JSON.stringify。
 *
 * @param body - 请求体
 */
const isJsonBody = (body: unknown): body is Record<string, unknown> | unknown[] =>
  typeof body === "object"
  && body !== null
  && !(body instanceof FormData)
  && !(body instanceof URLSearchParams)
  && !(body instanceof Blob)
  && !(body instanceof ArrayBuffer)
  && !ArrayBuffer.isView(body)
  && !(body instanceof ReadableStream);

/**
 * 拼接查询参数
 *
 * 数组值会展开成多个同名参数，例如 `{ tag: ["a", "b"] }` 会生成 `tag=a&tag=b`。
 *
 * @param url - 基础 URL
 * @param query - 查询参数
 *
 * @returns 带查询串的 URL
 */
const withQuery = (url: string, query: QueryParams | undefined): string => {
  if (!query) {
    return url;
  }

  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    const values = Array.isArray(value) ? value : [value];

    for (const item of values) {
      if (item !== null && item !== undefined) {
        search.append(key, String(item));
      }
    }
  }

  const queryString = search.toString();
  return queryString ? `${url}${url.includes("?") ? "&" : "?"}${queryString}` : url;
};

/**
 * 解析响应体
 *
 * 204 与空响应返回 undefined；JSON content-type 走 JSON.parse， 其余按文本返回。
 *
 * @param response - Fetch 响应
 *
 * @returns 解析后的未知类型数据
 */
const parseResponse = async (response: Response): Promise<unknown> => {
  if (response.status === 204) {
    return undefined;
  }

  const text = await response.text();

  if (!text) {
    return undefined;
  }

  if ((response.headers.get("content-type") ?? "").includes("json")) {
    const payload: unknown = JSON.parse(text);
    return payload;
  }

  return text;
};

/**
 * 通用请求：自动处理 baseURI、query、JSON body、错误与 Result 包装
 *
 * @example
 *   const projects = await request<Project[]>("/projects", {
 *     query: { page: 1, pageSize: 20 },
 *   });
 *
 * @param path - 接口路径；也支持完整 http(s) URL
 * @param options - Fetch 配置与 request 扩展项
 *
 * @returns 解包后的业务数据
 *
 * @throws {ApiError} HTTP 非 2xx 或业务 code 非成功时
 */
const request = async <T = unknown>(path: string, options: RequestOptions<T> = {}): Promise<T> => {
  const { query, body, headers, parse, ...init } = options;
  const url = withQuery(
    /^https?:\/\//.test(path) ? path : `${API_BASE_URI.replace(/\/$/, "")}/${path.replace(/^\//, "")}`,
    query,
  );

  const jsonBody = isJsonBody(body);
  const finalHeaders = new Headers(headers);

  if (!finalHeaders.has("Accept")) {
    finalHeaders.set("Accept", "application/json");
  }

  if (jsonBody && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...init,
    headers: finalHeaders,
    body: jsonBody ? JSON.stringify(body) : body,
  });

  if (!response.ok) {
    const details = await parseResponse(response);
    const message = getErrorMessage(details) ?? `Request failed with status ${response.status}`;
    throw new ApiError(message, { status: response.status, details });
  }

  const payload = await parseResponse(response);

  if (parse) {
    return parse(payload);
  }

  if (isResult<T>(payload)) {
    if (!isSuccessCode(payload.code)) {
      throw new ApiError(payload.message ?? "Request failed", { code: payload.code, details: payload });
    }

    if (isT<T>(payload.data)) {
      return payload.data;
    }

    throw new ApiError("Response data is invalid", { code: payload.code, details: payload });
  }

  if (isT<T>(payload)) {
    return payload;
  }

  throw new ApiError("Response data is invalid", { details: payload });
};

/**
 * 类型边界：JSON 反序列化结果在运行时没有泛型信息
 *
 * 该函数只负责声明 T，不做运行时校验。调用方应保证接口类型与 T 一致； 需要运行时校验时请使用 `request` 的 `parse` 选项。
 */
const isT = <T>(value: unknown, _expected?: T): value is T => {
  void value;
  return true;
};

export { ApiError, request };
export type { PageData, PageResult, QueryParams, RequestBody, RequestOptions, Result };

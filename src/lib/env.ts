import { z } from "zod";

/**
 * 空字符串按未配置处理，让 default 生效
 *
 * @param value - 原始环境变量
 */
const emptyToUndefined = (value: unknown): unknown =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const envSchema = z.object({
  VITE_APP_NAME: z.preprocess(emptyToUndefined, z.string().min(1, "VITE_APP_NAME 不能为空").default("Shadcn Admin")),
  VITE_API_BASE_URI: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .min(1, "VITE_API_BASE_URI 不能为空")
      .refine(
        (value) => value.startsWith("/") || /^https?:\/\//.test(value),
        "VITE_API_BASE_URI 必须以 / 或 http(s):// 开头",
      )
      .default("/api"),
  ),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`).join("; ");

  throw new Error(`Invalid environment variables: ${issues}`);
}

const { VITE_APP_NAME: APP_NAME, VITE_API_BASE_URI: API_BASE_URI } = parsed.data;

export { APP_NAME, API_BASE_URI };

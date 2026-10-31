/**
 * 环境配置：读取 VITE_ 前缀注入的环境变量（见 .env）
 */

/**
 * 读取字符串环境变量，空值回退到默认值
 *
 * @param value - 环境变量值
 * @param fallback - 未配置或为空时的默认值
 */
const readEnv = (value: string | undefined, fallback: string): string => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
};

/**
 * 应用显示名（侧边栏品牌块、页脚、首页与文档标题共用）
 */
const APP_NAME = readEnv(import.meta.env.VITE_APP_NAME, "Shadcn Admin");

/**
 * API 基础 URI
 */
const API_BASE_URI = readEnv(import.meta.env.VITE_API_BASE_URI, "/api");

export { APP_NAME, API_BASE_URI };

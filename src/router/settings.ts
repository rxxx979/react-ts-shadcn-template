import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { z } from "zod";

const SETTINGS_KEY = "workspace-settings";

const TIMEZONES = ["Asia/Shanghai", "UTC", "America/New_York"] as const;

type Timezone = (typeof TIMEZONES)[number];

interface WorkspaceSettings {
  name: string;
  email: string;
  company: string;
  bio: string;
  timezone: Timezone;
}

interface SettingsActionData {
  success?: boolean;
  error?: string;
  errors?: Record<string, string>;
  values?: WorkspaceSettings;
}

const DEFAULT_SETTINGS: WorkspaceSettings = {
  name: "管理员",
  email: "admin@example.com",
  company: "Shadcn Admin",
  bio: "负责内部工具和设计系统。",
  timezone: "Asia/Shanghai",
};

const settingsSchema = z.object({
  name: z.string().trim().min(1, "请输入姓名").max(40, "姓名不能超过 40 个字符"),
  email: z
    .string()
    .trim()
    .refine((value) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value), "请输入有效的邮箱"),
  company: z.string().trim().max(80, "公司名称不能超过 80 个字符"),
  bio: z.string().trim().max(200, "简介不能超过 200 个字符"),
  timezone: z.enum(TIMEZONES),
});

const readField = (form: FormData, key: string): string => {
  const value = form.get(key);
  return typeof value === "string" ? value : "";
};

const readSettings = (): WorkspaceSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed: unknown = JSON.parse(raw);
    const result = settingsSchema.safeParse(parsed);
    return result.success ? result.data : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

/**
 * Data mode 设置 loader
 */
const settingsLoader = (_args: LoaderFunctionArgs): WorkspaceSettings => readSettings();

/**
 * Data mode 设置 action：Zod 校验后写入 localStorage
 */
const settingsAction = async ({ request }: ActionFunctionArgs): Promise<SettingsActionData> => {
  const form = await request.formData();
  const values: WorkspaceSettings = {
    name: readField(form, "name"),
    email: readField(form, "email"),
    company: readField(form, "company"),
    bio: readField(form, "bio"),
    timezone: TIMEZONES.find((timezone) => timezone === readField(form, "timezone")) ?? "Asia/Shanghai",
  };
  const result = settingsSchema.safeParse(values);

  if (!result.success) {
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !errors[key]) {
        errors[key] = issue.message;
      }
    }
    return { error: "请检查表单字段", errors, values };
  }

  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(result.data));
    return { success: true, values: result.data };
  } catch {
    return { error: "保存失败，请稍后重试", values };
  }
};

export { TIMEZONES, settingsAction, settingsLoader };
export type { SettingsActionData, Timezone, WorkspaceSettings };

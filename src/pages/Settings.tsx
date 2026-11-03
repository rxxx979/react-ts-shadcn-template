import { Loader2Icon, SaveIcon } from "lucide-react";
import { Form, useActionData, useLoaderData, useNavigation } from "react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TIMEZONES } from "@/router/settings";
import type { SettingsActionData, WorkspaceSettings } from "@/router/settings";

const TIMEZONE_LABELS: Record<(typeof TIMEZONES)[number], string> = {
  "Asia/Shanghai": "上海 (UTC+8)",
  UTC: "UTC",
  "America/New_York": "纽约 (UTC-5)",
};

/**
 * 设置页：data mode action + Zod 字段错误
 */
const Settings = () => {
  const settings = useLoaderData<WorkspaceSettings>();
  const actionData = useActionData<SettingsActionData>();
  const navigation = useNavigation();
  const server = actionData?.values ?? settings;
  const busy = navigation.state === "submitting";

  return (
    <div className="flex w-full max-w-4xl flex-col gap-5">
      <div>
        <h1 className="text-3xl font-semibold tracking-[-0.03em]">设置</h1>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          工作区资料通过 data mode action 保存，错误字段会直接标在表单里。
        </p>
      </div>

      <Form method="post" noValidate className="bg-card/60 rounded-xl border p-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="settings-name">姓名</Label>
            <Input
              id="settings-name"
              name="name"
              defaultValue={server.name}
              aria-invalid={Boolean(actionData?.errors?.name)}
            />
            {actionData?.errors?.name && <p className="text-destructive text-xs">{actionData.errors.name}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="settings-email">邮箱</Label>
            <Input
              id="settings-email"
              name="email"
              type="email"
              defaultValue={server.email}
              aria-invalid={Boolean(actionData?.errors?.email)}
            />
            {actionData?.errors?.email && <p className="text-destructive text-xs">{actionData.errors.email}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="settings-company">公司</Label>
            <Input
              id="settings-company"
              name="company"
              defaultValue={server.company}
              aria-invalid={Boolean(actionData?.errors?.company)}
            />
            {actionData?.errors?.company && <p className="text-destructive text-xs">{actionData.errors.company}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="settings-timezone">时区</Label>
            <select
              id="settings-timezone"
              name="timezone"
              defaultValue={server.timezone}
              className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3"
            >
              {TIMEZONES.map((timezone) => (
                <option key={timezone} value={timezone}>
                  {TIMEZONE_LABELS[timezone]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 grid gap-2">
          <Label htmlFor="settings-bio">简介</Label>
          <Textarea
            id="settings-bio"
            name="bio"
            defaultValue={server.bio}
            rows={4}
            aria-invalid={Boolean(actionData?.errors?.bio)}
          />
          {actionData?.errors?.bio && <p className="text-destructive text-xs">{actionData.errors.bio}</p>}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 border-t pt-4">
          <div className="text-xs">
            {actionData?.success && <span className="text-emerald-600 dark:text-emerald-400">保存成功</span>}
            {actionData?.error && !actionData.errors && <span className="text-destructive">{actionData.error}</span>}
          </div>
          <Button type="submit" disabled={busy}>
            {busy ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
            {busy ? "保存中…" : "保存设置"}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export { Settings };

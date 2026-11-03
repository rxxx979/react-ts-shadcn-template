import { ArrowRightIcon, GalleryVerticalEndIcon, Loader2Icon, ShieldCheckIcon } from "lucide-react";
import { useState } from "react";
import { Form, useActionData, useNavigation, useSearchParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO_ACCOUNTS, ROLE_LABELS } from "@/lib/auth";
import type { AuthRole } from "@/lib/auth";
import type { LoginActionData } from "@/router/auth";
import { useAppStore } from "@/stores/app";

/**
 * 登录页：单列卡片，演示角色只作为辅助入口
 */
const Login = () => {
  const appName = useAppStore((state) => state.appName) || "Shadcn Admin";
  const appTagline = useAppStore((state) => state.appTagline);
  const actionData = useActionData<LoginActionData>();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";
  const defaultAccount = DEMO_ACCOUNTS[0];
  const [email, setEmail] = useState(actionData?.email ?? defaultAccount.email);
  const [password, setPassword] = useState(defaultAccount.password);
  const [selectedRole, setSelectedRole] = useState<AuthRole>(defaultAccount.role);
  const selectedAccount = DEMO_ACCOUNTS.find((account) => account.role === selectedRole) ?? defaultAccount;
  const busy = navigation.state === "submitting";

  const chooseRole = (role: AuthRole) => {
    const account = DEMO_ACCOUNTS.find((item) => item.role === role);

    if (!account) {
      return;
    }

    setSelectedRole(role);
    setEmail(account.email);
    setPassword(account.password);
  };

  return (
    <div className="bg-muted/20 relative flex min-h-svh items-center justify-center overflow-hidden px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[24px_24px] opacity-60"
      />
      <div
        aria-hidden
        className="bg-primary/5 pointer-events-none absolute top-1/2 left-1/2 size-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
      />

      <div className="relative w-full max-w-[380px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-xl shadow-sm">
            <GalleryVerticalEndIcon className="size-5" />
          </div>
          <p className="mt-3 text-sm font-semibold">{appName}</p>
          <p className="text-muted-foreground mt-0.5 text-[11px]">{appTagline}</p>
        </div>

        <div className="bg-card/90 shadow-foreground/5 rounded-2xl border p-6 shadow-xl backdrop-blur-sm">
          <div>
            <p className="text-muted-foreground font-mono text-[10px] tracking-[0.18em] uppercase">Welcome back</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">登录</h1>
            <p className="text-muted-foreground mt-1.5 text-xs leading-5">使用账号继续进入工作区。</p>
          </div>

          <Form method="post" className="mt-6 space-y-4">
            <input type="hidden" name="redirect" value={redirectTo} />

            <div className="grid gap-2">
              <Label htmlFor="login-email">邮箱</Label>
              <Input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="login-password">密码</Label>
              <Input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {actionData?.error && (
              <p
                role="alert"
                className="border-destructive/25 bg-destructive/5 text-destructive rounded-lg border px-3 py-2 text-xs"
              >
                {actionData.error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? <Loader2Icon className="animate-spin" /> : null}
              {busy ? "验证中…" : "登录"}
              {!busy && <ArrowRightIcon />}
            </Button>
          </Form>

          <div className="mt-6 border-t pt-5">
            <p className="text-muted-foreground font-mono text-[9px] tracking-[0.14em] uppercase">演示账号</p>
            <div className="mt-2 grid grid-cols-3 gap-1">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => chooseRole(account.role)}
                  aria-pressed={selectedRole === account.role}
                  className={
                    selectedRole === account.role
                      ? "bg-muted text-foreground rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors"
                      : "text-muted-foreground hover:bg-muted/60 rounded-md px-2 py-1.5 text-[11px] transition-colors"
                  }
                >
                  {ROLE_LABELS[account.role]}
                </button>
              ))}
            </div>
            <p className="text-muted-foreground mt-2 font-mono text-[10px]">
              {selectedAccount.email} · {selectedAccount.password}
            </p>
          </div>
        </div>

        <div className="text-muted-foreground mt-6 flex items-center justify-center gap-1.5 font-mono text-[9px]">
          <ShieldCheckIcon className="size-3" />
          Mock session · 仅用于演示
        </div>
      </div>
    </div>
  );
};

export { Login };

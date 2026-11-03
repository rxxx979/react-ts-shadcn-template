import { RotateCcwIcon, ShieldCheckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/auth";
import type { AuthRole } from "@/lib/auth";
import { PAGE_PERMISSIONS } from "@/lib/permission";
import { usePermissionStore } from "@/stores/permission";

const ROLES: readonly AuthRole[] = ["admin", "editor", "viewer"];

/**
 * 动态页面权限：读写 public/permission.json 的本地覆盖
 */
const Permissions = () => {
  const config = usePermissionStore((state) => state.config);
  const error = usePermissionStore((state) => state.error);
  const setPermission = usePermissionStore((state) => state.setPermission);
  const reset = usePermissionStore((state) => state.reset);

  const handleToggle = (
    role: AuthRole,
    permission: (typeof PAGE_PERMISSIONS)[number]["permission"],
    enabled: boolean,
  ) => {
    setPermission(role, permission, enabled);
    toast.add({
      title: "权限已更新",
      description: `${ROLE_LABELS[role]} · ${PAGE_PERMISSIONS.find((item) => item.permission === permission)?.label ?? permission}`,
      type: "success",
    });
  };

  const handleReset = () => {
    reset();
    toast.add({ title: "已恢复默认权限", description: "来自 public/permission.json", type: "info" });
  };

  return (
    <div className="flex w-full flex-1 flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">权限</h1>
          <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
            按页面控制角色访问。修改会立即同步到导航和路由守卫。
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcwIcon />
          恢复默认
        </Button>
      </div>

      {error && (
        <div className="border-destructive/25 bg-destructive/5 text-destructive rounded-lg border px-3 py-2 text-xs">
          {error}，当前使用内置默认权限。
        </div>
      )}

      <div className="bg-card/60 overflow-hidden rounded-xl border">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="text-muted-foreground size-3.5" />
            <span className="text-xs font-medium">页面访问</span>
          </div>
          <span className="text-muted-foreground font-mono text-[10px]">public/permission.json</span>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-64">页面</TableHead>
                {ROLES.map((role) => (
                  <TableHead key={role} className="min-w-36 text-center">
                    <span className="block text-[11px] font-medium">{ROLE_LABELS[role]}</span>
                    <span className="text-muted-foreground mt-0.5 block font-mono text-[9px] font-normal">
                      {ROLE_DESCRIPTIONS[role]}
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {PAGE_PERMISSIONS.map((page) => (
                <TableRow key={page.permission}>
                  <TableCell>
                    <p className="text-sm font-medium">{page.label}</p>
                    <p className="text-muted-foreground mt-0.5 font-mono text-[10px]">{page.permission}</p>
                  </TableCell>
                  {ROLES.map((role) => {
                    const checked = config.roles[role].includes(page.permission);
                    const locked = role === "admin" && page.permission === "permission:manage";

                    return (
                      <TableCell key={role} className="text-center">
                        <div className="flex items-center justify-center">
                          <Switch
                            checked={checked}
                            disabled={locked}
                            aria-label={`${ROLE_LABELS[role]} ${page.label}`}
                            onCheckedChange={(enabled) => handleToggle(role, page.permission, enabled)}
                          />
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <p className="text-muted-foreground border-t px-4 py-3 text-[10px] leading-4">
          权限来源于 public/permission.json，并在 localStorage 中保存覆盖值。管理员权限管理入口不可关闭。
        </p>
      </div>
    </div>
  );
};

export { Permissions };

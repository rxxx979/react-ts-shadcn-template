import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * 页面级错误兜底，保留 Layout 外壳
 */
const PageError = () => (
  <div className="bg-card flex min-h-[420px] flex-1 flex-col items-center justify-center rounded-xl border px-6 py-16 text-center">
    <div className="bg-destructive/10 text-destructive flex size-11 items-center justify-center rounded-full">
      <AlertTriangleIcon className="size-5" />
    </div>
    <h2 className="mt-4 text-lg font-semibold tracking-tight">页面加载失败</h2>
    <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed">
      页面渲染或资源加载时出现异常。可以刷新后重试；如果持续出现，请检查控制台错误。
    </p>
    <Button className="mt-5" onClick={() => window.location.reload()}>
      <RefreshCwIcon />
      刷新页面
    </Button>
  </div>
);

export { PageError };

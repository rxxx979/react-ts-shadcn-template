import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * 应用级错误兜底
 */
const RootError = () => (
  <div className="bg-background flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
    <div className="bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full">
      <AlertTriangleIcon className="size-6" />
    </div>
    <p className="text-muted-foreground mt-6 font-mono text-[10px] tracking-[0.24em] uppercase">Application error</p>
    <h1 className="mt-2 text-2xl font-semibold tracking-tight">界面暂时无法加载</h1>
    <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">
      应用初始化或路由渲染时出现异常。刷新页面后重试。
    </p>
    <Button className="mt-5" onClick={() => window.location.reload()}>
      <RefreshCwIcon />
      刷新应用
    </Button>
  </div>
);

export { RootError };

import { ComponentIcon, HomeIcon, SearchIcon } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";

const homeLink = <Link to="/" />;
const componentsLink = <Link to="/components" />;

/**
 * 404：路由兜底页
 */
const NotFound = () => (
  <div className="bg-card relative flex min-h-full flex-1 flex-col items-center justify-center overflow-hidden rounded-xl border px-6 py-24 text-center">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,var(--border)_1px,transparent_1px)] bg-size-[18px_18px] opacity-40" />
    <div className="bg-primary/10 pointer-events-none absolute top-1/3 left-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />

    <div className="relative flex flex-col items-center">
      <p className="text-muted-foreground font-mono text-[11px] tracking-[0.28em] uppercase">404 / Not Found</p>
      <h1 className="from-foreground to-foreground/10 mt-3 bg-linear-to-b bg-clip-text text-[7rem] leading-none font-semibold tracking-[-0.08em] text-transparent sm:text-[9rem]">
        404
      </h1>
      <p className="text-muted-foreground mt-5 max-w-md text-sm leading-relaxed">
        这个页面不存在，可能已经被移动，或者链接写错了。
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
        <Button nativeButton={false} render={homeLink}>
          <HomeIcon />
          回到首页
        </Button>
        <Button variant="outline" nativeButton={false} render={componentsLink}>
          <ComponentIcon />
          浏览组件
        </Button>
      </div>

      <div className="text-muted-foreground mt-8 flex items-center gap-2 text-[11px]">
        <SearchIcon className="size-3.5" />按<Kbd>⌘K</Kbd>
        搜索页面或操作
      </div>
    </div>
  </div>
);

export { NotFound };

import { useAppStore } from "@/stores/app";

// 模块级求值一次，满足 React Compiler 的渲染纯度要求
const YEAR = new Date().getFullYear();

/**
 * 页脚：版权信息；rounded-b 与 inset 卡片圆角对齐
 */
const Footer = () => {
  const appName = useAppStore((state) => state.appName) || "Shadcn Admin";

  return (
    <footer className="text-muted-foreground flex h-(--footer-height) shrink-0 items-center justify-center px-6 text-xs">
      © {YEAR} {appName}
    </footer>
  );
};

export { Footer };

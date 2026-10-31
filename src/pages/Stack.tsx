import { useDebouncedCallback } from "@mantine/hooks";
import { cn } from "cn";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import packageJsonRaw from "~/package.json?raw";

/**
 * Package.json 中与本页相关的字段
 */
interface PackageManifest {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

/**
 * 依赖分类
 */
type Category = "core" | "ui" | "style" | "state" | "data" | "dev" | "other";

/**
 * 依赖元数据
 */
interface PackageMeta {
  category: Category;
  description: string;
  docs?: string;
}

/**
 * 依赖条目
 */
interface PackageItem extends PackageMeta {
  name: string;
  version: string;
  dev: boolean;
}

const isStringRecord = (value: unknown): value is Record<string, string> =>
  typeof value === "object" && value !== null && Object.values(value).every((item) => typeof item === "string");

const isManifest = (value: unknown): value is PackageManifest =>
  typeof value === "object"
  && value !== null
  && (!("dependencies" in value) || isStringRecord(value.dependencies))
  && (!("devDependencies" in value) || isStringRecord(value.devDependencies));

const parsedManifest: unknown = JSON.parse(packageJsonRaw);
const manifest: PackageManifest = isManifest(parsedManifest) ? parsedManifest : {};

const CATEGORY_ORDER: Category[] = ["core", "ui", "style", "state", "data", "dev", "other"];

const CATEGORY_LABELS: Record<Category, string> = {
  core: "核心框架",
  ui: "界面与交互",
  style: "样式与字体",
  state: "状态与 Hooks",
  data: "数据与内容",
  dev: "开发工具",
  other: "其他",
};

const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  core: "React 运行时、DOM 与路由",
  ui: "组件原语、图标与交互控件",
  style: "Tailwind、字体与视觉工具",
  state: "状态管理与无 UI hooks",
  data: "图表、日期与代码高亮",
  dev: "构建、类型检查与格式化",
  other: "未分类依赖",
};

interface CategoryGroup {
  id: Category;
  label: string;
  items: PackageItem[];
}

const npmUrl = (name: string) => `https://www.npmjs.com/package/${name}`;

/**
 * 手工维护的依赖说明与分类；版本始终来自 package.json
 */
const PACKAGE_META: Record<string, PackageMeta> = {
  react: { category: "core", description: "用于构建界面的 UI 运行时", docs: "https://react.dev" },
  "react-dom": { category: "core", description: "React 的 DOM 渲染器", docs: "https://react.dev" },
  "react-router": { category: "core", description: "客户端路由与数据加载", docs: "https://reactrouter.com" },
  "@base-ui/react": {
    category: "ui",
    description: "无样式、可访问性良好的组件原语",
    docs: "https://base-ui.com",
  },
  "@shadcn/react": {
    category: "ui",
    description: "shadcn 组件源码与约定",
    docs: "https://ui.shadcn.com",
  },
  shadcn: { category: "ui", description: "组件注册表命令行工具", docs: "https://ui.shadcn.com/docs/cli" },
  cmdk: { category: "ui", description: "命令面板与可搜索列表", docs: "https://cmdk.paco.me" },
  "lucide-react": { category: "ui", description: "线性图标集", docs: "https://lucide.dev/icons" },
  "input-otp": { category: "ui", description: "一次性验证码输入框", docs: npmUrl("input-otp") },
  "react-day-picker": { category: "ui", description: "日期选择器", docs: "https://daypicker.dev" },
  "react-resizable-panels": {
    category: "ui",
    description: "可调整大小的分栏面板",
    docs: npmUrl("react-resizable-panels"),
  },
  "embla-carousel-react": { category: "ui", description: "轻量轮播引擎", docs: "https://www.embla-carousel.com" },
  tailwindcss: { category: "style", description: "原子化 CSS 框架", docs: "https://tailwindcss.com" },
  "@tailwindcss/vite": {
    category: "style",
    description: "Tailwind 的 Vite 插件",
    docs: "https://tailwindcss.com/docs/installation/using-vite",
  },
  "tw-animate-css": { category: "style", description: "Tailwind 动画工具类", docs: npmUrl("tw-animate-css") },
  "class-variance-authority": { category: "style", description: "组件变体组合工具", docs: "https://cva.style" },
  cn: { category: "style", description: "类名合并工具", docs: npmUrl("cn") },
  "@fontsource-variable/geist": {
    category: "style",
    description: "Geist 可变字体",
    docs: "https://fontsource.org/fonts/geist",
  },
  zustand: { category: "state", description: "轻量状态管理", docs: "https://zustand.docs.pmnd.rs" },
  "@mantine/hooks": { category: "state", description: "无 UI 的 React hooks 集合", docs: "https://mantine.dev/hooks/" },
  recharts: { category: "data", description: "React 图表库", docs: "https://recharts.org" },
  "date-fns": { category: "data", description: "日期处理工具", docs: "https://date-fns.org" },
  shiki: { category: "data", description: "代码高亮引擎", docs: "https://shiki.style" },
  "@babel/core": { category: "dev", description: "Babel 编译器核心", docs: "https://babeljs.io" },
  "@rolldown/plugin-babel": {
    category: "dev",
    description: "Rolldown 的 Babel 插件",
    docs: npmUrl("@rolldown/plugin-babel"),
  },
  "@types/babel__core": { category: "dev", description: "Babel 类型定义", docs: npmUrl("@types/babel__core") },
  "@types/node": { category: "dev", description: "Node.js 类型定义", docs: npmUrl("@types/node") },
  "@types/react": { category: "dev", description: "React 类型定义", docs: npmUrl("@types/react") },
  "@types/react-dom": { category: "dev", description: "React DOM 类型定义", docs: npmUrl("@types/react-dom") },
  "@vitejs/plugin-react": { category: "dev", description: "Vite 的 React 插件", docs: "https://vite.dev/plugins" },
  "babel-plugin-react-compiler": {
    category: "dev",
    description: "React Compiler",
    docs: "https://react.dev/learn/react-compiler",
  },
  oxfmt: { category: "dev", description: "代码格式化工具", docs: "https://oxc.rs/docs/guide/usage/formatter" },
  oxlint: { category: "dev", description: "高性能 Lint", docs: "https://oxc.rs/docs/guide/usage/linter" },
  "oxlint-tsgolint": {
    category: "dev",
    description: "类型感知的 Lint 规则",
    docs: "https://oxc.rs/docs/guide/usage/linter",
  },
  typescript: { category: "dev", description: "JavaScript 类型系统", docs: "https://www.typescriptlang.org" },
  vite: { category: "dev", description: "前端构建工具", docs: "https://vite.dev" },
};

const metaFor = (name: string, dev: boolean): PackageMeta =>
  PACKAGE_META[name] ?? {
    category: dev ? "dev" : "other",
    description: "项目依赖",
    docs: npmUrl(name),
  };

const toPackage = (name: string, version: string, dev: boolean): PackageItem => {
  const meta = metaFor(name, dev);
  return {
    name,
    version,
    dev,
    category: meta.category,
    description: meta.description,
    docs: meta.docs,
  };
};

const buildItems = (): PackageItem[] => {
  const runtime = Object.entries(manifest.dependencies ?? {}).map(([name, version]) => toPackage(name, version, false));
  const development = Object.entries(manifest.devDependencies ?? {}).map(([name, version]) =>
    toPackage(name, version, true),
  );
  return [...runtime, ...development];
};

const ALL_ITEMS = buildItems();

/**
 * 技术栈 / 依赖总览
 *
 * 版本直接来自 package.json，说明和分类来自本地元数据，避免版本漂移。
 */
const Stack = () => {
  const [copied, setCopied] = useState(false);
  const clearCopied = useDebouncedCallback(() => setCopied(false), 1400);

  const runtimeCount = ALL_ITEMS.filter((item) => !item.dev).length;
  const devCount = ALL_ITEMS.length - runtimeCount;
  const groups: CategoryGroup[] = CATEGORY_ORDER.map((id) => ({
    id,
    label: CATEGORY_LABELS[id],
    items: ALL_ITEMS.filter((item) => item.category === id),
  })).filter((group) => group.items.length > 0);

  const copyAll = async () => {
    const runtime = ALL_ITEMS.filter((item) => !item.dev).map((item) => item.name);
    const dev = ALL_ITEMS.filter((item) => item.dev).map((item) => item.name);
    try {
      await navigator.clipboard.writeText(`pnpm add ${runtime.join(" ")}\npnpm add -D ${dev.join(" ")}`);
      setCopied(true);
      clearCopied();
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6">
      <header className="space-y-4">
        <p className="text-muted-foreground font-mono text-[10px] tracking-[0.28em] uppercase">Stack</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">技术栈</h1>
        <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
          这个模板实际安装的依赖。版本从 package.json 读取，按层组织运行时与开发工具。
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-muted-foreground font-mono text-[11px]">
            {ALL_ITEMS.length} 个依赖 · {runtimeCount} 运行时 · {devCount} 开发 · pnpm
          </p>
          <span aria-hidden className="bg-border h-3 w-px" />
          <Button variant="outline" size="sm" onClick={() => void copyAll()}>
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? "已复制" : "复制安装命令"}
          </Button>
        </div>
      </header>

      <div className="lg:divide-border grid grid-cols-2 gap-y-5 border-y py-5 sm:grid-cols-3 lg:grid-cols-6 lg:divide-x">
        {groups.map((group, index) => (
          <a
            key={group.id}
            href={`#stack-${group.id}`}
            className="group flex flex-col gap-0.5 px-4 lg:px-5 lg:first:pl-0"
          >
            <span
              className={cn("font-mono text-[9px]", group.id === "core" ? "text-primary" : "text-muted-foreground")}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="group-hover:text-foreground text-sm font-medium transition-colors">{group.label}</span>
            <span className="text-muted-foreground font-mono text-[10px]">{group.items.length} 个</span>
          </a>
        ))}
      </div>

      <div>
        {groups.map((group, index) => (
          <section
            key={group.id}
            id={`stack-${group.id}`}
            className={cn("scroll-mt-20 border-t py-6 first:border-t-0 sm:py-7", group.id === "dev" && "border-dashed")}
          >
            <div className="flex items-baseline gap-3">
              <span
                className={cn(
                  "w-5 shrink-0 font-mono text-[10px]",
                  group.id === "core" ? "text-primary" : "text-muted-foreground",
                )}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <h2 className="text-lg font-semibold tracking-tight">{group.label}</h2>
              <span className="text-muted-foreground ml-auto shrink-0 font-mono text-[10px]">{group.items.length}</span>
            </div>

            <p className="text-muted-foreground mt-1 pl-8 text-xs leading-relaxed">{CATEGORY_DESCRIPTIONS[group.id]}</p>

            <div className="mt-4 grid gap-x-8 gap-y-1 pl-8 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((item) => (
                <a
                  key={item.name}
                  href={item.docs ?? npmUrl(item.name)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`打开 ${item.name} 文档`}
                  title={item.description}
                  className="group hover:border-border border-b border-transparent py-1.5 transition-colors"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="group-hover:text-foreground truncate font-mono text-sm">{item.name}</span>
                    <span className="text-muted-foreground shrink-0 font-mono text-[10px]">
                      {item.version.replace(/^[~^]/, "")}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export { Stack };

# React + TypeScript + shadcn Admin Template

基于 Vite、React 19、TypeScript、Tailwind CSS 4 与 shadcn/base-ui 的后台模板。
包含主题系统、可折叠侧边栏、Command Palette、组件画廊、技术栈页与示例请求层。

## 技术栈

- React 19 + TypeScript
- Vite 8 + Rolldown
- Tailwind CSS 4
- shadcn `base-nova` + Base UI
- React Router 8
- Zustand
- Recharts、Shiki、Mantine Hooks
- Oxlint + Oxfmt
- Husky + lint-staged

## 本地启动

```bash
pnpm install
cp .env.example .env
pnpm dev
```

默认地址：`http://localhost:5173`

> 项目使用 pnpm。`.env` 已被忽略，模板只提交 `.env.example`。

## 用 tiged 创建新项目

先把当前仓库推送到 GitHub，然后：

```bash
npx tiged rxxx979/react-ts-shadcn-template my-app
cd my-app
git init
cp .env.example .env
pnpm install
pnpm dev
```

`tiged` 只会复制文件，不会携带原仓库的 `.git` 历史，所以需要自己 `git init`。
Husky 的 `prepare` 已经做了保护：没有 Git 仓库时会跳过；执行 `git init` 后重新安装或运行：

```bash
pnpm prepare
```

即可安装 Git hooks。

## 环境变量

复制 `.env.example`：

```env
VITE_APP_NAME=Shadcn Admin
VITE_API_BASE_URI=/api
```

- `VITE_APP_NAME`：应用默认名称
- `VITE_API_BASE_URI`：请求层的基础路径

运行时也可以在「外观设置」中修改应用名、主题、布局等配置，配置会持久化到 `localStorage`。

## 常用脚本

```bash
pnpm dev          # 开发
pnpm build        # 类型检查 + 构建
pnpm preview      # 预览构建产物
pnpm lint         # Oxlint
pnpm lint:fix     # Oxlint 自动修复
pnpm fmt          # Oxfmt 格式化
pnpm fmt:check    # 格式检查
pnpm lint:staged  # 只检查暂存文件
```

## Git Hooks

- `.husky/pre-commit` 执行 `pnpm exec lint-staged`
- 暂存的 JS / TS 文件：`oxlint --fix` + `oxfmt --write`
- 暂存的 JSON / CSS / Markdown：`oxfmt --write`
- 修改后的文件会自动重新暂存

没有 Git 仓库时，`prepare` 会跳过 Husky 安装；`git init` 后运行 `pnpm prepare` 即可。

## 目录结构

```text
src/
├── App.tsx
├── main.tsx
├── router/
│   ├── index.tsx
│   └── Lazy.tsx
├── pages/
│   ├── Home.tsx
│   ├── Components.tsx
│   ├── Stack.tsx
│   └── NotFound.tsx
├── components/
│   ├── OverlayScrollbar.tsx
│   ├── layout/
│   ├── theme/
│   └── ui/
├── config/
├── hooks/
├── lib/
├── stores/
└── styles/
```

业务页面放在 `pages/`，布局与壳层放在 `components/layout/`，可复用基础组件放在 `components/ui/`，请求与主题等基础设施放在 `lib/`。

## 请求层

`src/lib/request.ts` 提供：

- 自动拼接 `VITE_API_BASE_URI`
- query 序列化
- JSON body
- 统一 `Result` 解包
- `ApiError`

`src/hooks/use-request.ts` 提供 `useRequest`，管理 `data / loading / error`，并处理竞态与取消：

```ts
const { data, loading, refresh } = useRequest((signal) => request<Project[]>("/projects", { signal }));
```

## 主题系统

主题、布局、应用配置分别由 Zustand store 管理，并通过外观面板实时修改。
首帧主题由 `index.html` 中的同步脚本提前应用，避免刷新时闪白。

## License

[MIT](./LICENSE) © 2026 rxxx979

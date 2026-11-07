<h1 align="center">Shadcn Admin Template</h1>

<p align="center">
  一个专注核心能力的 React 后台起点，包含运行时主题、<br />
  登录鉴权、通知中心和干净的 App Shell。
</p>

<p align="center">
  <a href="./README.md">English</a> · 简体中文
</p>

<p align="center">
  <a href="./LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue.svg" /></a>
  <img alt="React 19" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
  <img alt="Vite 8" src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-7-3178C6?logo=typescript&logoColor=white" />
  <img alt="Tailwind CSS 4" src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" />
  <img alt="shadcn" src="https://img.shields.io/badge/shadcn-base--nova-000000" />
</p>

<p align="center">
  <img src="./docs/preview.png" alt="Shadcn Admin Template 预览" width="100%" />
</p>

## 分支

| 分支       | 用途                                                        |
| ---------- | ----------------------------------------------------------- |
| `main`     | 精简起点：Home、Settings、Notifications、Permissions        |
| `showcase` | 完整示例：Projects 表格、Kanban、Upload、Components、SSE 等 |

新项目使用 `main`；需要查看完整交互示例时切换到 `showcase`。

## 包含内容

- **运行时主题** — 明暗/跟随系统、主题预设、自定义品牌色、界面色与强调色
- **布局控制** — 侧边栏位置、变体、折叠模式、宽度、顶栏样式与内容宽度
- **无主题闪烁** — 首帧前同步应用持久化主题，避免刷新时闪白
- **Command Palette** — 使用 `⌘K` 搜索页面与操作
- **Auth + 权限** — data mode 登录/登出、受保护路由、运行时页面权限与按钮级权限门
- **通知中心** — 分组通知、未读状态与 mock SSE 实时流
- **Settings 表单** — React Router data mode action、Zod 校验与字段错误
- **错误边界** — 页面级与应用级 fallback，避免白屏
- **严格工具链** — Oxlint（type-aware）、Oxfmt、Husky 与 lint-staged

## 技术栈

| 领域  | 选择                                   |
| ----- | -------------------------------------- |
| 框架  | React 19、TypeScript 7                 |
| 构建  | Vite 8 + Rolldown、React Compiler      |
| 样式  | Tailwind CSS 4、`tw-animate-css`       |
| UI    | shadcn `base-nova`、Base UI primitives |
| 路由  | React Router 8                         |
| 状态  | Zustand 5                              |
| Hooks | Mantine Hooks                          |
| 质量  | Oxlint、Oxfmt、Husky、lint-staged      |

## 环境要求

- Node.js `^20.19.0 || >=22.12.0`
- pnpm 12+

## 快速开始

```bash
git clone git@github.com:rxxx979/react-ts-shadcn-template.git
cd react-ts-shadcn-template

pnpm install
cp .env.example .env
pnpm dev
```

打开 <http://localhost:5173>，会自动跳转到 `/login`。

### 完整示例

```bash
git clone -b showcase git@github.com:rxxx979/react-ts-shadcn-template.git
cd react-ts-shadcn-template
pnpm install
cp .env.example .env
pnpm dev
```

## 使用这个模板

```bash
npx tiged rxxx979/react-ts-shadcn-template my-app
cd my-app
git init
cp .env.example .env
pnpm install
pnpm dev
```

`tiged` 只会复制文件，不会携带原仓库的 Git 历史，所以需要自己初始化仓库。

如果在 `git init` 之前执行了 `pnpm install`，Husky 的 prepare 步骤会被跳过。`git init` 之后运行：

```bash
pnpm prepare
```

## 页面

`main` 只保留应用壳层和可复用能力：

```text
/login
/                  Home
/settings          data mode 表单 + Zod 校验
/notifications     分组通知 + mock SSE
/permissions       运行时权限矩阵（管理员）
```

`/settings` 和 `/permissions` 受权限保护；通知对所有已登录用户开放。

## 演示账号

| 角色   | 邮箱                 | 密码        | 可访问内容       |
| ------ | -------------------- | ----------- | ---------------- |
| 管理员 | `admin@example.com`  | `admin123`  | 设置、权限、通知 |
| 编辑   | `editor@example.com` | `editor123` | 设置、通知       |
| 访客   | `viewer@example.com` | `viewer123` | 通知             |

登录态是 **前端 mock**，保存在 `localStorage`，不代表真实安全边界。

## 权限

精简版保留两个权限：

```text
settings:update
permission:manage
```

页面权限在启动时从 `public/permission.json` 加载。管理员可以在 `/permissions` 按角色开关权限，覆盖值保存在 `localStorage`，导航和路由守卫会立即生效。

真实项目应由后端返回权限列表，并在每个 API 上强制校验。

## 脚本

| 命令               | 说明                   |
| ------------------ | ---------------------- |
| `pnpm dev`         | 启动开发服务器         |
| `pnpm build`       | 类型检查并构建生产产物 |
| `pnpm preview`     | 预览生产构建           |
| `pnpm lint`        | 运行 Oxlint            |
| `pnpm lint:fix`    | 运行 Oxlint 并自动修复 |
| `pnpm fmt`         | 使用 Oxfmt 格式化      |
| `pnpm fmt:check`   | 检查格式               |
| `pnpm lint:staged` | 手动运行 lint-staged   |

## 目录结构

```text
src/
├── App.tsx
├── main.tsx
├── router/
│   ├── index.tsx
│   ├── auth.ts
│   ├── navigation.ts
│   ├── navigation-context.ts
│   └── NavigationProvider.tsx
├── pages/
│   ├── Login.tsx
│   ├── Home.tsx
│   ├── Settings.tsx
│   ├── Notifications.tsx
│   ├── Permissions.tsx
│   └── NotFound.tsx
├── components/
│   ├── layout/
│   ├── theme/
│   ├── notifications/
│   ├── auth/
│   └── ui/
├── hooks/
├── lib/
├── stores/
└── styles/
```

- `pages/` — 路由级页面
- `components/layout/` — 应用壳层、侧边栏、顶栏、页脚
- `components/theme/` — 主题与外观面板
- `components/ui/` — shadcn registry 组件
- `lib/` — 请求、auth、权限、通知与共享工具
- `stores/` — auth、主题、布局、应用设置与通知的持久化 Zustand store
- `router/auth.ts` — data mode 登录/登出 action、auth 与权限守卫
- `components/auth/Can.tsx` — 按钮级权限门

## 主题系统

主题、布局和应用设置拆分为三个持久化 Zustand store：

- `stores/theme.ts` — 模式、预设、颜色、字体、圆角、动效
- `stores/layout.ts` — 侧边栏位置/变体/宽度、顶栏样式、内容宽度、背景纹理
- `stores/app.ts` — 应用名称、副标题与界面可见性

外观面板写入这些 store，并实时更新 CSS 变量。

`index.html` 中的同步脚本会在首帧前读取持久化主题，避免刷新时出现错误的主题闪烁。

## 请求层

`src/lib/request.ts` 提供类型安全的 fetch 封装：

```ts
import { request } from "@/lib/request";

const projects = await request<Project[]>("/projects", {
  query: { page: 1, pageSize: 20 },
});
```

它处理基础 URI、query 序列化、JSON body、`Result` 解包与 `ApiError`。

## 错误处理

- `components/ErrorBoundary.tsx` 捕获渲染错误和 lazy chunk 加载失败
- `components/layout/PageError.tsx` 保留 Layout 外壳并提供重试
- `components/layout/RootError.tsx` 处理应用级错误
- 根路由配置了 `errorElement`
- 环境变量在应用渲染前校验

## Git Hooks

- `.husky/pre-commit` 执行 `pnpm exec lint-staged`
- 暂存的 JS/TS 文件：`oxlint --fix` + `oxfmt --write`
- 暂存的 JSON/CSS/Markdown：`oxfmt --write`
- 修复后的文件会自动重新暂存

没有 Git 仓库时，`prepare` 会跳过 Husky 安装。`git init` 后运行 `pnpm prepare` 即可。

## 贡献

欢迎提交 Issue 和 Pull Request。

提交 PR 前请先运行：

```bash
pnpm lint
pnpm build
```

保持改动聚焦，并遵循现有的视觉语言。

## License

[MIT](./LICENSE) © 2026 [rxxx979](https://github.com/rxxx979)

## 致谢

使用 [React](https://react.dev)、[Vite](https://vite.dev)、[Tailwind CSS](https://tailwindcss.com)、[shadcn](https://ui.shadcn.com)、[Base UI](https://base-ui.com)、[Lucide](https://lucide.dev) 和 [Geist](https://vercel.com/font) 构建。

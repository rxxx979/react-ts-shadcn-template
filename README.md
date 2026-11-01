<h1 align="center">Shadcn Admin Template</h1>

<p align="center">
  English · <a href="./README_ZH-CN.md">简体中文</a>
</p>

<p align="center">
  A carefully crafted React admin template with runtime theming,<br />
  a collapsible sidebar, command palette and a complete component gallery.
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
  <img src="./docs/preview.png" alt="Shadcn Admin Template preview" width="100%" />
</p>

## Why this template

Most admin templates give you a layout and a handful of pages. This one focuses on the details that make an interface feel finished:

- **Runtime theming** — light/dark/system, theme presets, custom primary, surface and accent colors
- **Layout controls** — sidebar side, variant, collapse mode, width, header style and content width
- **No theme flash** — a pre-paint bootstrap script applies persisted theme settings before React mounts
- **Command palette** — search pages and actions with `⌘K`
- **Component gallery** — a browsable showcase of the included shadcn/Base UI components
- **Thoughtful defaults** — overlay scrollbars, reduced-motion support, responsive layout and keyboard shortcuts
- **Typed request layer** — a small `request` client and `useRequest` hook with race/cancel handling
- **Strict tooling** — Oxlint (type-aware), Oxfmt, Husky and lint-staged

## Tech Stack

| Area           | Choice                                 |
| -------------- | -------------------------------------- |
| Framework      | React 19, TypeScript 7                 |
| Build          | Vite 8 + Rolldown, React Compiler      |
| Styling        | Tailwind CSS 4, `tw-animate-css`       |
| UI             | shadcn `base-nova`, Base UI primitives |
| Routing        | React Router 8                         |
| State          | Zustand 5                              |
| Hooks          | Mantine Hooks                          |
| Data / content | Recharts, Shiki                        |
| Quality        | Oxlint, Oxfmt, Husky, lint-staged      |

## Requirements

- Node.js `^20.19.0 || >=22.12.0`
- pnpm 10+

## Quick Start

```bash
git clone git@github.com:rxxx979/react-ts-shadcn-template.git
cd react-ts-shadcn-template

pnpm install
cp .env.example .env
pnpm dev
```

Open <http://localhost:5173>.

## Use This Template

### tiged

```bash
npx tiged rxxx979/react-ts-shadcn-template my-app
cd my-app
git init
cp .env.example .env
pnpm install
pnpm dev
```

`tiged` copies the repository without its Git history, so initialize a new repository yourself.

If you run `pnpm install` before `git init`, the Husky prepare step is skipped. After `git init`, run:

```bash
pnpm prepare
```

Or use GitHub's **Use this template** button if the repository is marked as a template.

## Environment Variables

Copy the example file:

```bash
cp .env.example .env
```

| Variable            | Default        | Description                        |
| ------------------- | -------------- | ---------------------------------- |
| `VITE_APP_NAME`     | `Shadcn Admin` | Default application name           |
| `VITE_API_BASE_URI` | `/api`         | Base URI used by the request layer |

`.env` is ignored by Git. The template ships with `.env.example` only.

Application name, theme and layout can also be changed at runtime from the appearance panel; settings are persisted in `localStorage`.

## Scripts

| Command            | Description                         |
| ------------------ | ----------------------------------- |
| `pnpm dev`         | Start the development server        |
| `pnpm build`       | Type-check and build for production |
| `pnpm preview`     | Preview the production build        |
| `pnpm lint`        | Run Oxlint                          |
| `pnpm lint:fix`    | Run Oxlint with automatic fixes     |
| `pnpm fmt`         | Format with Oxfmt                   |
| `pnpm fmt:check`   | Check formatting                    |
| `pnpm lint:staged` | Run lint-staged manually            |

## Project Structure

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

- `pages/` — route-level screens
- `components/layout/` — application shell, sidebar, header, footer
- `components/theme/` — theme and appearance UI
- `components/ui/` — shadcn registry components
- `lib/` — request, theme helpers and shared types
- `stores/` — persisted Zustand stores for theme, layout and app settings

## Theme System

Theme, layout and app settings are split into three persisted Zustand stores:

- `stores/theme.ts` — mode, preset, colors, typography, radius, motion
- `stores/layout.ts` — sidebar side/variant/width, header style, content width, background pattern
- `stores/app.ts` — application name, tagline and UI visibility

The appearance panel writes to these stores and updates CSS variables in real time.

The small synchronous script in `index.html` reads the persisted theme before the first paint, preventing a flash of the wrong theme on reload.

## Request Layer

`src/lib/request.ts` provides a typed fetch wrapper:

```ts
import { request } from "@/lib/request";

const projects = await request<Project[]>("/projects", {
  query: { page: 1, pageSize: 20 },
});
```

It handles the base URI, query serialization, JSON bodies, `Result` unwrapping and `ApiError`.

`src/hooks/use-request.ts` adds a hook for React:

```ts
const { data, loading, error, refresh, cancel } = useRequest((signal) => request<Project[]>("/projects", { signal }));
```

The hook manages `data / loading / error`, ignores stale responses, aborts in-flight requests on unmount and exposes `run`, `refresh`, `cancel` and `mutate`.

## Git Hooks

- `.husky/pre-commit` runs `pnpm exec lint-staged`
- Staged JS/TS files: `oxlint --fix` + `oxfmt --write`
- Staged JSON/CSS/Markdown: `oxfmt --write`
- Fixed files are automatically re-staged

Without a Git repository the `prepare` script skips Husky installation. Run `pnpm prepare` after `git init`.

## Contributing

Issues and pull requests are welcome.

Before opening a PR, please run:

```bash
pnpm lint
pnpm build
```

Keep changes focused and match the existing visual language.

## License

[MIT](./LICENSE) © 2026 [rxxx979](https://github.com/rxxx979)

## Acknowledgements

Built with [React](https://react.dev), [Vite](https://vite.dev), [Tailwind CSS](https://tailwindcss.com), [shadcn](https://ui.shadcn.com), [Base UI](https://base-ui.com), [Lucide](https://lucide.dev) and [Geist](https://vercel.com/font).

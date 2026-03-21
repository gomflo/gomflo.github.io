# CLAUDE.md

## Project Overview

Spanish-language personal portfolio site (gomflo.dev) with developer utility tools. Built with **Astro 5 + React 19 + Tailwind CSS 4**, deployed to GitHub Pages.

## Commands

```bash
npm run dev       # Dev server at localhost:4321
npm run build     # Production build to ./dist/
npm run preview   # Preview production build locally
```

## Tech Stack

- **Astro 5** - Static site generator with file-based routing
- **React 19** - Interactive islands via `client:load` / `client:visible`
- **Tailwind CSS 4** - Styling via Vite plugin (`@tailwindcss/vite`)
- **TypeScript** - Strict mode, path alias `@/*` -> `src/*`
- **shadcn/ui** - Component library (new-york style, lucide icons)
- **Sonner** - Toast notifications
- **next-themes** - Light/dark theme toggle

## Project Structure

```
src/
├── components/          # React components (tool implementations)
│   └── ui/              # shadcn/ui primitives (button, card, select, tabs, textarea, sonner)
├── lib/                 # Utility functions (cn(), diff algorithm, cron parser)
├── layouts/
│   └── Layout.astro     # Root layout (header, theme toggle, toaster)
├── pages/               # Astro file-based routes (one per tool)
└── styles/
    └── global.css       # Design system: OKLCH colors, CSS custom properties, animations
public/                  # Static assets (favicon, robots.txt)
```

## Architecture Patterns

### Astro Pages
- Each page wraps a React component in `Layout.astro` with `title` and `description` props
- React components use `client:load` (immediate) or `client:visible` (lazy) hydration directives
- Pages use semantic HTML (`<main>`, `<section>`, `<header>`, `<nav>`)
- Scoped styles via `<style>` blocks

### React Components
- Functional components with hooks (`useState`, `useCallback`, `useEffect`, `useMemo`)
- Error handling: try-catch with `toast.error()` for user-facing messages
- Copy-to-clipboard with `toast.success()` feedback
- Full accessibility: ARIA labels, roles, live regions, keyboard support, focus management
- Minimum touch target: 44px height

### Styling
- OKLCH color space for theme variables in `global.css`
- Border radius: 0 (sharp corners throughout)
- Fonts: "Figtree" (display), "JetBrains Mono" (code)
- Responsive spacing with `clamp()` functions
- Max content width: 720px
- Entry animation: `[data-reveal]` fade+translate pattern
- Respects `prefers-reduced-motion`

### Utilities
- `cn()` from `src/lib/utils.ts` - merges classes via `clsx` + `tailwind-merge`
- `focusRing` / `disabled` - standardized focus and disabled state styles

## Conventions

- **Language**: All UI text is in Spanish (es-ES)
- **Commits**: Conventional commits format - `type(scope): description`
- **Error handling**: Always use `toast.error()` with descriptive messages; type-guard errors with `e instanceof Error`
- **Accessibility**: Required - ARIA labels, keyboard nav, screen reader support, semantic HTML
- **Components**: Prefer editing existing shadcn/ui components over creating new ones
- **Imports**: Use `@/` path alias (e.g., `@/components/ui/button`, `@/lib/utils`)

## CI/CD

GitHub Actions deploys on push to `main`:
1. Node 20 + `npm ci`
2. `npm run build`
3. Deploy `./dist/` to GitHub Pages

## Available Tools (Pages)

| Route | Component | Purpose |
|---|---|---|
| `/formatear-json` | JsonFormatter | JSON format/minify |
| `/decodificar-jwt` | JwtDecoder | JWT decode |
| `/base64-archivo` | Base64FileConverter | Base64 file conversion |
| `/contar-caracteres` | CharacterCounter | Character/word count |
| `/remover-acentos` | AccentRemover | Remove diacritics |
| `/ordenar-lista` | ListSorter | Sort text lines |
| `/conversor-cron` | CronConverter | Cron expression helper |
| `/comparar-diff` | DiffViewer | Text diff comparison |
| `/user-agent` | UserAgent | Browser UA display |

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
- **Tema claro/oscuro** - clase `.dark` en `<html>`, script inline en `Layout.astro` + `ThemeToggle.tsx` (no se usa next-themes)

## Project Structure

```
src/
├── components/          # React components (tool implementations)
│   ├── brand/           # Identidad en Astro: Motif (SVG por herramienta), Rosette, LogoMark, TileStrip
│   ├── tool-kit.tsx     # Piezas compartidas: CopyButton, ResultRow, Segmented, Checkbox, InlineError, clases de campos
│   └── ui/              # shadcn/ui primitives (button, card, select, tabs, textarea, sonner)
├── lib/
│   ├── tools.ts         # Catálogo único de herramientas y categorías (fuente de verdad)
│   ├── utils.ts         # cn()
│   └── *.ts             # Lógica pura por herramienta (diff, cron, md5, color, case, random, numeros-letras)
├── layouts/
│   ├── Layout.astro     # Root layout (header con LogoMark, theme toggle, toaster, cenefa, script de personaje)
│   └── ToolLayout.astro # Plantilla de herramienta: motivo, título, FAQ, JSON-LD, herramientas relacionadas
├── pages/               # Astro file-based routes (one per tool)
├── scripts/
│   └── character.ts     # Ojos que siguen el puntero, parpadeo, giro del rosetón, reproducción de motivos
└── styles/
    ├── global.css       # Tokens "Azulejo", mapeo a tokens shadcn, utilidad .azulejo
    └── motifs.css       # Animaciones de los motivos SVG (reposo → en juego)
public/                  # Static assets (favicon, robots.txt, img/ para og:image)
```

## Architecture Patterns

### Astro Pages
- Cada página de herramienta usa `ToolLayout.astro` con `slug`, `metaTitle` (≤ 60 caracteres), `description` (140–160), `heading`, `lead`, `sectionLabel` y `faq` (3 preguntas) y envuelve un componente React con `client:load`
- `ToolLayout` genera JSON-LD (WebApplication, BreadcrumbList, FAQPage) y agrega `og:image` solo si existe `public/img/<slug>.jpeg`
- El inicio (`index.astro`) arma un panel de azulejos por categoría a partir de `src/lib/tools.ts` y publica WebSite + ItemList
- Pages use semantic HTML (`<main>`, `<section>`, `<header>`, `<nav>`)

### Agregar una herramienta
1. Lógica pura en `src/lib/<nombre>.ts`
2. Componente en `src/components/<Nombre>.tsx` con raíz `className="tool-view grid gap-5"` y secciones `data-reveal`; usa `tool-kit.tsx`
3. Entrada en `tools` de `src/lib/tools.ts` (con `category`); mantén cada categoría en múltiplos de 3 para que el panel quede completo
4. Motivo SVG en `components/brand/Motif.astro` (viewBox 64×64, `currentColor` + `.m-accent`) y sus estados en `styles/motifs.css`; usa clases `m-*` únicas para no chocar con otros motivos
5. Página en `src/pages/<slug>.astro` con `ToolLayout` y FAQ

### React Components
- Functional components with hooks (`useState`, `useCallback`, `useEffect`, `useMemo`)
- Error handling: try-catch with `toast.error()` for user-facing messages
- Copy-to-clipboard with `toast.success()` feedback
- Full accessibility: ARIA labels, roles, live regions, keyboard support, focus management
- Minimum touch target: 44px height

### Styling
- Identidad "Azulejo" (talavera): tokens de marca `--glaze`, `--glaze-raised`, `--glaze-sunk`, `--cobalt`, `--ink`, `--ink-muted`, `--grout`, `--yolk`; los tokens shadcn (`--primary`, `--border`…) apuntan a ellos. Tema oscuro "noche" en `.dark`
- Utilidades Tailwind de marca: `bg-cobalt`, `bg-yolk`, `text-ink`…
- Radios: azulejos 1.25–1.75rem, campos `rounded-xl`, botones y pestañas `rounded-full`
- Fonts: "Bricolage Grotesque" (display y texto, eje `wdth` 78–85 en titulares), "Martian Mono" (código, `.font-code`)
- Easing: `--ease-out`, `--ease-in-out`, `--ease-spring`
- Max width: `--max-width` 70rem (inicio), `--tool-width` 52rem (herramientas); gutter `--gutter`
- Entry animation: `[data-reveal]` dentro de las clases raíz listadas en `global.css` (incluye `.tool-view`)
- Respects `prefers-reduced-motion` (motivos y rosetón incluidos)

### Utilities
- `cn()` from `src/lib/utils.ts` - merges classes via `clsx` + `tailwind-merge`
- `focusRing` / `disabled` - standardized focus and disabled state styles

## Conventions

- **Language**: All UI text is in Spanish (es-MX); copy en tono directo, sin mayúsculas sostenidas en etiquetas
- **Commits**: Conventional commits format - `type(scope): description`
- **Error handling**: Always use `toast.error()` with descriptive messages; type-guard errors with `e instanceof Error`
- **Accessibility**: Required - ARIA labels, keyboard nav, screen reader support, semantic HTML
- **Components**: Prefer editing existing shadcn/ui components over creating new ones
- **Imports**: Use `@/` path alias (e.g., `@/components/ui/button`, `@/lib/utils`)

## CI/CD

GitHub Actions deploys on push to `main`:
1. Node 22 + `npm ci`
2. `npm run build`
3. Deploy `./dist/` to GitHub Pages

## Available Tools (Pages)

La lista completa y sus categorías viven en `src/lib/tools.ts`.

| Route | Component | Categoría |
|---|---|---|
| `/contar-caracteres` | CharacterCounter | texto |
| `/convertir-mayusculas-minusculas` | CaseConverter | texto |
| `/remover-acentos` | AccentRemover | texto |
| `/ordenar-lista` | ListSorter | texto |
| `/comparar-diff` | DiffViewer | texto |
| `/numeros-a-letras` | NumberToWords | texto |
| `/formatear-json` | JsonFormatter | codigo |
| `/decodificar-jwt` | JwtDecoder | codigo |
| `/base64-texto` | Base64Text | codigo |
| `/base64-archivo` | Base64FileConverter | codigo |
| `/codificar-url` | UrlEncoder | codigo |
| `/timestamp-unix` | UnixTimestamp | codigo |
| `/generador-contrasenas` | PasswordGenerator | generadores |
| `/generador-uuid` | UuidGenerator | generadores |
| `/generador-hash` | HashGenerator | generadores |
| `/conversor-colores` | ColorConverter | generadores |
| `/conversor-cron` | CronConverter | generadores |
| `/user-agent` | UserAgent | generadores |

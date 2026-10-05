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
│   └── *.ts             # Lógica pura por herramienta (diff, cron, md5, color, case, random, numeros-letras, clabe, iva, dias-habiles, romanos, morse, binario)
│                        # bancos-clabe.ts: catálogo SPEI de Banxico (actualizar si cambian participantes)
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
- Imágenes para compartir (1200×630): `npm run build && npm run og` las genera desde `dist/` con Chrome sin interfaz (`scripts/og-images.mjs`). Córrelo al agregar páginas y cada enero (días feriados lleva el año)
- `trailingSlash: 'always'`: GitHub Pages redirige `/ruta` a `/ruta/` con 301, así que todos los enlaces internos llevan barra final
- Páginas satélite (`variants` en `tools.ts`): reutilizan una herramienta para otra búsqueda (`/contador-de-palabras/`, `/dias-feriados/`). Usan `ToolLayout` con `variant`, no cuentan para el panel del inicio y se enlazan desde la herramienta madre
- El inicio (`index.astro`) arma un panel de azulejos por categoría a partir de `src/lib/tools.ts` y publica WebSite + ItemList
- Pages use semantic HTML (`<main>`, `<section>`, `<header>`, `<nav>`)

### Agregar una herramienta
1. Lógica pura en `src/lib/<nombre>.ts`
2. Componente en `src/components/<Nombre>.tsx` con raíz `className="tool-view grid gap-5"` y secciones `data-reveal`; usa `tool-kit.tsx`
3. Entrada en `tools` de `src/lib/tools.ts` (con `category`); mantén cada categoría en múltiplos de 3 para que el panel quede completo
4. Motivo SVG en `components/brand/Motif.astro` (viewBox 64×64, `currentColor` + `.m-accent`) y sus estados en `styles/motifs.css`; usa clases `m-*` únicas para no chocar con otros motivos
5. Página en `src/pages/<slug>.astro` con `ToolLayout` y FAQ
6. `npm run build && npm run og` para su imagen de Open Graph

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
| `/validar-clabe` | ClabeValidator | mexico |
| `/calculadora-iva` | IvaCalculator | mexico |
| `/dias-habiles` | BusinessDays | mexico |
| `/numeros-romanos` | RomanNumerals | conversores |
| `/codigo-morse` | MorseCode | conversores |
| `/texto-a-binario` | TextBinary | conversores |
| `/contador-de-palabras` | CharacterCounter (`focus="words"`) | variante de contar-caracteres |
| `/dias-feriados` | HolidayCalendar (Astro) | variante de dias-habiles |
| `/partidos-de-hoy` | MatchGuide | fuera del catálogo, identidad propia |

### Guía de partidos (`/partidos-de-hoy/`)
- Diseño independiente (app deportiva clara/oscura, comparte la preferencia `theme` del sitio): no usa `Layout.astro` ni `global.css`, sino `styles/partidos.css` con clases `mg-*`
- Escudos (`scripts/escudos.mjs`): clubes con el de 500 px de ESPN (API pública por liga, nombres cruzados con alias), selecciones con bandera SVG de flagcdn.com; si nada coincide queda el de 32 px de la guía (sin agrandarlo) y, si no carga, un monograma. Para un club que no salga, agrega su alias en `CLUB_ALIASES`
- Sin filtros ni botón de tema arriba: la búsqueda vive en la barra y el tema (Automático/Claro/Oscuro) en el pie; "Automático" sigue a `prefers-color-scheme`
- `npm run partidos` descarga futbolenvivomexico.com y escribe `src/data/partidos.json` (ignorado en git). Si falla, conserva el archivo anterior; sin archivo la página sale vacía pero el build no se rompe
- El workflow de despliegue corre cada 3 horas (`schedule`) para refrescar la guía; el estado en vivo, el día "hoy" y la zona horaria se calculan en el navegador
- Si la fuente cambia su HTML, el parser está en `scripts/partidos.mjs` y la lógica pura en `src/lib/partidos.ts`

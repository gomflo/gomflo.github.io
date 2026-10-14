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
- **Sonner** - Toast notifications (solo en páginas de herramienta, desde `ToolLayout.astro`)
- **GSAP** - Entradas de los bloques y el color entre páginas
- **ClientRouter de Astro** - Navegación sin recarga; el motor (`src/engine/`) pone la transición
- **Tema claro/oscuro** - clase `.dark` en `<html>`, script inline en `Layout.astro` + `src/motion/tema.ts` (no se usa next-themes)
- **Diseño** - El concepto y el sistema están en `DESIGN.md`; léelo antes de tocar la interfaz

## Project Structure

```
src/
├── components/          # React components (tool implementations)
│   ├── brand/Motif.astro # Dibujo SVG por herramienta
│   ├── Piezas.astro     # La caja de piezas: todas las herramientas como bloques de color (inicio y 404)
│   ├── tool-kit.tsx     # Piezas compartidas: CopyButton, ResultRow, Segmented, Checkbox, InlineError, clases de campos
│   └── ui/              # shadcn/ui primitives (button, card, select, tabs, textarea, sonner)
├── engine/              # Motor de movimiento: ciclo de página (boot/leave/cleanup/enter, onPage), entradas `data-entra`, color entre páginas, adaptador de Astro
├── motion/              # Movimiento del sitio: piezas.ts (resultado en vivo de cada pieza), buscador.ts, tema.ts, setup.ts
├── lib/
│   ├── tools.ts         # Catálogo único de herramientas y categorías (fuente de verdad)
│   ├── utils.ts         # cn()
│   └── *.ts             # Lógica pura por herramienta (diff, cron, md5, color, case, random, numeros-letras, clabe, iva, dias-habiles, romanos, morse, binario)
│                        # bancos-clabe.ts: catálogo SPEI de Banxico (actualizar si cambian participantes)
├── layouts/
│   ├── Layout.astro     # Root layout (cabecera, botón de tema, color entre páginas `#curtain`, remate, arranque del motor)
│   └── ToolLayout.astro # Plantilla de herramienta: cabeza del color de su categoría, panel, FAQ, JSON-LD, relacionadas, toaster
├── pages/               # Astro file-based routes (one per tool)
└── styles/
    ├── global.css       # Fuentes, tokens "Bloques", mapeo a tokens shadcn, la pieza, enlaces, color entre páginas
    └── motifs.css       # Animaciones de los dibujos SVG (reposo → en juego)
public/                  # Static assets (favicon, fonts/ propias en woff2, robots.txt, img/ para og:image)
```

## Architecture Patterns

### Astro Pages
- Cada página de herramienta usa `ToolLayout.astro` con `slug`, `metaTitle` (≤ 60 caracteres), `description` (140–160), `heading`, `lead`, `sectionLabel` y `faq` (3 preguntas) y envuelve un componente React con `client:load`
- `ToolLayout` genera JSON-LD (WebApplication, BreadcrumbList, FAQPage) y agrega `og:image` solo si existe `public/img/<slug>.jpeg`
- Imágenes para compartir (1200×630): `npm run build && npm run og` las genera desde `dist/` con Chrome sin interfaz (`scripts/og-images.mjs`). Córrelo al agregar páginas y cada enero (días feriados lleva el año)
- `trailingSlash: 'always'`: GitHub Pages redirige `/ruta` a `/ruta/` con 301, así que todos los enlaces internos llevan barra final
- Páginas satélite (`variants` en `tools.ts`): reutilizan una herramienta para otra búsqueda (`/contador-de-palabras/`, `/dias-feriados/`). Usan `ToolLayout` con `variant`, no cuentan para el panel del inicio y se enlazan desde la herramienta madre
- El inicio (`index.astro`) arma la portada (título y mesa de pruebas), la caja de piezas con buscador a partir de `src/lib/tools.ts` y las apps; publica WebSite + ItemList
- Enlaces a páginas que no pasan por `Layout.astro` (`/susurro/`, `/destello/`, `/partidos-de-hoy/`, `/android/`) llevan `data-astro-reload`
- Pages use semantic HTML (`<main>`, `<section>`, `<header>`, `<nav>`)

### Agregar una herramienta
1. Lógica pura en `src/lib/<nombre>.ts`
2. Componente en `src/components/<Nombre>.tsx` con raíz `className="tool-view grid gap-5"` y secciones `data-reveal`; usa `tool-kit.tsx`
3. Entrada en `tools` de `src/lib/tools.ts` (con `category`) y su línea en `SALIDAS` de `src/motion/piezas.ts` (lo que la pieza muestra en vivo con el texto de la mesa)
4. Motivo SVG en `components/brand/Motif.astro` (viewBox 64×64, `currentColor` + `.m-accent`, que toma `--acento-dibujo`) y sus estados en `styles/motifs.css`; usa clases `m-*` únicas para no chocar con otros motivos
5. Página en `src/pages/<slug>.astro` con `ToolLayout` y FAQ
6. `npm run build && npm run og` para su imagen de Open Graph

### React Components
- Functional components with hooks (`useState`, `useCallback`, `useEffect`, `useMemo`)
- Error handling: try-catch with `toast.error()` for user-facing messages
- Copy-to-clipboard with `toast.success()` feedback
- Full accessibility: ARIA labels, roles, live regions, keyboard support, focus management
- Minimum touch target: 44px height

### Styling
- Identidad "Bloques" (una caja de piezas de colores): tokens `--crema`, `--panel`, `--tinta`, `--gris`, `--linea`, `--bloque-oscuro` y las piezas `--menta`, `--coral`, `--lila`, `--sol`, `--cielo`; los tokens shadcn (`--primary`, `--border`…) apuntan a ellos. De noche (`.dark`) la mesa se apaga y las piezas conservan su color
- El color es la categoría: `[data-cat="texto|codigo|generadores|mexico|conversores"]` fija `--pieza`. `ToolLayout` lo pone en `<main>`, así cada herramienta resalta con su color (`bg-pieza`, `.btn-pieza`, `.enlace`)
- Sobre una pieza de color el texto es `--tinta-fija`; para foco, texto de acento y controles se usa `--acento` (las piezas son fondos, no texto)
- Utilidades Tailwind de marca: `bg-pieza`, `bg-sol`, `bg-coral`, `bg-lila`, `bg-menta`, `bg-cielo`, `text-acento`, `text-tinta`…
- Todo es un bloque: `.pieza` (relleno de color, `--radio-pieza`), bloque oscuro (`--bloque-oscuro`) o contorno de tinta de 2 px. Sin sombras ni degradados
- Fonts propias: "Bricolage Grotesque" variable (texto y `.titular`) y "DM Mono" (`.etiqueta`, código, `.font-code`)
- Tratamientos: navegación `.ficha`, enlaces en texto `.enlace`, botón principal `.btn-pieza`
- Easing: `--ease-out`, `--ease-in-out`, `--ease-soft`, `--ease-spring`
- Max width: `--max-width` 82rem; `.contenedor` + `.reticula` de 12 columnas; hueco entre bloques `--hueco`
- Entradas: `data-entra` (motor, al entrar en pantalla o con `data-intro`), `.entra` (CSS, bloques de portada) y `[data-reveal]` dentro de las herramientas (`.tool-view`)
- Sin scroll suavizado ni loader; las páginas de herramienta no se mueven en reposo
- Respects `prefers-reduced-motion` (todo visible, sin caídas; el cambio de página es un fundido)

### Utilities
- `cn()` from `src/lib/utils.ts` - merges classes via `clsx` + `tailwind-merge`
- `focusRing` / `disabled` - standardized focus and disabled state styles

## Conventions

- **Language**: All UI text is in Spanish (es-MX); copy en tono directo; las herramientas son "piezas" y el conjunto "la caja"; sin rayas largas en texto visible
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
| `/android` | El cajón (Astro) | fuera del catálogo, identidad propia |

### Apps para Android (`/android/`)
- "El cajón": landing de las 10 apps de Android (repos en `~/code/<slug>`), con identidad propia como la guía de partidos: no usa `Layout.astro` ni `global.css`. Concepto y sistema en `docs/android.md`
- Catálogo en `src/data/android-apps.ts`; el copy de la página en `src/components/android/contenido.ts`; estilos en `styles/android.css`; movimiento en `motion/android.ts` (usa `src/engine` sin ClientRouter)
- Imágenes en `public/img/android/<slug>/` (`icono.png` cuadrado sin máscara, `captura-1..3.webp` de 540 px). Imagen para compartir: `public/img/android.jpeg` (captura del primer pliegue a 1200×630)
- Ninguna está en Google Play: al publicar una, pon su URL en `play` y el botón "Muy pronto" se vuelve enlace
- El inicio la enlaza con el bloque oscuro de `#apps`

### Guía de partidos (`/partidos-de-hoy/`)
- Diseño independiente (app deportiva clara/oscura, comparte la preferencia `theme` del sitio): no usa `Layout.astro` ni `global.css`, sino `styles/partidos.css` con clases `mg-*`
- Escudos (`scripts/escudos.mjs`): clubes con el de 500 px de ESPN (API pública por liga, nombres cruzados con alias), selecciones con bandera SVG de flagcdn.com; si nada coincide queda el de 32 px de la guía (sin agrandarlo) y, si no carga, un monograma. Para un club que no salga, agrega su alias en `CLUB_ALIASES`
- Sin filtros ni botón de tema arriba: la búsqueda vive en la barra y el tema (Automático/Claro/Oscuro) en el pie; "Automático" sigue a `prefers-color-scheme`
- `npm run partidos` descarga futbolenvivomexico.com y escribe `src/data/partidos.json` (ignorado en git). Si falla, conserva el archivo anterior; sin archivo la página sale vacía pero el build no se rompe
- El workflow de despliegue corre cada 3 horas (`schedule`) para refrescar la guía; el estado en vivo, el día "hoy" y la zona horaria se calculan en el navegador
- Si la fuente cambia su HTML, el parser está en `scripts/partidos.mjs` y la lógica pura en `src/lib/partidos.ts`

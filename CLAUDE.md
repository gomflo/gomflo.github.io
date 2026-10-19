# CLAUDE.md

## Project Overview

Spanish-language personal portfolio site (gomflo.dev) with developer utility tools. Built with **Astro 5 + React 19 + Tailwind CSS 4**, deployed to GitHub Pages.

## Commands

```bash
npm run dev       # Dev server at localhost:4321
npm run build     # Production build to ./dist/
npm run preview   # Preview production build locally
npm test          # Pruebas de la lógica pura (node --test + jiti): src/lib/*.test.ts
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
│   ├── Piezas.astro     # La caja de piezas: lista de todas las herramientas con su punto de color y línea en vivo (inicio y 404)
│   ├── tool-kit.tsx     # Piezas compartidas: CopyButton, ResultRow, Segmented, Checkbox, InlineError, clases de campos
│   └── ui/              # shadcn/ui primitives (button, card, select, tabs, textarea, sonner)
├── engine/              # Motor de movimiento: ciclo de página (boot/leave/cleanup/enter, onPage), entradas `data-entra`, color entre páginas, adaptador de Astro
├── motion/              # Movimiento del sitio: piezas.ts (resultado en vivo de cada pieza), buscador.ts, obras.ts (vista de las apps del inicio), tema.ts, setup.ts
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
- `faq` acepta `fuentes` (enlaces debajo de la respuesta); el slot `despues` pone contenido entre el panel y las preguntas; `avisos={false}` quita el Toaster de Sonner para que una herramienta sin React no cargue React
- `ToolLayout` genera JSON-LD (WebApplication, BreadcrumbList, FAQPage) y agrega `og:image` solo si existe `public/img/<slug>.jpeg`
- Imágenes para compartir (1200×630): `npm run build && npm run og` las genera desde `dist/` con Chrome sin interfaz (`scripts/og-images.mjs`), también para herramientas un nivel abajo (`/guardadito/calculadora-aguinaldo/` → `public/img/calculadora-aguinaldo.jpeg`). Córrelo al agregar páginas y cada enero (días feriados lleva el año). Con slugs genera solo esas (`npm run og -- garantia`; el inicio solo si pides `inicio`)
- `trailingSlash: 'always'`: GitHub Pages redirige `/ruta` a `/ruta/` con 301, así que todos los enlaces internos llevan barra final
- Páginas satélite (`variants` en `tools.ts`): reutilizan una herramienta para otra búsqueda (`/contador-de-palabras/`, `/dias-feriados/`). Usan `ToolLayout` con `variant`, no cuentan para el panel del inicio y se enlazan desde la herramienta madre
- El inicio (`index.astro`) arma la portada (título y mesa de pruebas), la caja de piezas con buscador a partir de `src/lib/tools.ts` y las apps; publica WebSite + ItemList
- Enlaces a páginas que no pasan por `Layout.astro` (`/susurro/`, `/destello/`, `/partidos-de-hoy/`, `/android/`, `/tinmarin/`, `/frijolito/`) llevan `data-astro-reload`
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
2. `npm test` y `npm run build`
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
| `/guardadito/calculadora-aguinaldo` | Astro + script (sin React) | mexico |
| `/garabato/que-dibujar` | Astro + script (sin React) | generadores |
| `/canica/cancelar-suscripcion` | Astro + script (sin React) | mexico |
| `/tiliches/garantia` | Astro + script (sin React) | mexico |
| `/dias-habiles` | BusinessDays | mexico |
| `/numeros-romanos` | RomanNumerals | conversores |
| `/codigo-morse` | MorseCode | conversores |
| `/texto-a-binario` | TextBinary | conversores |
| `/contador-de-palabras` | CharacterCounter (`focus="words"`) | variante de contar-caracteres |
| `/dias-feriados` | HolidayCalendar (Astro) | variante de dias-habiles |
| `/partidos-de-hoy` | MatchGuide | fuera del catálogo, identidad propia |
| `/tinmarin` | TinMarin | fuera del catálogo, identidad de la app |
| `/frijolito` | Cantador | fuera del catálogo, identidad de la app |
| `/android` | El cajón (Astro) | fuera del catálogo, identidad propia |
| `/guardadito` | Página de la app (Astro, `Layout.astro`) | fuera del catálogo |
| `/garabato` | Página de la app (Astro, `Layout.astro`) | fuera del catálogo |
| `/pastillero` | Página de la app (Astro, `Layout.astro`) | fuera del catálogo |
| `/canica` | Página de la app (Astro, `Layout.astro`) | fuera del catálogo |
| `/tiliches` | Página de la app (Astro, `Layout.astro`) | fuera del catálogo |

### Apps para Android (`/android/`)
- "El cajón": landing de las 10 apps de Android (repos en `~/code/<slug>`), con identidad propia como la guía de partidos: no usa `Layout.astro` ni `global.css`. Concepto y sistema en `docs/android.md`
- Catálogo en `src/data/android-apps.ts`; el copy de la página en `src/components/android/contenido.ts`; estilos en `styles/android.css`; movimiento en `motion/android.ts` (usa `src/engine` sin ClientRouter)
- Imágenes en `public/img/android/<slug>/` (`icono.png` cuadrado sin máscara, `captura-1..3.webp` de 540 px). Imagen para compartir: `public/img/android.jpeg` (captura del primer pliegue a 1200×630)
- Tin Marín, Frijolito y Pastillero están en Google Play: al publicar otra, pon su URL en `play` y el botón "Muy pronto" se vuelve enlace (la portada y el pie de `/android/` se ajustan solos)
- `pagina` (opcional) es la página de la app en gomflo.dev cuando no tiene versión web (`web`); el cajón la enlaza con «Conoce la app»
- El inicio la enlaza con el bloque oscuro de `#apps`

### Guardadito y la calculadora de aguinaldo (`/guardadito/`)
- `/guardadito/` es la página corta de la app de presupuesto por sobres (`~/code/guardadito`): solo dice lo que dice su ficha (`docs/TIENDA.md` de la app). Usa `Layout.astro`. El aviso de privacidad sigue en `public/guardadito/privacidad/`
- `/guardadito/calculadora-aguinaldo/` es una herramienta de la caja (categoría `mexico`, `href` fuera de la raíz en `tools.ts`) con `ToolLayout`, pero sin React: el HTML sale calculado con el ejemplo y un `<script>` (en `astro:page-load`, por el ClientRouter) recalcula al teclear. Lógica en `src/lib/aguinaldo.ts` con pruebas en `aguinaldo.test.ts`
- **Cada enero**: actualiza `UMA` (`anio` y `diario`) en `src/lib/aguinaldo.ts` con el valor del INEGI (https://www.inegi.org.mx/temas/uma/), corre `npm test` y `npm run og` (el título y la imagen llevan el año)
- No calcula el ISR de la parte gravada (depende de cada nómina): solo bruto, exento (30 UMA, art. 93 fr. XIV LISR) y gravado. Cada dato lleva su fuente (LFT, LISR e INEGI en diputados.gob.mx e inegi.org.mx)
- `GUARDADITO_EN_PLAY` (`src/lib/guardadito.ts`) está en `false` mientras la app esté en revisión: ningún botón ni enlace va a Play. Al pasarla a `true` salen los botones de las dos páginas (con `utm_source=web&utm_campaign=aguinaldo|guardadito` y `data-umami-event="play-guardadito"`), el `installUrl` del JSON-LD y el botón de `/android/`
- Umami: la calculadora manda `aguinaldo-calcula` una vez por visita al primer cambio, sin ningún dato de lo que se escribe

### Garabato y el generador de qué dibujar (`/garabato/`)
- `/garabato/` es la página corta del juego de dibujar para Android (`~/code/garabato`): solo dice lo que dice su ficha (`docs/TIENDA.md` de la app). Usa `Layout.astro`. Icono y capturas en `public/img/android/garabato/` (como las del cajón, aunque Garabato aún no está en `android-apps.ts`). El aviso de privacidad sigue en `public/garabato/privacidad/`
- `/garabato/que-dibujar/` es una herramienta de la caja (categoría `generadores`, `href` fuera de la raíz en `tools.ts`) con `ToolLayout` y `avisos={false}`, sin React: el HTML sale con una idea fácil ya pintada (cambia con cada despliegue, no al cargar) y un `<script>` (en `astro:page-load`) da otra, filtra por categoría y dificultad, guarda las últimas cinco y arma la lista del modo fiesta (copiar e imprimir en recuadros para recortar, `html.qd-imprime` + `@media print`)
- Ideas y lógica en `src/lib/que-dibujar.ts` con pruebas en `que-dibujar.test.ts`: `DE_GARABATO` son las palabras que la app pide (`words.tsv` con `prompt` 1 y exactitud ≥ 0.45, sin «botella de vino», «copa» ni «calzones»); `EXTRA`, lo que la app no tiene. Cada palabra va una sola vez y todas son de familia. Si la app cambia sus palabras, actualiza `DE_GARABATO` y el conteo de la prueba
- Reglas de Garabato: no se nombran otros juegos de dibujo y en lo que habla de la app no se dice «IA», «modelo» ni «red neuronal» (los rivales son personajes; por eso tampoco va la captura de «Cómo adivinan» ni la línea del conjunto de datos de la ficha)
- `GARABATO_EN_PLAY` (`src/lib/garabato.ts`) está en `false` mientras la app esté en revisión: las páginas dicen «Muy pronto en Google Play» sin enlace. **Al salir la app, pásala a `true`**: se prenden los botones de las dos páginas con `playLink` (`utm_source=gomflo.dev&utm_medium=web`, `utm_campaign=garabato|que-dibujar`) y `data-umami-event="play-garabato"` + `data-umami-event-pagina`, y el `installUrl` del JSON-LD. Considera también agregarla a `src/data/android-apps.ts`
- Umami: `que-dibujar-idea` y `que-dibujar-fiesta`, una vez por visita cada uno, sin ninguna palabra

### Canica y la guía para cancelar suscripciones (`/canica/`)
- `/canica/` es la página corta del control de suscripciones para Android (`~/code/canica`): solo dice lo que dice su ficha (`docs/TIENDA.md` y `PRODUCT.md` de la app). Usa `Layout.astro`. Icono y capturas en `public/img/android/canica/` (las del cajón más `captura-N-270.webp` e `icono-192.webp`). La imagen para compartir `public/img/canica.jpeg` es el gráfico de funciones de la ficha (`docs/tienda/grafico-1024x500-es.png`) a 1200 px sobre su fondo `rgb(242,238,230)`; `npm run og` no la genera. El aviso de privacidad sigue en `public/canica/privacidad/`
- `/canica/cancelar-suscripcion/` es una herramienta de la caja (categoría `mexico`, `href` fuera de la raíz en `tools.ts`) con `ToolLayout`, `avisos={false}` y `tituloLargo` (H1 más chico para que la calculadora quede a la vista). Sin React: el HTML sale calculado con el ejemplo y un `<script>` (en `astro:page-load`) agrega y quita renglones y recalcula al teclear. No guarda nada (ni servidor ni `localStorage`), y la página lo dice. Lógica en `src/lib/suscripciones.ts` con pruebas en `suscripciones.test.ts` (centavos enteros; semanal ×52, mensual ×12; al mes = lo del año entre 12, dividido una sola vez, como en la app)
- La guía cita tal cual el decreto del DOF del 12-12-2025 (fracciones VIII y IX del art. 76 Bis de la LFPC, vigentes desde el 13-12-2025), el texto vigente de la LFPC en diputados.gob.mx y el comunicado de Profeco del mismo día. Si cambian, manda la fuente: vuelve a leerlas antes de tocar las citas. Queja: Concilianet, ODECO y «Cómo presentar mi queja» de Profeco en gob.mx. Dice una sola vez que no es asesoría legal. Sin marcas en los títulos
- Reglas de Canica: no cancela nada, no ve los cobros del banco ni el correo y no hace cumplir la ley; no lo digas. Avisa antes de cada cobro (el mismo día, uno o tres días antes) y dos días antes de que termine una prueba gratis
- `CANICA_EN_PLAY` (`src/lib/canica.ts`) está en `false` mientras la app esté en revisión: las dos páginas dicen «Muy pronto en Google Play» sin enlace. **Al salir la app, pásala a `true`**: se prenden los botones con `canicaPlay` (`utm_source=gomflo.dev&utm_medium=web`, `utm_campaign=canica|cancelar-suscripcion`) y `data-umami-event="play-canica"` + `data-umami-event-pagina`, el `installUrl` del JSON-LD de `/canica/` y el botón de `/android/`
- Umami: `suscripciones-calcula`, una vez por visita, sin nada de lo que se escribe

### Tiliches y la calculadora de garantía (`/tiliches/`)
- `/tiliches/` es la página corta de la app de tickets y garantías para Android (`~/code/tiliches`): solo dice lo que dice su ficha (`docs/TIENDA.md` y `PRODUCT.md` de la app; palabras de búsqueda en `~/code/ventas-pro/aso/tiliches.md`). Usa `Layout.astro`. **Sin capturas**: las de la ficha (y su gráfico) traen nombres de tiendas y marcas como datos de ejemplo, y estas páginas no nombran ninguna; si la app saca capturas sin marcas, agrégalas como en `/canica/` (con su copia de 270 px). Icono en `public/img/android/tiliches/` (`icono-192.webp` para la cabeza). La imagen para compartir `public/img/tiliches.jpeg` es la parte izquierda del gráfico de la ficha (`docs/tienda/grafico-1024x500-es.png`: icono, nombre y lema, sin la etiqueta con marcas) a 630 px de alto sobre su fondo `rgb(43,74,66)`; `npm run og` no la genera. El aviso de privacidad sigue en `public/tiliches/privacidad/`
- `/tiliches/garantia/` es una herramienta de la caja (categoría `mexico`, `href` fuera de la raíz en `tools.ts`) con `ToolLayout`, `avisos={false}` y `tituloLargo`. Sin React: el HTML sale calculado con un ejemplo (una compra de hace 12 días, con la fecha del despliegue en la Ciudad de México; el despliegue de cada 3 horas la mantiene al día) y un `<script>` (en `astro:page-load`) recalcula al cargar y al teclear con la fecha del dispositivo. No guarda nada (ni servidor ni `localStorage`), y la página lo dice. Resultados arriba en el teléfono y a la derecha en pantalla ancha. Lógica en `src/lib/garantia.ts` con pruebas en `garantia.test.ts`: fechas ISO contadas como días UTC; garantía en meses de calendario (31 de enero + 1 mes = 28 o 29 de febrero, como la app), devolución en días naturales, mínimo legal de 90 días desde la entrega (art. 77 LFPC)
- La guía cita tal cual el texto vigente de la LFPC en diputados.gob.mx (arts. 77, 78, 79, 83, 84, 92, 51, 56 y 14; última reforma DOF 12-12-2025), la Revista del Consumidor de noviembre de 2025 (p. 19, «no podrá ser inferior a 90 días contados a partir de la entrega») y comunicados de Profeco en gob.mx (tickets, 27-09-2025; Buen Fin, 8 y 9-11-2025; «Cómo presentar mi queja»). gob.mx pone un reto anti-robots: léelas con un navegador. Si cambian, manda la fuente. Dice una sola vez que no es asesoría legal. **Los 30 días para devolver no son ley**: devolver depende de la política de la tienda, salvo los casos del art. 92 y las ventas fuera del establecimiento (art. 56). El Buen Fin 2026 es del 13 al 17 de noviembre (elbuenfin.org); cada año cambia la fecha en la sección y en `buenFin` del frontmatter, y las recomendaciones de Profeco cuando publique las del año
- Reglas de Tiliches: no habla con la tienda ni promete que acepte un reclamo; sus plazos sugeridos (12 meses, 30 días) no son ley. Avisa 30 y 7 días antes de la garantía y 3 antes del último día para devolver. Sin tiendas ni marcas en el texto
- `TILICHES_EN_PLAY` (`src/lib/tiliches.ts`) está en `false` mientras la app esté en revisión: las dos páginas dicen «Muy pronto en Google Play» sin enlace. **Al salir la app, pásala a `true`**: se prenden los botones con `tilichesPlay` (`utm_source=gomflo.dev&utm_medium=web`, `utm_campaign=tiliches|garantia`) y `data-umami-event="play-tiliches"` + `data-umami-event-pagina`, el `installUrl` del JSON-LD de `/tiliches/` y el botón de `/android/`
- Umami: `garantia-calcula`, una vez por visita, sin nada de lo que se escribe
- Rendimiento: la página no usa DM Mono (los campos van sin `font-code` y el sello en Bricolage): son 30 KB menos antes del primer pintado y unos 300 ms menos de LCP en Lighthouse móvil. Lo que más pesa en el LCP de todas las páginas con `Layout.astro` es Bricolage (131 KB, unos 740 ms del LCP simulado); fijar su tamaño óptico la deja en 78 KB, pero cambia la letra de los títulos en todo el sitio: es decisión de diseño, no de una página

### Pastillero en la web (`/pastillero/`)
- Página corta del recordatorio de medicinas para Android (`~/code/pastillero`, en Google Play desde octubre de 2026): solo dice lo que dice su ficha (`docs/TIENDA.md` y `PRODUCT.md` de la app; palabras de búsqueda en `~/code/ventas-pro/aso/pastillero.md`). Usa `Layout.astro`. El aviso de privacidad sigue en `public/pastillero/privacidad/` (estático, enlazado con `data-astro-reload`)
- Reglas: recuerda y registra, no da indicaciones médicas. Nada de efectos en la salud («cuida tu salud»), marcas de medicinas ni «siempre suena» (sin el permiso de alarmas exactas puede llegar hasta 10 min tarde). La sección para cuidadores no aconseja: remite a «consulta a su médico». La app no comparte el registro entre teléfonos; no lo prometas
- Enlaces a Play con `pastilleroPlay(campaign)` de `src/lib/pastillero.ts` (`utm_campaign=pastillero`), con `data-umami-event="play-pastillero"` y `data-umami-event-pagina`. `installUrl` del JSON-LD sin referrer
- Imágenes: las del cajón (`public/img/android/pastillero/`, de `docs/capturas/` de la app) más `captura-N-270.webp` (srcset) e `icono-192.webp`. La imagen para compartir `public/img/pastillero.jpeg` es el gráfico de funciones de la ficha (`docs/tienda/grafico-1024x500-es.png`) a 1200 px de ancho sobre su fondo `#EEF2F6`; `npm run og` no la genera

### Tin Marín en la web (`/tinmarin/`)
- La ruleta de la app para Android (`~/code/tinmarin`) en el navegador, con su identidad (tema Feria; sistema en `~/code/tinmarin/DESIGN.md`): no usa `Layout.astro` ni `global.css`, sino `styles/tinmarin.css` con clases `tm-*`
- El sorteo está portado tal cual de la app: `src/lib/tinmarin/sorteo.ts` (FairDraw: SplitMix64 con BigInt, huella SHA-256), `lista.ts` (ListParser) y `rueda.ts` (WheelLayout, SpinPlan). Un código del teléfono se comprueba en la web y al revés: no cambies nada ahí sin volver a cotejarlo contra el Kotlin de la app (mismo ganador, punto de parada, código y huella)
- Interfaz en `src/components/tinmarin/`: `Rueda.tsx` (canvas, gesto y giro, sin re-render durante el giro), `cara.ts` (la cara de la rueda en un canvas aparte), `Resultado.tsx` (el ganador), `tarjeta.ts` (imagen para compartir), `TinMarin.tsx` (estado en `localStorage` "tinmarin", editor, sorteos y comprobador)
- Lo que se queda en la app (video, varias ruletas, temas, Pro) es la razón para bajarla: la página la enlaza a Google Play. El aviso de privacidad de la app sigue en `public/tinmarin/privacidad/`
- Sonidos de la app en `public/tinmarin/sonidos/`; DM Sans en `public/fonts/dm-sans-100_1000-normal.woff2`
- Plantilla compartida `layouts/TinMarinLayout.astro` (cabeza con SEO e imagen, barra, pie). Guías por uso en `src/pages/tinmarin/<slug>.astro` con `layouts/TinMarinGuia.astro`: la ruleta adentro (`<TinMarin completa={false} />`, sin sorteos ni comprobador, que viven en `/tinmarin/`), guía, app, FAQ y enlaces. El catálogo de guías está en `src/data/tinmarin-guias.ts`; solo describe lo que la herramienta hace
- Imágenes para compartir: `npm run og:tinmarin` (`scripts/og-tinmarin.mjs`, no necesita build) escribe `public/img/tinmarin.jpeg` y `public/img/tinmarin/<slug>.jpeg`. Córrelo al agregar una guía
- Enlaces a Google Play con `playLink(url, campaign)` de `src/lib/play.ts` (agrega `&referrer=` con utm_source=gomflo.dev, utm_medium=web y utm_campaign de la página). En JSON-LD `installUrl` va sin referrer

### Frijolito en la web (`/frijolito/`)
- El cantador de lotería de la app para Android (`~/code/frijolito`) en el navegador, con su identidad (la mesa toma la tinta de la carta, papel crema, Fraunces e Instrument Sans; sistema en `~/code/frijolito/DESIGN.md`): no usa `Layout.astro` ni `global.css`, sino `styles/frijolito.css` con clases `fj-*`. En la web la mesa va 15 % más honda que en la app (`--fondo`) por contraste
- La baraja está portada de la app: `src/lib/frijolito/baraja.ts` (SplitMix64 con BigInt, Fisher-Yates, tablas distintas como `Boards.batch`). La baraja entera se decide al barajar; nada depende del ritmo ni de los toques. Con la misma semilla sale el mismo orden que en el teléfono (cotejado contra el Kotlin)
- Cartas: `src/data/frijolito-cartas.ts` (número, nombre, verso, tinta y texto alternativo; generado desde `cards.xml` y `CardTones.kt` de la app). Ilustraciones de la baraja de feria en `public/frijolito/cartas/NN-slug.webp` (300 px, rejillas y tablas) y `grande/` (480 px, la carta en turno). Fuentes en `public/fonts/fraunces-*.woff2` e `instrument-sans-400_700-normal.woff2` (recortadas de las de la app)
- Interfaz en `src/components/frijolito/`: `Cantador.tsx` (estado en `localStorage` "frijolito", voz con `speechSynthesis` en es-MX/es-US/es, canta solo, cantadas), `Tablas.tsx` (de 1 a 12 tablas y las 54 cartas para recortar, con `window.print()` y `@media print`, una tabla por hoja carta), `Cara.astro`/`Cara.tsx` (la carta), `App.astro` (bloque de la app con capturas en `public/img/frijolito/`), `Faq.astro` y `Paginas.astro`
- Plantilla `layouts/FrijolitoLayout.astro` (cabeza con SEO e imagen, barra, pie) y `layouts/FrijolitoGuia.astro` para las guías por uso (el cantador adentro). Catálogo de páginas en `src/data/frijolito-paginas.ts`
- Estadísticas: `FrijolitoLayout` carga el mismo script de Umami (stats.gomflo.dev, sin cookies) que `Layout.astro`, con los mismos atributos; si cambia en uno, cámbialo en el otro. La regla de "sin analítica" es de la app, no de estas páginas. Cada enlace a Google Play (los de `playLink`: el botón de la barra, `App.astro`, el de `/frijolito/en/` y el de posadas) lleva `data-umami-event="play-frijolito"` y `data-umami-event-pagina` con su `utm_campaign`, para contar clics a Play por página. Un enlace nuevo a Play en estas páginas lleva los dos
- Portada en inglés (en-US) en `src/pages/frijolito/en/index.astro`: habla de la app (sin el cantador web, que está en español), con capturas en inglés en `public/img/frijolito/en/` y `utm_campaign` `frijolito-en`. `FrijolitoLayout` con `lang="en"` pone barra y pie en inglés; `alternos` pone los `hreflang` (es-MX, en-US, x-default → `/frijolito/`), recíprocos entre las dos portadas. No está en `frijolito-paginas.ts`. Las cartas y los versos se quedan en español; nada de "lottery"
- La baraja de posada (Pro en la app) tiene muestras de 300 px en `public/img/frijolito/posada/NN-slug.webp` (de `app/src/main/assets/cards/posada/`), en `/frijolito/loteria-para-posadas/` y una en `/frijolito/en/`. `Cara.astro` acepta `src` y `oscura` (número sobre papel) para dibujarlas
- Rendimiento (LCP < 2.5 s, INP < 200 ms, CLS < 0.1; mide con Lighthouse móvil antes y después): las islas de estas páginas (`Cantador`, `Tablas`) usan `client:afterpaint` (`src/directives/afterpaint.js`, registrada en `astro.config.mjs`), que hidrata ya pintado el primer cuadro y con la isla a la vista, para que React no le compita al título. Las capturas de `App.astro` llevan `srcset` con su copia de 270 px (`-270.webp`) y las fichas de `/frijolito/cartas-de-la-loteria/` (104 px) llevan `srcset` con la copia de 208 px de cada carta (`public/frijolito/cartas/chica/`, `sizes` de `Cara.astro`) y solo las tres primeras sin `loading="lazy"`. Las cartas de `Tablas.tsx` también llevan la de 208 px (`SIZES`, calculado de `.fj-marco`, `.fj-tablas` y `.fj-tabla`: si cambias esas medidas, cámbialo), y al imprimir (botón, Ctrl/Cmd+P y `beforeprint`) pasan a la de 300 px; los botones y el atajo esperan con `img.decode()` a que lleguen antes de `window.print()`, para que el papel no salga borroso; la barra y el favicon usan `icono-96.webp` e `icono-64.png`: `node scripts/frijolito-chicas.mjs` las rehace; córrelo al cambiar una captura, una carta o el icono
- Imágenes para compartir: `npm run og:frijolito` (`scripts/og-frijolito.mjs`, no necesita build) escribe `public/img/frijolito.jpeg`, `public/img/frijolito/<slug>.jpeg` y `public/img/frijolito/en.jpeg`. Las cartas 2, 8, 14, 25, 26, 38 y 42 no van en imágenes para compartir ni en la portada
- Nada de "bingo", "casino", "apuestas", "premios", "sorteo" ni "boletos"; no se nombran otras apps de lotería ni fabricantes, salvo Cantala (cantala.net), del mismo autor, que se recomienda para jugar a distancia (pregunta frecuente de la portada y de `/frijolito/como-jugar-loteria/`; `enlace` en `Faq.astro`) y, en `/frijolito/loteria-para-posadas/`, en una línea para imprimir su lotería navideña, con `utm_source=gomflo.dev&utm_medium=web&utm_campaign=frijolito-<slug>`. El arte es "baraja ilustrada propia" (no "hecha a mano") y las voces de Ramón y Jess son sintéticas. El aviso de privacidad de la app sigue en `public/frijolito/privacidad/`

### Guía de partidos (`/partidos-de-hoy/`)
- Diseño independiente (app deportiva clara/oscura, comparte la preferencia `theme` del sitio): no usa `Layout.astro` ni `global.css`, sino `styles/partidos.css` con clases `mg-*`
- Escudos (`scripts/escudos.mjs`): clubes con el de 500 px de ESPN (API pública por liga, nombres cruzados con alias), selecciones con bandera SVG de flagcdn.com; si nada coincide queda el de 32 px de la guía (sin agrandarlo) y, si no carga, un monograma. Para un club que no salga, agrega su alias en `CLUB_ALIASES`
- Sin filtros ni botón de tema arriba: la búsqueda vive en la barra y el tema (Automático/Claro/Oscuro) en el pie; "Automático" sigue a `prefers-color-scheme`
- `npm run partidos` descarga futbolenvivomexico.com y escribe `src/data/partidos.json` (ignorado en git). Si falla, conserva el archivo anterior; sin archivo la página sale vacía pero el build no se rompe
- El workflow de despliegue corre cada 3 horas (`schedule`) para refrescar la guía; el estado en vivo, el día "hoy" y la zona horaria se calculan en el navegador
- Si la fuente cambia su HTML, el parser está en `scripts/partidos.mjs` y la lógica pura en `src/lib/partidos.ts`

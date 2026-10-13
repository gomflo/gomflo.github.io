# DESIGN.md

Plan de diseño de gomflo.dev, escrito con el flujo de `/awwwards` (brief, concepto, sistema).
Si algo del sitio contradice este documento, gana el documento o se corrige el documento.

## Brief

- **Sujeto:** gomflo.dev, el sitio de Víctor Hugo Gómez Flores: 24 herramientas pequeñas en
  español (texto, código, generadores, dinero y plazos en México, conversores), dos páginas
  satélite y tres apps para Mac (Susurro, Destello, Brinco).
- **Audiencia:** gente que llega de un buscador con una tarea ("validar CLABE", "formatear
  JSON") y desarrolladores que vuelven. Hablan español de México.
- **Trabajo del sitio:** que la tarea se resuelva en segundos y que el visitante recuerde dónde
  fue. La herramienta siempre va arriba del pliegue.
- **Restricciones:** Astro 5 + React 19 + Tailwind 4, estático en GitHub Pages, tema claro y
  oscuro, `trailingSlash: 'always'`, SEO existente (títulos, descripciones, FAQ, JSON-LD).
- **Fuera de alcance:** `/partidos-de-hoy/` (identidad propia) y las páginas estáticas de
  `public/` (Papelito, Frijolito, Tinmarín).

## Historia

La primera versión de este rediseño fue "Rótulo" (una tlapalería con la fachada pintada a mano).
Se descartó: ni el concepto ni la paleta amarillo/rojo/azul eran lo que se buscaba. De tres
propuestas nuevas (Instrumento, Índice nocturno, Bloques) se eligió **Bloques**.

## Tarjeta de concepto

```
Idea:        gomflo.dev es una caja de piezas: cada herramienta es un bloque de color
             que ya está funcionando en miniatura antes de abrirlo.
Firma:       La mesa de pruebas. Lo que escribes en la portada pasa en vivo por las
             24 piezas: una lo cuenta, otra lo pasa a morse, otra saca su hash, otra
             le asigna un color.
Color:       El color es la categoría, en todos lados: en la caja, en la cabeza de la
             herramienta, en sus resaltados y en el cambio de página.
Movimiento:  Piezas que caen en su lugar con rebote, se levantan y giran un poco al
             apuntarlas. Entre páginas, el color de la pieza que tocaste llena la
             pantalla desde ese punto y se encoge hasta ser la cabeza de la página nueva.
Emoción:     Curiosidad de caja de juguetes; se antoja tocar.
Captura:     El bloque oscuro del título junto a la mesa blanca, y debajo las filas de
             piezas de colores con su línea de resultado.
```

Reglas que salen del concepto:

- **Todo es un bloque.** Título, mesa, categorías, piezas, apps, preguntas y pie son bloques
  de esquinas redondas separados por el mismo hueco (`--hueco`). No hay renglones ni reglas.
- **Tres tipos de bloque:** relleno de color (pieza), relleno oscuro (título, pie) y contorno
  de tinta de 2 px sin relleno o en blanco (mesa, cabeza de categoría, panel de trabajo).
- **Sin sombras ni degradados.** La profundidad la da el movimiento, no el efecto.
- **Copy:** directo y en minúsculas donde es etiqueta. Las herramientas son "piezas" y el
  conjunto es "la caja". Sin rayas largas en texto visible.

## Sistema

### Paleta

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--crema` | `#fbf2e1` | `#131120` | La mesa (fondo) |
| `--panel` | `#ffffff` | `#1c1930` | Panel de trabajo, mesa de pruebas, apps |
| `--tinta` | `#1c1a2e` | `#f8f0dd` | Texto y contornos |
| `--bloque-oscuro` | `#1c1a2e` | `#25223b` | Título de portada, pie, 404 |
| `--menta` | `#96e6c1` | igual | Categoría texto |
| `--coral` | `#ff8767` | igual | Categoría código y datos |
| `--lila` | `#b8a6ff` | igual | Categoría generadores |
| `--sol` | `#ffcf4a` | igual | Categoría dinero y plazos en México |
| `--cielo` | `#8ecbff` | igual | Categoría conversores |
| `--acento` | `#4a2fd0` | `#b8a6ff` | Foco, texto de acento, controles |

Sobre una pieza de color el texto siempre es `--tinta-fija` (no cambia de noche).
`--pieza` es el color en turno: lo fija `[data-cat="<categoría>"]` y lo usan las clases
`bg-pieza`, `.enlace`, `.btn-pieza` y los resaltados de cada herramienta.

### Tipografía

- **Bricolage Grotesque** variable (peso 200 a 800, ancho 75 a 100): titulares con `.titular`
  (800, ancho 90 %, interletra -0.015em) y texto.
- **DM Mono** (400 y 500): etiquetas (`.etiqueta`), código y la línea en vivo de cada pieza.
- Escala: `--t-xl`, `--t-l`, `--t-m`, `--t-body`, `--t-s`, `--t-xs`.

### Retícula y forma

- `.contenedor` (máx. 82rem) y `.reticula` de 12 columnas.
- La caja de piezas es una sola retícula de 4 columnas (3, 2 y 1 al estrecharse). Las secciones
  y listas son `display: contents`, así la cabeza de cada categoría es un bloque más: ocupa dos
  celdas con 6 piezas y una con 3, para que cada categoría cierre sus filas.
- Radios: `--radio-pieza` para bloques, `--radius` (0.75rem) para controles.

### Movimiento

- GSAP para las entradas (`data-entra`, por lotes con IntersectionObserver) y el color entre
  páginas (`src/engine/transition.ts`). Sin scroll suavizado ni loader.
- Los bloques de portada entran con CSS (`.entra`, sin opacidad) para no retrasar el LCP.
- En reposo solo se mueve el reloj de la pieza de timestamp. Las páginas de herramienta están
  quietas: ahí se trabaja.
- `prefers-reduced-motion`: todo visible, sin caídas, y el cambio de página es un fundido corto.

## Mantenimiento

- Una herramienta nueva necesita su línea en `SALIDAS` de `src/motion/piezas.ts` (qué muestra
  la pieza con el texto de la mesa). Sin ella la línea queda vacía.
- Una categoría nueva necesita su color en `[data-cat]` (`global.css`) y en `COLORES` de
  `scripts/og-images.mjs`. Si no tiene 3 o 6 piezas, revisar cuántas celdas ocupa su cabeza
  (`Piezas.astro`).
- Tras cambiar títulos o agregar páginas: `npm run build && npm run og`.

# "El cajón": apps para Android de gomflo

Ruta: `/android/`. Hecha con el proceso del skill `/awwwards`
(brief, concepto, sistema, construcción, QA). Archivos:

- `src/pages/android.astro`
- `src/components/android/` (`contenido.ts`, `Bandeja.astro`, `Cajon.astro`)
- `src/styles/android.css`
- `src/motion/android.ts`
- `public/fonts/archivo-100_900-normal.woff2` (Archivo variable, OFL)

## Brief

- **Sujeto:** diez apps nativas de Android (Kotlin + Compose) de Víctor Hugo Gómez Flores:
  Quincena, Guardadito, Canica, Tiliches, Pastillero, Coperacha, Boletito, Papelito, Tin Marín
  y Frijolito. Sin anuncios, sin cuenta, sin servidor. 7 de 10 no piden permiso de internet;
  Papelito, Tin Marín y Frijolito lo traen con la librería de compras de Play y no hacen
  llamadas propias. Gratis; todas menos Boletito tienen (o tendrán) un Pro de pago único.
- **Audiencia:** gente en México con un pendiente cotidiano: la quincena, la rifa, el
  intercambio, las medicinas de la mamá. No buscan "apps", buscan resolver eso.
- **Trabajo de la página:** que en 3 segundos se entienda qué son, que cada app se reconozca
  por lo que reemplaza, y que la promesa de privacidad se crea. Solo Tin Marín está en Google
  Play: el botón de tienda es "Muy pronto" y solo se vuelve enlace si `play` tiene URL.
- **Restricciones:** Astro 5, estático, `trailingSlash: 'always'`, claro y oscuro,
  `prefers-reduced-motion`, sin tocar `Layout.astro`, `global.css`, `index.astro` ni el motor.
- **Supuestos:** no se publica ningún precio (ninguno está fijo). El copy sale de `PRODUCT.md`
  de cada app; nada se inventó.

## Concepto

Tres territorios:

| | Idea | Ancla | Firma | O / F / Fe / P |
|---|---|---|---|---|
| **A. Lugar y cultura: El cajón** | Lo que guardabas en el cajón de la cocina (sobres, tickets, el talonario, el pastillero, la baraja) ahora vive en el teléfono, y de ahí no sale | cada app es la versión de un objeto doméstico mexicano (y una de ellas se llama Tiliches) | la bandeja de un cajón abierto, vista desde arriba: cada app es un objeto suelto que se recorre cuando inclinas el cajón | 4 / 5 / 4 / 2 |
| B. Formal: un teléfono, diez pantallas | Un teléfono fijo al centro que cambia de app y de color de fondo con el scroll | son apps | el color de toda la página cambia por app | 2 / 3 / 5 / 5 |
| C. Proceso: el calendario mexicano | Cada app es un momento del año (quincena, posada, kermés, fiestas patrias) | varias apps son de temporada | un año que se recorre con el scroll | 3 / 3 / 3 / 3 |

**Elegido: A.** Es la única que no se puede mover a otra marca: el cajón explica la privacidad
("lo tuyo se queda en tu cajón"), da la retícula (un organizador de compartimentos) y conserva
la metáfora propia de cada app. De C se toma un detalle: los grupos se nombran por el momento de
uso ("Para que alcance la quincena").

```
Idea:        Lo que guardabas en el cajón de la cocina, ahora en tu teléfono, y de ahí no sale.
Metáfora:    Un organizador de cajón: marco de mueble, divisores, compartimentos hundidos,
             jaladera. Las apps son los objetos sueltos adentro.
Firma:       La bandeja de la portada. El cajón se jala desde abajo y, al topar, lo de
             adentro sigue de largo y regresa. Al mover el cursor (o al deslizar en el
             teléfono) el cajón se inclina y cada app se recorre en su compartimento según
             su masa. Receta: driver module (patterns.md) con entrada en reposo (motion.md).
Emoción:     Reconocimiento doméstico: "ese es mi cajón". Curiosidad de tocar.
Movimiento:  Deslizar y topar, como un cajón en su riel. Lo pesado tarda, lo ligero se pasa.
Captura:     La bandeja negra con diez apps chuecas en compartimentos blancos de distinto
             tamaño, junto al titular "Lo que guardabas en el cajón, ahora en tu teléfono."
```

El concepto llega al pie: cada app es un cajón de una cómoda (frente del color de la app con su
nombre como rótulo y su jaladera; adentro, sus capturas tiradas en el fondo) y el pie es el
frente de un cajón cerrado con "Muy pronto en Google Play".

**Identidad propia (no `Layout.astro`).** Las apps traen diez colores que no son los cinco de
"Bloques" y cada una tiene su metáfora; dentro de la caja de piezas del sitio quedarían como
herramientas. El cajón es un mueble neutro que deja que cada app ponga su color. Igual que
`/partidos-de-hoy/`: CSS propio, comparte la preferencia `theme` y enlaza a gomflo.dev. Sí usa
el motor (`src/engine`: `boot`, `onPage`, `onScroll`, `ease`) sin ClientRouter.

## Sistema

### Paleta

| Rol | Claro | Oscuro | Uso |
|---|---|---|---|
| `--suelo` | `#e8e9eb` | `#121316` | la cubierta de formica (fondo) |
| `--tinta` | `#121417` | `#eef0f2` | texto, contornos, botón |
| `--gris` | `#565b62` | `#a5abb3` | texto secundario (AA sobre suelo y hueco) |
| `--mueble` | `#17191c` | `#2a2d33` | marco del cajón, pie |
| `--divisor` | `#cdd1d6` | `#0b0c0e` | divisores del organizador |
| `--hueco` | `#f7f7f8` | `#24272c` | fondo de cada compartimento |
| `--app` | color de cada app | igual | frente del cajón, viñetas, punto de "muy pronto" |

Sobre el frente, la tinta se elige por contraste (`tintaSobre()` en `contenido.ts`): blanco o
casi negro, el que pase más. No hay acento global: el acento es la app en turno.

### Tipo

- **Archivo** variable (peso 100 a 900, ancho 62 a 125 %), una familia con dos personalidades.
  "Archivo" es también el mueble de cajones: el nombre cuenta.
- Rótulos de cajón: 900, ancho 125 %, interletra -0.045em, interlínea 0.88, `9.6cqi` del frente.
- Titulares: 820, ancho 108 a 110 %, -0.04em, 0.93 a 0.95.
- Texto 16 a 18 px, 1.55. Etiquetas 13 a 14 px, ancho 92 %, peso 600, en minúscula de oración.
- Escala: `--t-mega` `--t-xl` `--t-l` `--t-m` `--t-body` `--t-s` `--t-xs` (fluida, saltos grandes).

### Retícula y forma

- `.marco` máx. 90rem, 12 columnas, margen `clamp(1rem, 3.2vw, 2.75rem)`.
- Líneas fuertes: columna 1 (titulares), columna 6 (bandeja, lead de la promesa), columna 8
  (texto de los cajones impares). Los cajones alternan el lado de las capturas.
- Radios concéntricos: `--r-mueble = --r-divisor + --marco`, `--r-divisor = --r-hueco + 10px`.
- Profundidad: sombra dura sin desenfoque (`0 5px 0`, `0 10px 0`) y huecos hundidos con sombra
  interior dura. Sin degradados, sin vidrio.
- Ritmo: portada a pantalla completa, promesa aireada, grupos con aire arriba y cajones juntos
  como una cómoda, "Hechas" muy aireada, pie pegado al borde.

### Movimiento

- Curvas del motor: `expo.out` para entrar, `power3.out` para responder.
- **Conductor único** (`src/motion/android.ts`): la inclinación del cajón (x, y). La
  alimentan el puntero, la velocidad del scroll en táctil, una deriva lenta en reposo y el
  `tope` de la entrada. Cada objeto es un resorte con masa y holgura medida contra las paredes
  de su compartimento y el nombre escrito en el fondo. Corre en `gsap.ticker`, se pausa fuera
  de pantalla y no corre con movimiento reducido.
- **Cajones de la cómoda:** al llegar, el interior se desliza fuera del frente (`clip-path` +
  `y`) y las capturas llegan un poco después, girando a su lugar.
- **Respuestas (una por papel):** compartimentos: el objeto se endereza, se levanta y su sombra
  crece ("sacarlo del cajón"); botón principal: la etiqueta corre en su riel y el botón se
  levanta; navegación y marca: subrayado que corre; enlaces de utilidad: el subrayado engrosa.
  La tienda, cuando tenga URL, se llena del color de la app desde abajo.
- La barra se hace a un lado al bajar y regresa al subir.
- Reducido: nada se mueve, todo visible, los estados siguen (enderezar, subrayar).

### Composición

```
PORTADA (par asimétrico)               PROMESA (declaración + datos)
| etiqueta            |  bandeja    |  | Lo que anotas se queda   |
| LO QUE GUARDABAS    |  q q g t t  |  | en el cajón.             |
| EN EL CAJÓN...      |  c o p p b  |  |          lead (col 6-11) |
| lead     [Abre el   |  m o f l b  |  | Sin    | Sin   | Sin  | 7 de 10 |
|  cajón]  · pronto   |  ═ jaladera |

GRUPO (cartel)                          CAJÓN (frente + interior, alterna lado)
| 3 cajones                         |  | [icono] QUINCENA          ═══ |
| PARA QUE ALCANCE      lead (9-12) |  | ▯ ▯ ▯ capturas | Antes: ...  |
| LA QUINCENA                       |  |                | frase, puntos, tienda |

HECHAS (par)                            PIE (cajón cerrado)
| Hechas una  |   texto (7-12)      |  | MUY PRONTO EN GOOGLE PLAY.   |
| por una.    |                     |  |          ═══                 |
                                       | privacidad | gomflo | ©    |
```

Teléfono (390 px): bandeja de 3 columnas y 5 filas (Coperacha y Boletito siguen siendo largos),
capturas en fila con scroll horizontal y `scroll-snap`, rótulos a `10.8cqi`, la jaladera del
frente baja al borde. La firma se adapta: el cajón se inclina con el jalón del scroll.

### Prueba de lo genérico

- "Un teléfono al centro que cambia de color" era la respuesta genérica: descartada (B).
- La cuadrícula de íconos parecía pantalla de inicio: se volvió organizador de cajón (marco,
  divisores, compartimentos de distinto tamaño, objetos chuecos que se recorren).
- Las tarjetas de app iguales se volvieron cajones de una cómoda, con el nombre como rótulo
  gigante y la línea "Antes: ..." que dice qué objeto reemplaza cada app.
- Sin eyebrow sobre cada título: solo "3 cajones" en los grupos, que es información real.

## QA

Revisado sobre el build (`npx astro build --outDir /tmp/build-awwwards`, servido en 4334), con
los scripts del skill (`shoot.mjs`, `audit.mjs`) y capturas propias en `/tmp/capturas-awwwards/`.

Resultado de la última pasada:

- audit: 0 FAIL en esta página (los FAIL del rastreo son de `/*/privacidad/`, páginas que ya
  existían). Único WARN: falta `og:image`.
- Sin errores de consola ni peticiones fallidas. Sin desbordamiento horizontal a 1440 ni a 390.
- LCP: el `h1`. Escritorio 36 ms; teléfono con CPU 4x y 4G lento 1.08 s. CLS 0 y 0.031.
- Scroll a 60 fps en escritorio y en teléfono. `idleMotion: true` (la deriva del cajón).
- axe: 0 violaciones. Foco visible en todas las paradas. `skipLinkFirst` sale falso porque el
  detector busca "skip" o "#main" (en inglés); el primer tabulador sí es "Ir al contenido".
- `noHoverChange` vacío. `colorOnly` solo marca el aviso de privacidad, que es un enlace de
  utilidad y a propósito solo cambia de color.
- Movimiento reducido: `hiddenText: 0`. No hay objetivos táctiles chicos.

### Puntuación (dos críticos externos, cada uno nuevo, que solo vieron capturas y reportes)

| | Pasada 1 | Pasada 2 |
|---|---|---|
| Diseño (40 %) | 7 | 7 |
| Usabilidad (30 %) | 7 | 7.5 |
| Creatividad (20 %) | 7 | 7 |
| Contenido (10 %) | 8 | 7.5 |
| **Ponderado** | **7.1** | **7.2** |
| Semántica/SEO | 7 | 7 |
| Animación | 7 | 7.5 |
| Accesibilidad | 8 | 7.5 |
| WPO | 8 | 8 |
| Responsivo | 7 | 7.5 |
| Markup/meta | 6 | 6.5 |

En las dos pasadas, la idea que leyó el crítico coincide con la tarjeta.

Cambios hechos a partir de los críticos: descendentes del rótulo separados del subtítulo;
tres composiciones de cajón (fila, abanico, a lo ancho) en lugar de una; "Muy pronto" pasó de
caja punteada a etiqueta de estado; la entrada pasó de fundido a cajón que se jala y topa; el
texto de ayuda dice lo mismo con cursor o con dedo y entra con el cajón; los compartimentos
altos muestran para qué sirve la app; "Gratis, con Pro de pago único" se dice una vez (en
"Hechas") y Boletito marca su excepción; aviso "Desliza" en las capturas del teléfono; la
jaladera del pie quedó a la derecha, como en los frentes; más área táctil en el enlace en línea.

No se volvió a pedir puntuación después del último lote (el encargo pedía corregir en un lote y
confirmar una vez). Lo que más la subiría:

1. `og:image` de 1200×630 con la bandeja (sube Markup y SEO).
2. Variar más el interior de cada cajón según su metáfora (talón de boleto para Boletito,
   etiqueta colgada para Tiliches) en vez de tres composiciones compartidas.
3. Capturas en AVIF con `srcset` (hoy 1.17 MB de imágenes en la página).

### Pendientes y supuestos

- Solo Tin Marín tiene `play` (publicada en octubre de 2026); las demás dicen "Muy pronto en
  Google Play". Con URL, `Cajon.astro` pinta un enlace "Bájala en Google Play" que se llena del
  color de la app, y la portada y el pie nombran las publicadas.
- Con `web` (hoy solo Tin Marín, `/tinmarin/`) el cajón suma el enlace "Úsala en la web".
- Papelito y Boletito no tienen aviso de privacidad publicado; no se enlaza nada para ellas.
- No hay 404 propio: es una sola página dentro de gomflo.dev, que ya tiene el suyo.
- Las capturas de Tin Marín se corrigieron durante el trabajo; ya se usan las tres.

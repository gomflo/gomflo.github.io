// Las páginas de Frijolito en la web (src/pages/frijolito/). De aquí salen los enlaces entre ellas y las
// imágenes para compartir (scripts/og-frijolito.mjs, que lee slug, nombre, titulo y cartas en ese orden).
// Las cartas de las imágenes no pueden ser la 2, 8, 14, 25, 26, 38 ni 42.

export type Pagina = {
  /** Ruta bajo /frijolito/; vacío es la portada. */
  slug: string;
  /** Título del enlace. */
  nombre: string;
  /** Titular de la imagen para compartir. */
  titulo: string;
  /** Tres cartas para la imagen para compartir. */
  cartas: [number, number, number];
  /** Una línea de qué hay ahí, para la tarjeta del enlace. */
  resumen: string;
};

export const paginas: Pagina[] = [
  {
    slug: "",
    nombre: "El cantador",
    titulo: "Cantador de lotería mexicana",
    cartas: [1, 23, 27],
    resumen: "Baraja las 54 cartas y cántalas con su verso en voz alta, desde el navegador.",
  },
  {
    slug: "cartas-de-la-loteria",
    nombre: "Las 54 cartas y sus versos",
    titulo: "Las 54 cartas de la lotería y sus versos",
    cartas: [6, 35, 46],
    resumen: "Cada carta con su número, su nombre, su verso y su ilustración, de El Gallo a La Rana.",
  },
  {
    slug: "tablas-de-loteria-para-imprimir",
    nombre: "Tablas para imprimir",
    titulo: "Tablas de lotería para imprimir",
    cartas: [39, 54, 41],
    resumen: "De 1 a 12 tablas de 4 × 4, distintas entre sí, listas para la impresora. Y las cartas para recortar.",
  },
  {
    slug: "como-jugar-loteria",
    nombre: "Cómo se juega",
    titulo: "Cómo jugar lotería mexicana",
    cartas: [24, 21, 43],
    resumen: "El cantador, las tablas, los frijolitos y las formas de ganar: línea, esquinas, pozo y tabla llena.",
  },
  {
    slug: "loteria-para-posadas",
    nombre: "Lotería para posadas",
    titulo: "Lotería para la posada",
    cartas: [35, 29, 47],
    resumen: "Todo para la lotería de diciembre: quién canta, cuántas tablas imprimir y cómo jugar en grupo grande.",
  },
  {
    slug: "loteria-en-el-salon",
    nombre: "Lotería en el salón",
    titulo: "Lotería en el salón de clases",
    cartas: [37, 10, 30],
    resumen: "Para docentes: vocabulario, lectura en voz alta con los versos y una partida para Día de Muertos.",
  },
];

export const ruta = (p: Pick<Pagina, "slug">) => (p.slug ? `/frijolito/${p.slug}/` : "/frijolito/");

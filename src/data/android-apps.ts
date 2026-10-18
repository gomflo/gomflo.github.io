// Las apps para Android. Cada una vive en su propio repositorio en ~/code/<slug>.
// Imágenes en public/img/android/<slug>/: icono.png (256 px, cuadrado sin máscara)
// y captura-1..3.webp (540 px de ancho, pantalla completa del teléfono).
// Sin `play` la app sale como "muy pronto"; con la URL de su ficha, el botón se vuelve enlace.

import { GUARDADITO_EN_PLAY, GUARDADITO_PLAY } from "../lib/guardadito";
import { PASTILLERO_PLAY } from "../lib/pastillero";

export type AndroidApp = {
  slug: string;
  name: string;
  /** Lo que es, en pocas palabras. */
  tagline: string;
  /** Una o dos frases para la tarjeta. */
  desc: string;
  /** Tres cosas que hace, cortas. */
  points: [string, string, string];
  /** La imagen con la que se piensa la app. */
  metaphor: string;
  /** Color principal del icono. */
  color: string;
  group: "dinero" | "juntos" | "casa";
  play?: string;
  /** Versión web de la app, si la tiene. */
  web?: string;
  /** Página de la app en gomflo.dev, si la tiene (sin versión web). */
  pagina?: string;
  privacy?: string;
};

export const androidApps: AndroidApp[] = [
  {
    slug: "quincena",
    name: "Quincena",
    tagline: "Tu dinero hasta la próxima quincena",
    desc: "Gastos diarios, tarjetas de crédito y compras a meses sin intereses. Te dice cuánto te queda libre, cuánto pagar de cada tarjeta y cuándo terminas tus meses.",
    points: ["Cuánto te queda libre hoy", "Corte y fecha límite de cada tarjeta", "La escalera de tus meses sin intereses"],
    metaphor: "Muros de color liso con sombra dura; las mensualidades bajan como una escalera",
    color: "#DE0074",
    group: "dinero",
  },
  {
    slug: "guardadito",
    name: "Guardadito",
    tagline: "Presupuesto por sobres",
    desc: "Cuando llega la quincena repartes el dinero en sobres: comida, renta, transporte, salidas y el guardadito. Cada gasto sale de un sobre y siempre sabes cuánto te queda.",
    points: ["Reparte la quincena en sobres", "Gasto rápido de un toque", "Metas para tu guardadito"],
    metaphor: "Cada sobre es un vaso de agua fresca con el agua al nivel de lo que le queda",
    color: "#1B2440",
    group: "dinero",
    privacy: "/guardadito/privacidad/",
    // En revisión en Play: se prende con GUARDADITO_EN_PLAY (src/lib/guardadito.ts).
    ...(GUARDADITO_EN_PLAY ? { play: GUARDADITO_PLAY } : {}),
  },
  {
    slug: "canica",
    name: "Canica",
    tagline: "Tus suscripciones en un frasco",
    desc: "Cada suscripción es una canica del tamaño de lo que cuesta al mes. Ves cuánto se te va, cuál pesa más y cuándo viene el próximo cobro, y te avisa antes de cada cargo.",
    points: ["Una canica por suscripción", "Aviso antes de cada cobro y de cada prueba gratis", "29 servicios comunes en México"],
    metaphor: "Canicas de vidrio que ruedan en un frasco al inclinar el teléfono",
    color: "#13B5A6",
    group: "dinero",
    privacy: "/canica/privacidad/",
  },
  {
    slug: "tiliches",
    name: "Tiliches",
    tagline: "Garantías y comprobantes de compra",
    desc: "Cada cosa que compras es una etiqueta colgada en la pared, con su ticket y su número de serie. Te avisa antes de que se venza la garantía o el plazo para devolverla.",
    points: ["Ticket, serie y garantía de cada cosa", "Aviso antes de que venza", "La nota para reclamar, ya armada"],
    metaphor: "Etiquetas de cartón colgadas de un riel que se mecen",
    color: "#2B4A42",
    group: "casa",
    privacy: "/tiliches/privacidad/",
  },
  {
    slug: "pastillero",
    name: "Pastillero",
    tagline: "Medicinas de toda la familia",
    desc: "Avisa a la hora exacta de cada toma, para ti o para quien cuidas, y lleva el registro de lo que se tomó. No sustituye las indicaciones del médico.",
    points: ["Alarma a la hora de cada toma", "Para ti, tu mamá o tus hijos", "Registro y reporte en PDF"],
    metaphor: "Un pastillero de plástico translúcido con un compartimento por hora",
    color: "#2A60DA",
    group: "casa",
    play: PASTILLERO_PLAY,
    pagina: "/pastillero/",
    privacy: "/pastillero/privacidad/",
  },
  {
    slug: "coperacha",
    name: "Coperacha",
    tagline: "Divide la cuenta entre amigos",
    desc: "Le tomas foto al ticket, los renglones salen solos, tocas quién pidió cada cosa, se suma la propina y cada quien ve cuánto le toca. El resumen va directo al grupo.",
    points: ["Lee el ticket con la cámara", "Cada quien con su ficha de color", "Propina y resumen para WhatsApp"],
    metaphor: "Un ticket que se imprime renglón por renglón",
    color: "#C73A30",
    group: "juntos",
    privacy: "/coperacha/privacidad/",
  },
  {
    slug: "boletito",
    name: "Boletito",
    tagline: "El talonario de tu rifa",
    desc: "Armas el talonario, apartas cada número a nombre de quien lo pidió, sellas los que ya pagaron y mandas el tablero al grupo.",
    points: ["De 10 a 1000 números", "Apartados, pagados y por cobrar", "El tablero en imagen para el grupo"],
    metaphor: "Un boleto de rifa con talón, sellos de pagado",
    color: "#0A0A0F",
    group: "juntos",
  },
  {
    slug: "papelito",
    name: "Papelito",
    tagline: "El sorteo del intercambio de regalos",
    desc: "Anotas quiénes entran, sorteas y cada quien recibe su papelito en secreto: desdoblándolo en el teléfono o por un enlace que le mandas por mensaje.",
    points: ["Nadie se saca a sí mismo", "Reglas de quién no se toca", "Papelitos secretos por mensaje"],
    metaphor: "Papelitos doblados que se desdoblan, papel de envoltura",
    color: "#F6C445",
    group: "juntos",
  },
  {
    slug: "tinmarin",
    name: "Tin Marín",
    tagline: "Ruleta de nombres y sorteos",
    desc: "Pegas una lista, giras y sale un ganador. Cada sorteo queda con fecha, hora y un código para comprobarlo, y se manda como video al grupo.",
    points: ["Pega hasta 10,000 nombres", "Sorteos que se pueden comprobar", "Video del giro para compartir"],
    metaphor: "Una ruleta de colores que gira con el dedo",
    color: "#FF3D2E",
    group: "juntos",
    play: "https://play.google.com/store/apps/details?id=com.gomflo.tinmarin",
    web: "/tinmarin/",
    privacy: "/tinmarin/privacidad/",
  },
  {
    slug: "frijolito",
    name: "Frijolito",
    tagline: "El cantador de lotería",
    desc: "Baraja las 54 cartas, las canta en voz alta con su verso y lleva la cuenta de las que ya salieron. Con baraja ilustrada propia y tablas para jugar o imprimir.",
    points: ["Canta las 54 cartas con su verso", "Baraja ilustrada propia", "Tablas en el teléfono o impresas"],
    metaphor: "Cartas de lotería sobre la mesa, el cantador",
    color: "#1D2D76",
    group: "juntos",
    play: "https://play.google.com/store/apps/details?id=com.gomflo.frijolito",
    web: "/frijolito/",
    privacy: "/frijolito/privacidad/",
  },
];

/** Lo que todas comparten. */
export const promesas = [
  "Sin anuncios",
  "Sin cuenta",
  "Sin servidor",
  "Tus datos se quedan en el teléfono",
];

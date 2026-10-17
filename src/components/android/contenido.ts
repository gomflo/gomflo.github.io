// Copy y datos de "El cajón" (/android/).
// El catálogo vive en src/data/android-apps.ts; aquí solo va lo que esta página agrega:
// el objeto que cada app reemplaza, la frase de su cajón, las capturas que se muestran y
// los números de la física de la bandeja. Todo sale de PRODUCT.md de cada app.
// Supuestos: ningún precio se publica (ninguno está fijo); Boletito no tiene Pro decidido.
import { androidApps, type AndroidApp } from "../../data/android-apps";

export type Extra = {
  /** Lo que antes vivía en el cajón de la casa. */
  objeto: string;
  /** La frase grande de su cajón. */
  frase: string;
  /** Un párrafo más, con datos que la app de verdad tiene. */
  detalle: string;
  /** Capturas que se enseñan (de public/img/android/<slug>/) con su texto alternativo. */
  capturas: { n: 1 | 2 | 3; alt: string }[];
  /** "sin-permiso": el manifiesto no trae INTERNET. "sin-llamadas": lo trae la librería de Play. */
  red: "sin-permiso" | "sin-llamadas";
  pro: boolean;
  aviso?: string;
  categoria: string;
  /** Cómo quedan las capturas en el fondo del cajón: en fila, en abanico o a lo ancho. */
  forma: "fila" | "abanico" | "ancho";
  /** Física de la bandeja: masa (0.6 ligera a 1.4 pesada) y giro de reposo en grados. */
  masa: number;
  giro: number;
};

export const extras: Record<string, Extra> = {
  quincena: {
    objeto: "La cuenta que llevabas en la cabeza",
    frase: "Cuánto te queda libre hasta el día de pago, y cuánto es eso por día.",
    detalle:
      "Cada tarjeta con su corte y su fecha límite. Cada compra a meses es un peldaño de la escalera que baja hasta tu mes de libertad. No es un banco: no presta dinero ni calcula intereses.",
    capturas: [
      { n: 1, alt: "Pantalla Hoy de Quincena: 4,502 pesos libres hasta la quincena, 1,125 por día" },
      { n: 2, alt: "La escalera de compras a meses de Quincena, que termina en octubre de 2027" },
      { n: 3, alt: "Tarjetas en Quincena: lo que hay que pagar de cada una para no generar intereses" },
    ],
    red: "sin-permiso",
    pro: true,
    categoria: "FinanceApplication",
    forma: "fila",
    masa: 1.2,
    giro: -4,
  },
  guardadito: {
    objeto: "Los sobres de la quincena",
    frase: "Cada sobre es un vaso de agua fresca: el nivel es lo que te queda.",
    detalle:
      "Cuando llega la quincena repartes en sobres (comida, renta, transporte, salidas) y cada gasto sale de uno, con el monto y un toque. Al cierre, lo que sobró se va al guardadito.",
    capturas: [
      { n: 1, alt: "Los sobres de Guardadito dibujados como vasos de agua fresca, cada uno con lo que le queda" },
      { n: 2, alt: "Anotar un gasto en Guardadito: el monto y el sobre de donde sale" },
      { n: 3, alt: "Metas de Guardadito: cuánto apartar por quincena para llegar a la tele" },
    ],
    red: "sin-permiso",
    pro: true,
    categoria: "FinanceApplication",
    forma: "fila",
    masa: 0.9,
    giro: 6,
  },
  canica: {
    objeto: "El frasco de canicas",
    frase: "Cada suscripción es una canica del tamaño de lo que te cuesta al mes.",
    detalle:
      "Inclinas el teléfono y las canicas ruedan. Arriba, cuánto se te va al mes y al año; abajo, el orden en que te cobran. Te avisa antes de cada cargo y dos días antes de que acabe una prueba gratis.",
    capturas: [
      { n: 1, alt: "El frasco de Canica con una canica por suscripción y el total al mes" },
      { n: 2, alt: "Detalle de Netflix en Canica: cuánto cuesta al mes, al año y en cinco años" },
      { n: 3, alt: "Calendario de Canica con los cobros del mes" },
    ],
    red: "sin-permiso",
    pro: true,
    categoria: "FinanceApplication",
    forma: "fila",
    masa: 1.4,
    giro: -9,
  },
  tiliches: {
    objeto: "Los tickets de la garantía",
    frase: "Junta tus tiliches: cada compra es una etiqueta con su ticket.",
    detalle:
      "La tienda, el precio, el número de serie y la foto del ticket, a dos toques. Te avisa 30 y 7 días antes de que venza la garantía y, si algo falla, arma la nota para reclamar. Ni siquiera pide permiso de cámara.",
    capturas: [
      { n: 1, alt: "La pared de Tiliches: etiquetas de cartón con lo que está en garantía" },
      { n: 2, alt: "La nota para reclamar de Tiliches con los datos de la compra" },
      { n: 3, alt: "Tiliches pregunta si te avisa antes de que venza una garantía" },
    ],
    red: "sin-permiso",
    pro: true,
    categoria: "UtilitiesApplication",
    forma: "abanico",
    masa: 0.7,
    giro: 3,
  },
  pastillero: {
    objeto: "El pastillero de la cocina",
    frase: "Una alarma a la hora exacta de cada toma, para ti o para quien cuidas.",
    detalle:
      "El día se ve como un pastillero de plástico, con un compartimento por hora. Al marcar Tomada, la pastilla sale y el compartimento se cierra. Con la pantalla bloqueada solo dice «Hora de una medicina».",
    aviso: "No sustituye las indicaciones del médico.",
    capturas: [
      { n: 1, alt: "El pastillero del día en Pastillero, con un compartimento por hora" },
      { n: 2, alt: "Notificaciones de Pastillero con los botones Tomada y Posponer 10 minutos" },
      { n: 3, alt: "Racha de tomas y reporte en PDF para el médico en Pastillero" },
    ],
    red: "sin-permiso",
    pro: true,
    categoria: "HealthApplication",
    forma: "abanico",
    masa: 1.1,
    giro: -2,
  },
  coperacha: {
    objeto: "El ticket del restaurante",
    frase: "Foto al ticket, cada quien toca lo suyo y la suma cuadra al centavo.",
    detalle:
      "El ticket se lee en el teléfono, sin mandarlo a ningún lado. La propina se reparte según lo que pidió cada quien y el resumen va directo al grupo de WhatsApp.",
    capturas: [
      { n: 1, alt: "Ticket de una taquería en Coperacha con cada platillo asignado a una persona" },
      { n: 2, alt: "Coperacha: lo que le toca pagar a cada persona, con propina" },
      { n: 3, alt: "Cuentas y viajes guardados en Coperacha" },
    ],
    red: "sin-permiso",
    pro: true,
    categoria: "FinanceApplication",
    forma: "ancho",
    masa: 0.8,
    giro: 5,
  },
  boletito: {
    objeto: "El talonario de la rifa",
    frase: "Siempre sabes qué números quedan y quién te debe.",
    detalle:
      "Armas el talonario de 10 a 1000 números, apartas cada uno a nombre de quien lo pidió y sellas los pagados. El tablero sale en imagen para el grupo, sin nombres: quién debe no es asunto del grupo.",
    capturas: [
      { n: 1, alt: "Tablero de una rifa en Boletito con números libres, apartados y pagados" },
      { n: 2, alt: "Los números de Lupita en Boletito, sellados como pagados" },
      { n: 3, alt: "Boletito muestra el número ganador, el 13, a nombre de Chuy" },
    ],
    red: "sin-permiso",
    pro: false,
    categoria: "UtilitiesApplication",
    forma: "abanico",
    masa: 0.8,
    giro: -7,
  },
  papelito: {
    objeto: "El tazón de papelitos",
    frase: "Quien organiza el intercambio también juega: nunca ve el reparto.",
    detalle:
      "Anotas quiénes entran, pones las reglas de quién no se toca y sorteas. Cada quien desdobla su papelito en el teléfono o lo recibe por un enlace que se abre sin instalar nada.",
    capturas: [
      { n: 1, alt: "Un papelito abierto: Ana, te tocó regalarle a Eva" },
      { n: 2, alt: "El intercambio Posada de la oficina en Papelito" },
      { n: 3, alt: "El papelito de Ana, doblado, listo para abrirse" },
    ],
    red: "sin-llamadas",
    pro: true,
    categoria: "LifestyleApplication",
    forma: "fila",
    masa: 0.6,
    giro: 10,
  },
  tinmarin: {
    objeto: "La rima de tin marín, de do pingüé",
    frase: "Un sorteo que se puede comprobar, frente a todo el grupo.",
    detalle:
      "Pegas la lista, hasta 10,000 nombres, y giras. El ganador lo elige el teléfono antes de que la rueda se mueva, y cada sorteo queda con fecha, hora y un código. Se manda como video al grupo.",
    capturas: [
      { n: 1, alt: "La ruleta de Tin Marín con diez opciones para decidir qué comemos" },
      { n: 2, alt: "Resultado en Tin Marín: ganó Pollo rostizado entre 10 participantes, con su código" },
      { n: 3, alt: "Tin Marín ofrece compartir el sorteo como video o como imagen" },
    ],
    red: "sin-llamadas",
    pro: true,
    categoria: "UtilitiesApplication",
    forma: "ancho",
    masa: 1.0,
    giro: -5,
  },
  frijolito: {
    objeto: "La baraja de la lotería",
    frase: "El que canta la lotería, para que nadie se quede sin jugar.",
    detalle:
      "Baraja las 54 cartas, las canta en voz alta con su verso y lleva la cuenta de las que salieron, para revisar la tabla de quien grita ¡Lotería! La baraja ilustrada es propia, y hay tablas en el teléfono o para imprimir.",
    capturas: [
      { n: 1, alt: "Frijolito canta la carta 1, El Gallo, con su verso" },
      { n: 2, alt: "Frijolito canta solo La Luna, una carta cada 4 segundos" },
      { n: 3, alt: "Una tabla de lotería en el teléfono, marcada con frijolitos y el aviso ¡Lotería!" },
    ],
    red: "sin-llamadas",
    pro: true,
    categoria: "GameApplication",
    forma: "abanico",
    masa: 0.6,
    giro: 8,
  },
};

export type App = AndroidApp & Extra;
export const apps: App[] = androidApps.map((a) => ({ ...a, ...extras[a.slug] }));
export const bySlug = Object.fromEntries(apps.map((a) => [a.slug, a]));

/** Grupos de la cómoda, en el orden en que se abren. */
export const grupos: { id: AndroidApp["group"]; titulo: string; lead: string }[] = [
  {
    id: "dinero",
    titulo: "Para que alcance la quincena",
    lead: "Lo que tienes, lo que debes y lo que se te va cada mes sin darte cuenta.",
  },
  {
    id: "casa",
    titulo: "Para lo de la casa",
    lead: "Los papeles que nunca aparecen cuando hacen falta, y las medicinas de toda la familia.",
  },
  {
    id: "juntos",
    titulo: "Para hacerlo entre todos",
    lead: "La cuenta del restaurante, la rifa de la generación, el intercambio de la oficina y la lotería de la posada.",
  },
];

/** Orden de la bandeja (de izquierda a derecha y de arriba abajo) con su lugar en la retícula. */
export const bandeja = ["quincena", "guardadito", "tiliches", "canica", "coperacha", "pastillero", "boletito", "tinmarin", "frijolito", "papelito"];
export const area: Record<string, string> = {
  quincena: "q",
  guardadito: "g",
  tiliches: "t",
  canica: "c",
  coperacha: "o",
  pastillero: "p",
  boletito: "b",
  tinmarin: "m",
  frijolito: "f",
  papelito: "l",
};

/** Tinta legible sobre el color de una app: la de más contraste entre blanco y casi negro. */
export function tintaSobre(hex: string) {
  const c = hex.replace("#", "");
  const lin = (i: number) => {
    const v = parseInt(c.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const L = 0.2126 * lin(0) + 0.7152 * lin(2) + 0.0722 * lin(4);
  const conBlanco = 1.05 / (L + 0.05);
  const conNegro = (L + 0.05) / (0.0074 + 0.05);
  return conBlanco >= conNegro ? "#ffffff" : "#121417";
}

export const sinInternet = apps.filter((a) => a.red === "sin-permiso").length;

// Calculadora de garantía y devolución (/tiliches/garantia/). Lógica pura, sin DOM.
//
// Las fechas viajan como texto ISO (AAAA-MM-DD, lo que da <input type="date">) y se cuentan como
// días enteros desde 1970 en UTC: así no hay horas, husos ni cambios de horario de por medio.
// Las cuentas son las mismas que usa la app (PRODUCT.md de Tiliches, «Cómo se llevan las cuentas»):
// - Garantía: meses de calendario desde la compra o la entrega, ese día incluido. Un mes que no tiene
//   ese día cae en el último: 31 de enero + 1 mes es el 28 de febrero (29 en año bisiesto).
// - Devolución: días naturales: comprado el 1 de octubre con 30 días, se devuelve hasta el 31.
// - Mínimo legal: si se ofrece garantía, no puede ser menor a 90 días desde la entrega (art. 77 LFPC).

export const MESES_RAPIDOS = [3, 6, 12, 24, 36] as const;
export const DIAS_DEVOLUCION = 30;
export const MINIMO_LEGAL_DIAS = 90;
/** Topes de los campos: 10 años de garantía y un año para devolver. */
export const MAX_MESES = 120;
export const MAX_DIAS = 365;

const DIA_MS = 86_400_000;

/** Días desde el 1 de enero de 1970 de una fecha ISO válida, o null si no existe (31 de febrero). */
export function leerFecha(texto: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto.trim());
  if (!m) return null;
  const [a, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (a < 1900 || a > 2200) return null;
  const t = Date.UTC(a, mes - 1, dia);
  const d = new Date(t);
  if (d.getUTCFullYear() !== a || d.getUTCMonth() !== mes - 1 || d.getUTCDate() !== dia) return null;
  return t / DIA_MS;
}

/** Fecha ISO de un número de días desde 1970. */
export function aISO(dias: number): string {
  return new Date(dias * DIA_MS).toISOString().slice(0, 10);
}

const diasEnMes = (anio: number, mes0: number) => new Date(Date.UTC(anio, mes0 + 1, 0)).getUTCDate();

/** Suma meses de calendario; si el mes de llegada no tiene ese día, cae en el último. */
export function sumarMeses(dias: number, meses: number): number {
  const d = new Date(dias * DIA_MS);
  const total = d.getUTCMonth() + meses;
  const anio = d.getUTCFullYear() + Math.floor(total / 12);
  const mes0 = ((total % 12) + 12) % 12;
  const dia = Math.min(d.getUTCDate(), diasEnMes(anio, mes0));
  return Date.UTC(anio, mes0, dia) / DIA_MS;
}

/** Meses completos de `desde` a `hasta` (0 si ya pasó). */
export function mesesCompletos(desde: number, hasta: number): number {
  if (hasta <= desde) return 0;
  let m = 0;
  while (sumarMeses(desde, m + 1) <= hasta) m++;
  return m;
}

export interface Plazo {
  /** Último día del plazo, ese día incluido (días desde 1970). */
  fin: number;
  /** Días que faltan hasta el último día: 0 es hoy, negativo es que ya venció. */
  quedan: number;
  vencido: boolean;
}

const plazo = (fin: number, hoy: number): Plazo => ({ fin, quedan: fin - hoy, vencido: fin < hoy });

export interface Entrada {
  /** Fecha de compra o de entrega (ISO). */
  compra: string;
  /** Meses de garantía, 0 si no tiene. */
  meses: number | null;
  /** Días para devolver según la tienda, 0 si no acepta devoluciones. */
  dias: number | null;
  /** Hoy (ISO), del reloj del navegador. */
  hoy: string;
}

export type ErrorGarantia = "compra" | "meses" | "dias" | "hoy";

export interface Resultado {
  compra: number;
  hoy: number;
  meses: number;
  dias: number;
  garantia: Plazo | null;
  devolucion: Plazo | null;
  /** Meses completos de garantía que quedan desde hoy. */
  mesesQuedan: number;
  /** Último día del mínimo legal de 90 días desde la entrega. */
  minimoLegal: Plazo;
  /** La garantía escrita es menor que el mínimo legal de 90 días. */
  menorAlMinimo: boolean;
}

const entero = (n: number | null, max: number) => n !== null && Number.isInteger(n) && n >= 0 && n <= max;

/** Valida la entrada: devuelve el primer campo con error, o null. */
export function revisar(e: Entrada): ErrorGarantia | null {
  if (leerFecha(e.compra) === null) return "compra";
  if (!entero(e.meses, MAX_MESES)) return "meses";
  if (!entero(e.dias, MAX_DIAS)) return "dias";
  if (leerFecha(e.hoy) === null) return "hoy";
  return null;
}

/** Lee un número entero de un campo («12», « 30 »); vacío o con letras da null. */
export function leerEntero(texto: string): number | null {
  const t = texto.trim();
  return /^\d{1,4}$/.test(t) ? Number(t) : null;
}

export function calcular(e: Entrada): Resultado | ErrorGarantia {
  const error = revisar(e);
  if (error) return error;
  const compra = leerFecha(e.compra)!;
  const hoy = leerFecha(e.hoy)!;
  const meses = e.meses!;
  const dias = e.dias!;
  const garantia = meses > 0 ? plazo(sumarMeses(compra, meses), hoy) : null;
  const minimoLegal = plazo(compra + MINIMO_LEGAL_DIAS, hoy);
  return {
    compra,
    hoy,
    meses,
    dias,
    garantia,
    devolucion: dias > 0 ? plazo(compra + dias, hoy) : null,
    mesesQuedan: garantia ? mesesCompletos(hoy, garantia.fin) : 0,
    minimoLegal,
    menorAlMinimo: garantia !== null && garantia.fin < minimoLegal.fin,
  };
}

// ---------- Texto ----------

const formato = new Intl.DateTimeFormat("es-MX", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** «viernes, 30 de octubre de 2026» → «viernes 30 de octubre de 2026». */
export const fechaLarga = (dias: number) => formato.format(new Date(dias * DIA_MS)).replace(",", "");

const nDias = (n: number) => `${n} ${n === 1 ? "día" : "días"}`;
const nMeses = (n: number) => `${n} ${n === 1 ? "mes" : "meses"}`;

/** Lo que falta de un plazo, en una frase: «Quedan 18 días», «Hoy es el último día», «Venció hace 3 días». */
export function cuantoQueda(p: Plazo, meses = 0): string {
  if (p.vencido) return `Venció hace ${nDias(-p.quedan)}`;
  if (p.quedan === 0) return "Hoy es el último día";
  if (p.quedan === 1) return "Mañana es el último día";
  const extra = meses >= 2 ? ` (${nMeses(meses)} completos)` : "";
  return `Quedan ${nDias(p.quedan)}${extra}`;
}

/** Hoy en un huso horario (por defecto, el centro de México) como fecha ISO. */
export function hoyEn(zona = "America/Mexico_City", ahora = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: zona, year: "numeric", month: "2-digit", day: "2-digit" }).format(ahora);
}

/** El ejemplo con el que sale la página: una compra de hace 12 días, con un año de garantía y 30 días para devolver. */
export function ejemplo(hoy: string): Entrada {
  return { compra: aISO(leerFecha(hoy)! - 12), meses: 12, dias: DIAS_DEVOLUCION, hoy };
}

export type Sello = "vigente" | "por-vencer" | "hoy" | "vencido";

/** El sello de un plazo, como en la app: «Por vencer» a `aviso` días o menos (30 en la garantía, 7 en la devolución). */
export function sello(p: Plazo, aviso: number): Sello {
  if (p.vencido) return "vencido";
  if (p.quedan === 0) return "hoy";
  return p.quedan <= aviso ? "por-vencer" : "vigente";
}

export const SELLOS: Record<Sello, string> = {
  vigente: "Vigente",
  "por-vencer": "Por vencer",
  hoy: "Último día",
  vencido: "Ya venció",
};

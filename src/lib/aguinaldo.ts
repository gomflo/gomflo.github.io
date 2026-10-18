/**
 * Aguinaldo en México: lo que paga el patrón (artículo 87 de la LFT) y la parte
 * que no paga ISR (artículo 93, fracción XIV, de la LISR: 30 veces la UMA).
 *
 * No calcula el ISR de la parte gravada: depende del sueldo del mes y de cómo
 * lo calcule cada nómina.
 */
import { centavos } from "./iva";

export { leerMonto } from "./iva";

/**
 * Valor diario de la UMA. Lo publica el INEGI cada enero (y el DOF); el aguinaldo de
 * diciembre usa el del año. Al cambiar de año: actualiza `anio` y `diario` con el valor
 * de https://www.inegi.org.mx/temas/uma/ y corre `npm test`.
 */
export const UMA = { anio: 2026, diario: 117.31, fuente: "https://www.inegi.org.mx/temas/uma/" } as const;

/** Veces la UMA exentas de ISR en las gratificaciones del año (art. 93, fr. XIV, LISR). */
export const UMAS_EXENTAS = 30;
export const EXENTO = centavos(UMAS_EXENTAS * UMA.diario);

/** Mínimo de ley (art. 87 LFT). Muchas empresas dan más. */
export const DIAS_MINIMOS = 15;

/** El salario mensual se divide entre 30 para el diario (art. 89 LFT, último párrafo). */
export const DIAS_POR_MES = 30;

export type TipoSalario = "diario" | "mensual";

export type Periodo =
  | { tipo: "completo" }
  /** Fecha de ingreso, "AAAA-MM-DD": cuenta del ingreso al 31 de diciembre, los dos días incluidos. */
  | { tipo: "fecha"; ingreso: string }
  | { tipo: "dias"; dias: number };

export interface Entrada {
  salario: number;
  tipoSalario: TipoSalario;
  diasAguinaldo: number;
  periodo: Periodo;
  anio: number;
}

export interface Resultado {
  salarioDiario: number;
  diasDelAnio: number;
  diasTrabajados: number;
  /** Días de salario que tocan: los de aguinaldo en proporción a lo trabajado. */
  diasPagados: number;
  bruto: number;
  exento: number;
  gravado: number;
  proporcional: boolean;
}

export type ErrorAguinaldo = "salario" | "dias-aguinaldo" | "fecha" | "dias-trabajados";

export const esBisiesto = (anio: number) => (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0;
export const diasDelAnio = (anio: number) => (esBisiesto(anio) ? 366 : 365);

const DIA = 86_400_000;

/** Días del año `anio` trabajados desde `ingreso` hasta el 31 de diciembre, los dos incluidos. */
export const diasDesde = (ingreso: string, anio: number): number | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ingreso);
  if (!m) return null;
  const [a, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const t = Date.UTC(a, mes - 1, dia);
  const fecha = new Date(t);
  // Rechaza fechas que no existen (31 de febrero) en lugar de recorrerlas.
  if (fecha.getUTCFullYear() !== a || fecha.getUTCMonth() !== mes - 1 || fecha.getUTCDate() !== dia) return null;
  const inicio = Date.UTC(anio, 0, 1);
  const fin = Date.UTC(anio, 11, 31);
  if (t > fin) return 0;
  return Math.round((fin - Math.max(t, inicio)) / DIA) + 1;
};

export const calcularAguinaldo = (e: Entrada): Resultado | ErrorAguinaldo => {
  if (!Number.isFinite(e.salario) || e.salario <= 0) return "salario";
  if (!Number.isFinite(e.diasAguinaldo) || e.diasAguinaldo <= 0 || e.diasAguinaldo > 365) return "dias-aguinaldo";

  const total = diasDelAnio(e.anio);
  let trabajados: number;
  if (e.periodo.tipo === "completo") trabajados = total;
  else if (e.periodo.tipo === "fecha") {
    const d = diasDesde(e.periodo.ingreso, e.anio);
    if (d === null || d === 0) return "fecha";
    trabajados = d;
  } else {
    const d = e.periodo.dias;
    if (!Number.isInteger(d) || d <= 0 || d > total) return "dias-trabajados";
    trabajados = d;
  }

  const salarioDiario = e.tipoSalario === "mensual" ? e.salario / DIAS_POR_MES : e.salario;
  const diasPagados = (e.diasAguinaldo * trabajados) / total;
  const bruto = centavos(salarioDiario * diasPagados);
  const exento = Math.min(bruto, EXENTO);
  return {
    salarioDiario: centavos(salarioDiario),
    diasDelAnio: total,
    diasTrabajados: trabajados,
    diasPagados: Math.round(diasPagados * 100) / 100,
    bruto,
    exento,
    gravado: centavos(bruto - exento),
    proporcional: trabajados < total,
  };
};

/** El ejemplo de sobres para repartir el aguinaldo. Los porcentajes suman 100. */
export const SOBRES = [
  { id: "deudas", nombre: "Deudas", pct: 35, para: "La tarjeta o el préstamo que más interés cobra." },
  { id: "guardadito", nombre: "Guardadito", pct: 30, para: "Lo que no se toca: para una emergencia o para algo que quieres." },
  { id: "regalos", nombre: "Regalos", pct: 20, para: "Posadas, intercambio y Reyes, con tope." },
  { id: "enero", nombre: "Cuesta de enero", pct: 15, para: "Predial, inscripciones y lo que llega antes de la primera quincena." },
] as const;

/**
 * Reparte `monto` en pesos enteros según los porcentajes de `SOBRES`. Los centavos y lo
 * que sobre del redondeo van al guardadito, para que la suma dé exacto lo repartido.
 */
export const repartir = (monto: number): { id: (typeof SOBRES)[number]["id"]; monto: number }[] => {
  const partes = SOBRES.map((s) => ({ id: s.id, monto: Math.floor((monto * s.pct) / 100) }));
  const resto = centavos(monto - partes.reduce((suma, p) => suma + p.monto, 0));
  const g = partes.find((p) => p.id === "guardadito")!;
  g.monto = centavos(g.monto + resto);
  return partes;
};

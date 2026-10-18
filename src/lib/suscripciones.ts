/**
 * Cuánto se paga en suscripciones al mes y al año, y cuánto se ahorra al cancelar las marcadas.
 * Lo usa la calculadora de /canica/cancelar-suscripcion/ (en el servidor para el ejemplo y en el
 * navegador al teclear). Las cuentas son las de Canica (PRODUCT.md de la app):
 *
 * - Dinero en centavos enteros, para no perder ni ganar centavos al sumar.
 * - Una semanal cobra 52 veces al año; una mensual, 12; una anual, una.
 * - Al mes es un promedio: se suma todo lo del año y se divide entre 12 una sola vez.
 */
import { centavos, leerMonto } from "./iva";

export { leerMonto };

export type Periodicidad = "semanal" | "mensual" | "anual";

export const PERIODICIDADES: { id: Periodicidad; nombre: string; vecesAlAnio: number }[] = [
  { id: "semanal", nombre: "Semanal", vecesAlAnio: 52 },
  { id: "mensual", nombre: "Mensual", vecesAlAnio: 12 },
  { id: "anual", nombre: "Anual", vecesAlAnio: 1 },
];

export interface Renglon {
  nombre: string;
  /** En pesos. `null` o no positivo: el renglón no cuenta (está vacío o mal escrito). */
  monto: number | null;
  periodicidad: Periodicidad;
  /** Marcada para cancelar: cuenta en el total y en lo que te ahorras. */
  cancelar: boolean;
}

export interface Totales {
  /** Todo lo que pagas, en pesos. */
  mensual: number;
  anual: number;
  /** Lo que dejas de pagar si cancelas las marcadas. */
  ahorroMensual: number;
  ahorroAnual: number;
  /** Lo que te queda después de cancelarlas. */
  quedaMensual: number;
  quedaAnual: number;
  /** Renglones con monto válido, y de esos, los marcados para cancelar. */
  contadas: number;
  marcadas: number;
}

const veces = (p: Periodicidad) => PERIODICIDADES.find((x) => x.id === p)?.vecesAlAnio ?? 0;

export const montoValido = (monto: number | null): monto is number =>
  monto !== null && Number.isFinite(monto) && monto > 0 && monto < 10_000_000;

/** Centavos que suma al año un cobro de `monto` pesos con esa periodicidad. */
export const anualCentavos = (monto: number, periodicidad: Periodicidad): number =>
  Math.round(monto * 100) * veces(periodicidad);

/** Pesos al año de un cobro. */
export const alAnio = (monto: number, periodicidad: Periodicidad): number => anualCentavos(monto, periodicidad) / 100;

/** Pesos al mes de un cobro (promedio: lo del año entre 12). */
export const alMes = (monto: number, periodicidad: Periodicidad): number =>
  centavos(anualCentavos(monto, periodicidad) / 12 / 100);

export const totales = (renglones: Renglon[]): Totales => {
  let anual = 0;
  let ahorro = 0;
  let contadas = 0;
  let marcadas = 0;
  for (const r of renglones) {
    if (!montoValido(r.monto)) continue;
    const c = anualCentavos(r.monto, r.periodicidad);
    anual += c;
    contadas++;
    if (r.cancelar) {
      ahorro += c;
      marcadas++;
    }
  }
  // Al mes se divide una sola vez sobre la suma, como en Canica. Lo que queda se resta de lo
  // redondeado, para que total = ahorro + queda también en lo que se ve.
  const mes = (c: number) => Math.round(c / 12);
  const mensual = mes(anual);
  const ahorroMensual = mes(ahorro);
  return {
    mensual: mensual / 100,
    anual: anual / 100,
    ahorroMensual: ahorroMensual / 100,
    ahorroAnual: ahorro / 100,
    quedaMensual: (mensual - ahorroMensual) / 100,
    quedaAnual: (anual - ahorro) / 100,
    contadas,
    marcadas,
  };
};

/**
 * El ejemplo con el que sale la página. Nombres genéricos, sin marcas, y montos de muestra
 * (no son el precio de ningún servicio).
 */
export const EJEMPLO: Renglon[] = [
  { nombre: "Series", monto: 219, periodicidad: "mensual", cancelar: false },
  { nombre: "Música", monto: 129, periodicidad: "mensual", cancelar: false },
  { nombre: "Nube para fotos", monto: 49, periodicidad: "mensual", cancelar: false },
  { nombre: "Gimnasio", monto: 599, periodicidad: "mensual", cancelar: true },
  { nombre: "Antivirus", monto: 899, periodicidad: "anual", cancelar: false },
  { nombre: "App de idiomas", monto: 39, periodicidad: "semanal", cancelar: true },
];

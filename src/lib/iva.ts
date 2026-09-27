/**
 * IVA en México: agregar o desglosar la tasa general (16 %) o la de la región
 * fronteriza (8 %), con las retenciones más comunes de una factura.
 */

export type Tasa = "16" | "8";
export type RetencionIsr = "ninguna" | "10" | "1.25";

export const TASAS: Record<Tasa, { valor: number; nombre: string }> = {
  "16": { valor: 0.16, nombre: "16 % general" },
  "8": { valor: 0.08, nombre: "8 % frontera" },
};

export const RETENCIONES_ISR: Record<RetencionIsr, { valor: number; nombre: string }> = {
  ninguna: { valor: 0, nombre: "Sin retención" },
  "10": { valor: 0.1, nombre: "10 % honorarios o renta" },
  "1.25": { valor: 0.0125, nombre: "1.25 % RESICO" },
};

export interface OpcionesIva {
  /** "agregar": el monto es el subtotal. "quitar": el monto ya incluye IVA. */
  modo: "agregar" | "quitar";
  tasa: Tasa;
  /** Retiene dos terceras partes del IVA (persona física que factura a una moral). */
  retenerIva: boolean;
  retencionIsr: RetencionIsr;
}

export interface DesgloseIva {
  subtotal: number;
  iva: number;
  total: number;
  ivaRetenido: number;
  isrRetenido: number;
  /** Lo que se paga o se recibe después de retenciones. */
  neto: number;
}

/** Redondeo a centavos, como en el CFDI. */
export const centavos = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export const calcularIva = (monto: number, { modo, tasa, retenerIva, retencionIsr }: OpcionesIva): DesgloseIva => {
  const t = TASAS[tasa].valor;
  const subtotal = centavos(modo === "agregar" ? monto : monto / (1 + t));
  const iva = modo === "agregar" ? centavos(subtotal * t) : centavos(monto - subtotal);
  const total = centavos(subtotal + iva);
  const ivaRetenido = retenerIva ? centavos((iva * 2) / 3) : 0;
  const isrRetenido = centavos(subtotal * RETENCIONES_ISR[retencionIsr].valor);
  return { subtotal, iva, total, ivaRetenido, isrRetenido, neto: centavos(total - ivaRetenido - isrRetenido) };
};

/** Lee "1,234.56", "$1234.56" o "1234,56" (coma decimal si no hay punto). */
export const leerMonto = (input: string): number | null => {
  let limpio = input.replace(/[$\s]/g, "").replace(/mxn|m\.n\./gi, "");
  if (!limpio) return null;
  if (/^\d+(,\d{1,2})$/.test(limpio)) limpio = limpio.replace(",", ".");
  limpio = limpio.replace(/,/g, "");
  if (!/^\d+(\.\d+)?$/.test(limpio)) return null;
  const n = Number(limpio);
  return Number.isFinite(n) ? n : null;
};

// npm test: node --test con jiti para leer TypeScript.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  aISO,
  calcular,
  cuantoQueda,
  ejemplo,
  fechaLarga,
  hoyEn,
  leerEntero,
  leerFecha,
  mesesCompletos,
  sello,
  sumarMeses,
  type Entrada,
  type Resultado,
} from "./garantia";

const d = (iso: string) => {
  const n = leerFecha(iso);
  assert.notEqual(n, null, `${iso} debería ser una fecha válida`);
  return n!;
};
const meses = (iso: string, n: number) => aISO(sumarMeses(d(iso), n));
const ok = (e: Entrada) => {
  const r = calcular(e);
  assert.equal(typeof r, "object", `esperaba un resultado y salió el error «${String(r)}»`);
  return r as Resultado;
};

test("31 de enero + 1 mes cae en el último día de febrero", () => {
  assert.equal(meses("2026-01-31", 1), "2026-02-28");
  assert.equal(meses("2026-03-31", 1), "2026-04-30");
  assert.equal(meses("2026-08-31", 6), "2027-02-28");
  assert.equal(meses("2026-05-31", 1), "2026-06-30");
  // Desde el día 30 o 31, un mes después de diciembre cruza el año.
  assert.equal(meses("2026-12-31", 2), "2027-02-28");
});

test("en año bisiesto, febrero tiene 29", () => {
  assert.equal(meses("2028-01-31", 1), "2028-02-29");
  assert.equal(meses("2027-11-30", 3), "2028-02-29");
  // Comprado el 29 de febrero, un año después no hay 29: cae el 28.
  assert.equal(meses("2028-02-29", 12), "2029-02-28");
  // Y cuatro años después sí.
  assert.equal(meses("2028-02-29", 48), "2032-02-29");
});

test("un año de garantía llega al mismo día del año siguiente", () => {
  assert.equal(meses("2026-01-15", 12), "2027-01-15");
  assert.equal(meses("2026-11-13", 36), "2029-11-13");
  assert.equal(meses("2026-11-17", 3), "2027-02-17");
});

test("la devolución cuenta días naturales: 1 de octubre + 30 días es el 31", () => {
  const r = ok({ compra: "2026-10-01", meses: 12, dias: 30, hoy: "2026-10-01" });
  assert.equal(aISO(r.devolucion!.fin), "2026-10-31");
  // Por febrero de un año bisiesto.
  const b = ok({ compra: "2028-02-01", meses: 12, dias: 30, hoy: "2028-02-01" });
  assert.equal(aISO(b.devolucion!.fin), "2028-03-02");
  const n = ok({ compra: "2026-02-01", meses: 12, dias: 30, hoy: "2026-02-01" });
  assert.equal(aISO(n.devolucion!.fin), "2026-03-03");
});

test("el mismo día: el plazo vence hoy y todavía no está vencido", () => {
  const r = ok({ compra: "2026-10-01", meses: 1, dias: 30, hoy: "2026-10-31" });
  assert.equal(r.devolucion!.quedan, 0);
  assert.equal(r.devolucion!.vencido, false);
  assert.equal(cuantoQueda(r.devolucion!), "Hoy es el último día");
  // Y el día de la compra quedan los 30 días completos.
  const hoy = ok({ compra: "2026-10-01", meses: 12, dias: 30, hoy: "2026-10-01" });
  assert.equal(hoy.devolucion!.quedan, 30);
  assert.equal(hoy.garantia!.quedan, 365);
});

test("plazo ya vencido: dice hace cuántos días", () => {
  const r = ok({ compra: "2025-06-10", meses: 12, dias: 30, hoy: "2026-10-18" });
  assert.equal(r.devolucion!.vencido, true);
  assert.equal(r.garantia!.vencido, true);
  assert.equal(aISO(r.garantia!.fin), "2026-06-10");
  assert.equal(cuantoQueda(r.garantia!), "Venció hace 130 días");
  assert.equal(r.mesesQuedan, 0);
  // Un día después del último: venció hace 1 día, en singular.
  const ayer = ok({ compra: "2026-10-01", meses: 12, dias: 16, hoy: "2026-10-18" });
  assert.equal(cuantoQueda(ayer.devolucion!), "Venció hace 1 día");
});

test("lo que queda, en palabras", () => {
  const r = ok({ compra: "2026-10-06", meses: 12, dias: 30, hoy: "2026-10-18" });
  assert.equal(cuantoQueda(r.devolucion!), "Quedan 18 días");
  assert.equal(r.mesesQuedan, 11);
  assert.equal(cuantoQueda(r.garantia!, r.mesesQuedan), "Quedan 353 días (11 meses completos)");
  const manana = ok({ compra: "2026-10-01", meses: 12, dias: 30, hoy: "2026-10-30" });
  assert.equal(cuantoQueda(manana.devolucion!), "Mañana es el último día");
});

test("meses completos que quedan", () => {
  assert.equal(mesesCompletos(d("2026-01-31"), d("2026-02-28")), 1);
  assert.equal(mesesCompletos(d("2026-01-15"), d("2026-02-14")), 0);
  assert.equal(mesesCompletos(d("2026-01-15"), d("2027-01-15")), 12);
  assert.equal(mesesCompletos(d("2026-03-01"), d("2026-01-01")), 0);
});

test("una garantía menor a 90 días desde la entrega queda debajo del mínimo legal", () => {
  const corta = ok({ compra: "2026-01-31", meses: 1, dias: 0, hoy: "2026-02-01" });
  assert.equal(corta.menorAlMinimo, true);
  assert.equal(aISO(corta.minimoLegal.fin), "2026-05-01");
  // Tres meses desde el 1 de diciembre son 90 días justos (31 + 31 + 28): no queda debajo.
  const tres = ok({ compra: "2026-12-01", meses: 3, dias: 30, hoy: "2026-12-01" });
  assert.equal(aISO(tres.garantia!.fin), "2027-03-01");
  assert.equal(tres.menorAlMinimo, false);
  // Desde el 1 de noviembre tres meses son 92 días.
  assert.equal(ok({ compra: "2026-11-01", meses: 3, dias: 30, hoy: "2026-11-01" }).menorAlMinimo, false);
});

test("sin garantía o sin devolución no hay plazo que contar", () => {
  const r = ok({ compra: "2026-10-01", meses: 0, dias: 0, hoy: "2026-10-18" });
  assert.equal(r.garantia, null);
  assert.equal(r.devolucion, null);
  assert.equal(r.menorAlMinimo, false);
});

test("rechaza fechas que no existen y números fuera de rango", () => {
  assert.equal(leerFecha("2026-02-30"), null);
  assert.equal(leerFecha("2026-02-29"), null);
  assert.notEqual(leerFecha("2028-02-29"), null);
  assert.equal(leerFecha("18/10/2026"), null);
  assert.equal(leerFecha(""), null);
  assert.equal(calcular({ compra: "", meses: 12, dias: 30, hoy: "2026-10-18" }), "compra");
  assert.equal(calcular({ compra: "2026-10-01", meses: null, dias: 30, hoy: "2026-10-18" }), "meses");
  assert.equal(calcular({ compra: "2026-10-01", meses: 121, dias: 30, hoy: "2026-10-18" }), "meses");
  assert.equal(calcular({ compra: "2026-10-01", meses: 12, dias: 366, hoy: "2026-10-18" }), "dias");
  assert.equal(leerEntero(" 30 "), 30);
  assert.equal(leerEntero("1.5"), null);
  assert.equal(leerEntero("-3"), null);
  assert.equal(leerEntero(""), null);
});

test("fechas en español y hoy en el centro de México", () => {
  assert.equal(fechaLarga(d("2026-11-13")), "viernes 13 de noviembre de 2026");
  // A las 3 a. m. UTC del 18 de octubre todavía es 17 en la Ciudad de México (UTC−6).
  assert.equal(hoyEn("America/Mexico_City", new Date("2026-10-18T03:00:00Z")), "2026-10-17");
  assert.equal(hoyEn("America/Mexico_City", new Date("2026-10-18T07:00:00Z")), "2026-10-18");
});

test("el ejemplo es una compra de hace 12 días con un año de garantía y 30 días para devolver", () => {
  const e = ejemplo("2026-10-18");
  assert.deepEqual(e, { compra: "2026-10-06", meses: 12, dias: 30, hoy: "2026-10-18" });
  const r = ok(e);
  assert.equal(r.devolucion!.quedan, 18);
  assert.equal(aISO(r.garantia!.fin), "2027-10-06");
});

test("el sello de cada plazo", () => {
  const p = (quedan: number) => ({ fin: 0, quedan, vencido: quedan < 0 });
  assert.equal(sello(p(-1), 30), "vencido");
  assert.equal(sello(p(0), 30), "hoy");
  assert.equal(sello(p(30), 30), "por-vencer");
  assert.equal(sello(p(31), 30), "vigente");
  assert.equal(sello(p(7), 7), "por-vencer");
  assert.equal(sello(p(8), 7), "vigente");
});

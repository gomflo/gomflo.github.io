// npm test: node --test con jiti para leer TypeScript.
import { test } from "node:test";
import assert from "node:assert/strict";
import { EJEMPLO, alAnio, alMes, leerMonto, totales, type Renglon } from "./suscripciones";

const r = (monto: number | null, periodicidad: Renglon["periodicidad"], cancelar = false): Renglon => ({
  nombre: "x",
  monto,
  periodicidad,
  cancelar,
});

test("periodicidades: una semanal cobra 52 veces al año, una mensual 12 y una anual una", () => {
  assert.equal(alAnio(100, "semanal"), 5200);
  assert.equal(alAnio(100, "mensual"), 1200);
  assert.equal(alAnio(100, "anual"), 100);
});

test("al mes es lo del año entre 12", () => {
  assert.equal(alMes(1299, "anual"), 108.25);
  assert.equal(alMes(100, "semanal"), 433.33);
  assert.equal(alMes(219, "mensual"), 219);
});

test("los centavos no se pierden al sumar", () => {
  // 0.10 + 0.20 en flotantes da 0.30000000000000004; en centavos, 0.30 exacto.
  const t = totales([r(0.1, "anual"), r(0.2, "anual")]);
  assert.equal(t.anual, 0.3);
  // Tres anuales de 0.04: al mes se divide una vez sobre la suma (0.12 / 12 = 0.01), no renglón por renglón (0 + 0 + 0).
  assert.equal(totales([r(0.04, "anual"), r(0.04, "anual"), r(0.04, "anual")]).mensual, 0.01);
});

test("total al mes y al año del ejemplo", () => {
  const t = totales(EJEMPLO);
  // 219·12 + 129·12 + 49·12 + 599·12 + 899 + 39·52 = 2628 + 1548 + 588 + 7188 + 899 + 2028
  assert.equal(t.anual, 14879);
  assert.equal(t.mensual, 1239.92);
  assert.equal(t.contadas, 6);
});

test("ahorro al cancelar las marcadas", () => {
  const t = totales(EJEMPLO);
  // Gimnasio (599 al mes) y la app de idiomas (39 a la semana).
  assert.equal(t.marcadas, 2);
  assert.equal(t.ahorroAnual, 7188 + 2028);
  assert.equal(t.ahorroMensual, 768);
  assert.equal(t.quedaAnual, 14879 - 9216);
  assert.equal(t.quedaMensual, 471.92);
});

test("lo que queda más lo que ahorras da el total, también al mes", () => {
  const t = totales([r(100, "semanal", true), r(1299, "anual"), r(57.5, "mensual", true)]);
  assert.equal(Math.round((t.ahorroMensual + t.quedaMensual) * 100), Math.round(t.mensual * 100));
  assert.equal(Math.round((t.ahorroAnual + t.quedaAnual) * 100), Math.round(t.anual * 100));
});

test("sin marcadas no hay ahorro; todas marcadas, se ahorra todo", () => {
  const sin = totales([r(100, "mensual"), r(50, "semanal")]);
  assert.equal(sin.ahorroAnual, 0);
  assert.equal(sin.quedaAnual, sin.anual);
  const todas = totales([r(100, "mensual", true), r(50, "semanal", true)]);
  assert.equal(todas.ahorroAnual, todas.anual);
  assert.equal(todas.quedaMensual, 0);
});

test("renglones vacíos, en cero o mal escritos no cuentan", () => {
  const t = totales([r(null, "mensual", true), r(0, "mensual"), r(-5, "anual"), r(Number.NaN, "semanal"), r(100, "mensual")]);
  assert.equal(t.contadas, 1);
  assert.equal(t.marcadas, 0);
  assert.equal(t.anual, 1200);
  assert.equal(totales([]).mensual, 0);
});

test("lee montos como se escriben en México", () => {
  assert.equal(leerMonto("$1,299.00"), 1299);
  assert.equal(leerMonto("219"), 219);
  assert.equal(leerMonto("99,50"), 99.5);
  assert.equal(leerMonto("abc"), null);
});

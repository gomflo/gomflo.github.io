// npm test: node --test con jiti para leer TypeScript.
import { test } from "node:test";
import assert from "node:assert/strict";
import { EXENTO, UMA, calcularAguinaldo, diasDesde, leerMonto, repartir, type Entrada, type Resultado } from "./aguinaldo";

const calc = (e: Partial<Entrada>): Resultado => {
  const r = calcularAguinaldo({ salario: 400, tipoSalario: "diario", diasAguinaldo: 15, periodo: { tipo: "completo" }, anio: 2026, ...e });
  if (typeof r === "string") throw new Error(`Se esperaba un resultado y salió el error "${r}"`);
  return r;
};

test("la UMA de 2026 es la del INEGI y el exento son 30 de ellas", () => {
  assert.equal(UMA.anio, 2026);
  assert.equal(UMA.diario, 117.31);
  assert.equal(EXENTO, 3519.3);
});

test("salario diario, año completo: 15 días de salario", () => {
  const r = calc({ salario: 400 });
  assert.equal(r.bruto, 6000);
  assert.equal(r.diasTrabajados, 365);
  assert.equal(r.diasPagados, 15);
  assert.equal(r.proporcional, false);
});

test("salario mensual: se divide entre 30", () => {
  const r = calc({ salario: 12000, tipoSalario: "mensual" });
  assert.equal(r.salarioDiario, 400);
  assert.equal(r.bruto, 6000);
});

test("salario mensual con centavos en el diario", () => {
  const r = calc({ salario: 10000, tipoSalario: "mensual" });
  assert.equal(r.salarioDiario, 333.33);
  assert.equal(r.bruto, 5000); // 10,000 / 30 × 15, sin redondear el diario antes
});

test("ingreso a mitad de año: del 1 de julio al 31 de diciembre son 184 días", () => {
  assert.equal(diasDesde("2026-07-01", 2026), 184);
  const r = calc({ salario: 365, periodo: { tipo: "fecha", ingreso: "2026-07-01" } });
  assert.equal(r.diasTrabajados, 184);
  assert.equal(r.bruto, 2760); // 365 × 15 × 184 / 365
  assert.equal(r.proporcional, true);
});

test("ingreso antes del año cuenta el año completo", () => {
  assert.equal(diasDesde("2019-03-15", 2026), 365);
  assert.equal(calc({ periodo: { tipo: "fecha", ingreso: "2019-03-15" } }).proporcional, false);
});

test("ingreso el 31 de diciembre es un día; después del año, error", () => {
  assert.equal(diasDesde("2026-12-31", 2026), 1);
  assert.equal(diasDesde("2027-01-02", 2026), 0);
  assert.equal(calcularAguinaldo({ salario: 400, tipoSalario: "diario", diasAguinaldo: 15, periodo: { tipo: "fecha", ingreso: "2027-01-02" }, anio: 2026 }), "fecha");
});

test("fechas que no existen no se recorren", () => {
  assert.equal(diasDesde("2026-02-30", 2026), null);
  assert.equal(diasDesde("1/7/2026", 2026), null);
});

test("año bisiesto: 366 días", () => {
  assert.equal(diasDesde("2028-01-01", 2028), 366);
  assert.equal(calc({ anio: 2028, periodo: { tipo: "fecha", ingreso: "2028-07-01" } }).diasTrabajados, 184);
});

test("días trabajados en el año", () => {
  const r = calc({ salario: 500, periodo: { tipo: "dias", dias: 73 } });
  assert.equal(r.bruto, 1500); // 500 × 15 × 73 / 365
  assert.equal(r.diasPagados, 3);
  assert.equal(calcularAguinaldo({ salario: 500, tipoSalario: "diario", diasAguinaldo: 15, periodo: { tipo: "dias", dias: 366 }, anio: 2026 }), "dias-trabajados");
});

test("más de 15 días: 30 días de aguinaldo", () => {
  const r = calc({ salario: 15000, tipoSalario: "mensual", diasAguinaldo: 30 });
  assert.equal(r.bruto, 15000);
});

test("bajo el tope todo es exento", () => {
  const r = calc({ salario: 200 }); // 3,000
  assert.equal(r.exento, 3000);
  assert.equal(r.gravado, 0);
});

test("sobre el tope, lo que pasa de 30 UMA es gravado", () => {
  const r = calc({ salario: 400 }); // 6,000
  assert.equal(r.exento, 3519.3);
  assert.equal(r.gravado, 2480.7);
  assert.equal(r.exento + r.gravado, r.bruto);
});

test("justo en el tope", () => {
  const r = calc({ salario: 234.62 }); // 3,519.30
  assert.equal(r.bruto, 3519.3);
  assert.equal(r.gravado, 0);
});

test("entradas inválidas", () => {
  const base = { tipoSalario: "diario", periodo: { tipo: "completo" }, anio: 2026 } as const;
  assert.equal(calcularAguinaldo({ ...base, salario: 0, diasAguinaldo: 15 }), "salario");
  assert.equal(calcularAguinaldo({ ...base, salario: 400, diasAguinaldo: 0 }), "dias-aguinaldo");
  assert.equal(leerMonto("12,000.50"), 12000.5);
  assert.equal(leerMonto("$ 9 500"), 9500);
  assert.equal(leerMonto("abc"), null);
});

test("el reparto suma exacto lo repartido", () => {
  const partes = repartir(6000.55);
  assert.deepEqual(
    partes.map((p) => p.monto),
    [2100, 1800.55, 1200, 900]
  );
  const suma = partes.reduce((s, p) => s + p.monto, 0);
  assert.equal(Math.round(suma * 100) / 100, 6000.55);
  const raro = repartir(1234.56);
  assert.equal(Math.round(raro.reduce((s, p) => s + p.monto, 0) * 100) / 100, 1234.56);
});

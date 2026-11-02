// npm test: node --test con jiti para leer TypeScript.
import { test } from "node:test";
import assert from "node:assert/strict";
import { habilesPorMes } from "./dias-habiles";

test("días hábiles por mes de 2026", () => {
  // Enero: 22 entre semana menos el 1 (jueves). Marzo: 22 menos el lunes 16. Octubre: 22, sin feriados.
  const ley = habilesPorMes(2026, false);
  assert.equal(ley[0], 21);
  assert.equal(ley[2], 21);
  assert.equal(ley[9], 22);
  // Bancario: abril pierde Jueves y Viernes Santo (2 y 3); diciembre, el 25 y el sábado 12 no cuenta.
  const banco = habilesPorMes(2026, true);
  assert.equal(banco[3], ley[3] - 2);
  assert.equal(banco[11], ley[11]);
  assert.equal(ley.reduce((a, b) => a + b), 261 - 7); // 261 días entre semana menos 7 feriados, ninguno en fin de semana
});

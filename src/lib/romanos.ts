/**
 * Números romanos ↔ arábigos, en la forma estándar (1 a 3,999).
 */

export const MIN_ROMANO = 1;
export const MAX_ROMANO = 3999;

const VALORES: [number, string][] = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

const SIMBOLOS: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };

/** Convierte un entero entre 1 y 3,999 a romano. */
export const aRomano = (n: number): string => {
  if (!Number.isInteger(n) || n < MIN_ROMANO || n > MAX_ROMANO) {
    throw new RangeError(`El número debe estar entre ${MIN_ROMANO} y ${MAX_ROMANO.toLocaleString("es-MX")}.`);
  }
  let resto = n;
  let romano = "";
  for (const [valor, simbolo] of VALORES) {
    while (resto >= valor) {
      romano += simbolo;
      resto -= valor;
    }
  }
  return romano;
};

/**
 * Convierte un romano a entero. Solo acepta la forma estándar: "IIII" o "IC"
 * se rechazan con un mensaje que sugiere la escritura correcta.
 */
export const deRomano = (input: string): number => {
  const romano = input.trim().toUpperCase();
  if (!romano) throw new Error("Escribe un número romano.");
  const invalido = [...romano].find((c) => !(c in SIMBOLOS));
  if (invalido) throw new Error(`«${invalido}» no es un símbolo romano. Usa I, V, X, L, C, D y M.`);

  let total = 0;
  for (let i = 0; i < romano.length; i++) {
    const actual = SIMBOLOS[romano[i]];
    const siguiente = SIMBOLOS[romano[i + 1]] ?? 0;
    total += actual < siguiente ? -actual : actual;
  }

  if (total < MIN_ROMANO || total > MAX_ROMANO) {
    throw new Error(`El valor queda fuera del rango ${MIN_ROMANO}–${MAX_ROMANO.toLocaleString("es-MX")}.`);
  }
  const estandar = aRomano(total);
  if (estandar !== romano) throw new Error(`No es la forma correcta. ${total} se escribe ${estandar}.`);
  return total;
};

/** Desglose de un número en sus partes romanas: 1994 → M + CM + XC + IV. */
export const desglose = (n: number): { valor: number; simbolo: string }[] => {
  const partes: { valor: number; simbolo: string }[] = [];
  let resto = n;
  for (const [valor, simbolo] of VALORES) {
    while (resto >= valor) {
      partes.push({ valor, simbolo });
      resto -= valor;
    }
  }
  return partes;
};

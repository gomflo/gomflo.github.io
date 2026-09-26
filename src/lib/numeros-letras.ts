/**
 * Convierte números a su escritura en español, como se usa en cheques,
 * facturas y pagarés ("MIL DOSCIENTOS PESOS 50/100 M.N.").
 * Soporta enteros hasta 999 999 999 999 999 (billones).
 */

const UNIDADES = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"];
const DIEZ_A_VEINTINUEVE = [
  "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve",
  "veinte", "veintiuno", "veintidós", "veintitrés", "veinticuatro", "veinticinco", "veintiséis", "veintisiete", "veintiocho", "veintinueve",
];
const DECENAS = ["", "", "", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
const CENTENAS = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];

export const MAX_ENTERO = 999_999_999_999_999n;

/** "uno" → "un" delante de un sustantivo: "veintiún pesos", "treinta y un mil". */
const apocopar = (palabras: string): string =>
  palabras.replace(/veintiuno$/, "veintiún").replace(/uno$/, "un");

const menorQueMil = (n: number, apocope: boolean): string => {
  if (n === 0) return "";
  if (n === 100) return "cien";

  const c = Math.floor(n / 100);
  const resto = n % 100;
  const partes: string[] = [];
  if (c > 0) partes.push(CENTENAS[c]);

  if (resto >= 30) {
    const d = Math.floor(resto / 10);
    const u = resto % 10;
    partes.push(u ? `${DECENAS[d]} y ${UNIDADES[u]}` : DECENAS[d]);
  } else if (resto >= 10) {
    partes.push(DIEZ_A_VEINTINUEVE[resto - 10]);
  } else if (resto > 0) {
    partes.push(UNIDADES[resto]);
  }

  const texto = partes.join(" ");
  return apocope ? apocopar(texto) : texto;
};

const menorQueMillon = (n: number, apocope: boolean): string => {
  const miles = Math.floor(n / 1000);
  const resto = n % 1000;
  const partes: string[] = [];
  if (miles === 1) partes.push("mil");
  else if (miles > 1) partes.push(`${menorQueMil(miles, true)} mil`);
  if (resto > 0) partes.push(menorQueMil(resto, apocope));
  return partes.join(" ");
};

/** Escribe un entero con letra. `apocope` usa "un" en lugar de "uno" al final. */
export const enteroALetras = (valor: bigint, apocope = false): string => {
  if (valor < 0n) return `menos ${enteroALetras(-valor, apocope)}`;
  if (valor === 0n) return "cero";
  if (valor > MAX_ENTERO) throw new RangeError("El número es demasiado grande");

  const billones = Number(valor / 1_000_000_000_000n);
  const millones = Number((valor / 1_000_000n) % 1_000_000n);
  const resto = Number(valor % 1_000_000n);
  const partes: string[] = [];

  if (billones === 1) partes.push("un billón");
  else if (billones > 1) partes.push(`${menorQueMillon(billones, true)} billones`);

  if (millones === 1) partes.push("un millón");
  else if (millones > 1) partes.push(`${menorQueMillon(millones, true)} millones`);

  if (resto > 0) partes.push(menorQueMillon(resto, apocope));

  return partes.join(" ");
};

export type Moneda = "MXN" | "USD" | "EUR";

export const MONEDAS: Record<Moneda, { singular: string; plural: string; sufijo: string; nombre: string }> = {
  MXN: { singular: "peso", plural: "pesos", sufijo: "M.N.", nombre: "Pesos mexicanos" },
  USD: { singular: "dólar", plural: "dólares", sufijo: "USD", nombre: "Dólares" },
  EUR: { singular: "euro", plural: "euros", sufijo: "EUR", nombre: "Euros" },
};

export interface NumeroLeido {
  entero: bigint;
  /** Dígitos decimales tal como se escribieron, sin ceros a la derecha. */
  decimales: string;
  negativo: boolean;
}

/** Acepta "1,234.56", "1234.5", "-12" o "1 000". Devuelve null si no es un número. */
export const leerNumero = (entrada: string): NumeroLeido | null => {
  const limpio = entrada.trim().replace(/[\s,$]/g, "");
  const match = limpio.match(/^(-)?(\d+)(?:\.(\d+))?$/);
  if (!match) return null;
  return {
    negativo: Boolean(match[1]),
    entero: BigInt(match[2]),
    decimales: (match[3] ?? "").replace(/0+$/, ""),
  };
};

/** "1234.5" → "mil doscientos treinta y cuatro pesos 50/100 M.N." */
export const aLetrasMoneda = (numero: NumeroLeido, moneda: Moneda): string => {
  const { singular, plural, sufijo } = MONEDAS[moneda];
  const centavos = (numero.decimales + "00").slice(0, 2);
  const palabras = enteroALetras(numero.entero, true);
  const esMillonExacto = numero.entero >= 1_000_000n && numero.entero % 1_000_000n === 0n;
  const unidad = numero.entero === 1n ? singular : plural;
  const signo = numero.negativo ? "menos " : "";
  return `${signo}${palabras}${esMillonExacto ? " de" : ""} ${unidad} ${centavos}/100 ${sufijo}`;
};

/** "12.5" → "doce punto cinco" */
export const aLetrasNumero = (numero: NumeroLeido): string => {
  const signo = numero.negativo ? "menos " : "";
  const entero = enteroALetras(numero.entero);
  if (!numero.decimales) return `${signo}${entero}`;
  const ceros = numero.decimales.match(/^0*/)?.[0].length ?? 0;
  const decimales = [
    ...Array.from({ length: ceros }, () => "cero"),
    enteroALetras(BigInt(numero.decimales)),
  ].join(" ");
  return `${signo}${entero} punto ${decimales}`;
};

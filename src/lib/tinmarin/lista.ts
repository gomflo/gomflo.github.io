// Convierte texto pegado en una lista de nombres, igual que la app (core/parse/ListParser.kt): un nombre
// por línea, listas numeradas o con viñetas, y una sola línea separada por comas, punto y coma o tabuladores.
// Tiene que limpiar igual que la app para que la misma lista dé la misma huella en los dos lados.

// `\s` de Java solo cuenta los espacios ASCII; en JavaScript incluye los de Unicode. Se escribe a mano.
const S = "[ \\t\\n\\x0B\\f\\r]";

// "1." y "2)" pueden ir pegados al nombre; "3-" y "4:" solo cuentan como numeración si les sigue un espacio.
// Un punto seguido de dígito es un decimal, y seguido de una terminación de ordinal ("1.er premio",
// "2.º lugar") es parte del nombre: ninguno de los dos es numeración.
const numbering = new RegExp(
  `^${S}*(?:\\d{1,4}${S}*[.)](?!\\d|[ºª°]|(?:er|ro|ra|do|da|to|ta|vo|va|mo|ma)\\b)${S}*|\\d{1,4}${S}*[-:]${S}+|[-*•·▪◦–—]${S}+)`,
);
const checkbox = new RegExp(`^${S}*\\[[ xX]?\\]${S}*`);
const spaces = new RegExp(`${S}+`, "g");
const BOM = "﻿";

export const MAX_LABEL = 80;
/** Tope de nombres por ruleta, el mismo de la app. */
export const MAX_NAMES = 10_000;
export const MAX_WEIGHT = 999;

const lines = (text: string) => text.split(/\r\n|\n|\r/);
const stripBom = (text: string) => (text.startsWith(BOM) ? text.slice(1) : text);

function clean(raw: string): string {
  return raw.replace(checkbox, "").replace(numbering, "").replace(spaces, " ").trim().slice(0, MAX_LABEL);
}

function splitSingleLine(line: string): string[] {
  for (const separator of ["\t", ";", ","]) {
    if (line.includes(separator)) return line.split(separator);
  }
  return [line];
}

export function parse(text: string): string[] {
  const filled = lines(stripBom(text))
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  const pieces = filled.length === 1 ? splitSingleLine(filled[0]) : filled;
  return pieces.map(clean).filter((l) => l.length > 0);
}

/** Como [parse], pero un renglón es siempre un nombre aunque sea el único y traiga comas. */
export function parseLines(text: string): string[] {
  return lines(stripBom(text))
    .map(clean)
    .filter((l) => l.length > 0);
}

/** Lo que hace que dos nombres cuenten como el mismo al quitar repetidos. */
export function key(label: string): string {
  return label.toLowerCase().replace(spaces, " ").trim();
}

/** Un nombre que, solo en un renglón, se partiría en varios. */
export function hasSeparator(label: string): boolean {
  return /[,;\t]/.test(label);
}

/**
 * Los nombres del borrador. Si el borrador es un solo renglón que ya era un participante con comas
 * ("García, Ana"), se queda entero en vez de partirse.
 */
export function interpret(draft: string, current: string[]): string[] {
  const filled = lines(draft)
    .map((l) => l.trim())
    .filter(Boolean);
  if (filled.length === 1 && hasSeparator(filled[0]) && current.includes(clean(filled[0]))) return parseLines(draft);
  return parse(draft);
}

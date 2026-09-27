/**
 * Texto ↔ binario, hexadecimal, octal y decimal, byte por byte en UTF-8.
 */

export type Base = "bin" | "hex" | "oct" | "dec";

export const BASES: Record<Base, { nombre: string; radix: number; ancho: number; patron: RegExp }> = {
  bin: { nombre: "Binario", radix: 2, ancho: 8, patron: /^[01]+$/ },
  hex: { nombre: "Hexadecimal", radix: 16, ancho: 2, patron: /^[0-9a-f]+$/i },
  oct: { nombre: "Octal", radix: 8, ancho: 3, patron: /^[0-7]+$/ },
  dec: { nombre: "Decimal", radix: 10, ancho: 0, patron: /^\d+$/ },
};

const encoder = new TextEncoder();

/** Cada byte del texto en la base elegida, separado por espacios. */
export const codificar = (texto: string, base: Base, separador = " "): string => {
  const { radix, ancho } = BASES[base];
  return Array.from(encoder.encode(texto), (byte) => {
    const s = byte.toString(radix);
    return ancho ? s.padStart(ancho, "0") : s;
  }).join(separador);
};

/**
 * Lee bytes separados por espacios, comas o saltos. En binario y hex también
 * acepta una tira continua ("0100100001101001") y la parte en bytes.
 */
export const decodificar = (entrada: string, base: Base): string => {
  const { radix, ancho, patron, nombre } = BASES[base];
  let limpio = entrada.trim();
  if (base === "hex") limpio = limpio.replace(/0x/gi, "");
  if (base === "bin") limpio = limpio.replace(/0b/gi, "");
  let piezas = limpio.split(/[\s,;]+/).filter(Boolean);

  if (piezas.length === 1 && (base === "bin" || base === "hex") && piezas[0].length > ancho) {
    const tira = piezas[0];
    if (tira.length % ancho !== 0) {
      throw new Error(`La cantidad de dígitos no es múltiplo de ${ancho}. Revisa que no falte ni sobre un dígito.`);
    }
    piezas = tira.match(new RegExp(`.{${ancho}}`, "g")) ?? [];
  }

  const bytes = piezas.map((pieza) => {
    if (!patron.test(pieza)) throw new Error(`«${pieza}» no es un número ${nombre.toLowerCase()} válido.`);
    const valor = parseInt(pieza, radix);
    if (valor > 255) throw new Error(`«${pieza}» vale ${valor}; cada byte va de 0 a 255.`);
    return valor;
  });

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(new Uint8Array(bytes));
  } catch {
    throw new Error("Los bytes no forman texto UTF-8 válido. Puede que falte un byte de una letra con acento o emoji.");
  }
};


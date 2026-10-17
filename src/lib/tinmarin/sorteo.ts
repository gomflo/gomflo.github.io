// El azar de Tin Marín, portado tal cual de la app (core/draw/FairDraw.kt). El ganador se decide aquí,
// antes de que la rueda se mueva, con una semilla de 64 bits del generador criptográfico del navegador.
// Con la misma semilla y la misma lista sale el mismo ganador que en el teléfono: por eso un código de la
// app se puede comprobar en la web y al revés. Cualquier cambio aquí rompe esa compatibilidad.

const MASK = (1n << 64n) - 1n;

/** Resultado de un sorteo: qué casilla gana y en qué punto de su arco (0 a 1) se detiene el puntero. */
export type Pick = { index: number; fraction: number };

/** SplitMix64, igual que en la app. El estado se lleva sin signo; los bits son los mismos que con Long. */
class SplitMix64 {
  private state: bigint;

  constructor(seed: bigint) {
    this.state = seed & MASK;
  }

  next(): bigint {
    this.state = (this.state + 0x9e3779b97f4a7c15n) & MASK;
    let z = this.state;
    z = ((z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n) & MASK;
    z = ((z ^ (z >> 27n)) * 0x94d049bb133111ebn) & MASK;
    return z ^ (z >> 31n);
  }

  /** Entero uniforme en [0, bound), con rechazo para no tener el sesgo del módulo. */
  nextBelow(bound: bigint): bigint {
    const threshold = ((1n << 64n) - bound) % bound;
    for (;;) {
      const r = this.next();
      if (r >= threshold) return r % bound;
    }
  }

  /** Real uniforme en [0, 1), en precisión de Float como en Kotlin. */
  nextUnit(): number {
    return Math.fround(Number(this.next() >> 40n) / 16777216);
  }
}

/** Semilla nueva del generador criptográfico. */
export function newSeed(): bigint {
  const words = crypto.getRandomValues(new Uint32Array(2));
  return (BigInt(words[0]) << 32n) | BigInt(words[1]);
}

/** [weights] son los boletos de cada participante, en el orden de la rueda. */
export function pick(seed: bigint, weights: number[]): Pick {
  if (weights.length === 0) throw new Error("No hay participantes");
  const total = weights.reduce((sum, w) => sum + BigInt(Math.max(1, w)), 0n);
  const rng = new SplitMix64(seed);
  let ticket = rng.nextBelow(total);
  let index = weights.length - 1;
  for (let i = 0; i < weights.length; i++) {
    const w = BigInt(Math.max(1, weights[i]));
    if (ticket < w) {
      index = i;
      break;
    }
    ticket -= w;
  }
  // El puntero nunca se detiene sobre una división: quedaría en duda quién ganó.
  const fraction = Math.fround(Math.fround(0.14) + Math.fround(Math.fround(0.72) * rng.nextUnit()));
  return { index, fraction };
}

/** Huella corta de la lista participante (nombre y boletos, en orden). Cambia si cambia cualquier cosa. */
export async function listHash(entries: { label: string; weight: number }[]): Promise<string> {
  const encoder = new TextEncoder();
  const parts: Uint8Array[] = [];
  for (const { label, weight } of entries) {
    parts.push(encoder.encode(label), Uint8Array.of(0x1f), encoder.encode(String(weight)), Uint8Array.of(0x0a));
  }
  const bytes = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const p of parts) {
    bytes.set(p, offset);
    offset += p.length;
  }
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  return Array.from(digest.slice(0, 6), (b) => b.toString(16).padStart(2, "0").toUpperCase()).join("");
}

/** La semilla en un formato que se puede dictar o copiar: cuatro grupos de cuatro. */
export function seedCode(seed: bigint): string {
  const hex = (seed & MASK).toString(16).toUpperCase().padStart(16, "0");
  return hex.match(/.{4}/g)!.join("-");
}

/** Lee un código con o sin guiones ni espacios. Nulo si no son 16 dígitos hexadecimales. */
export function parseSeedCode(code: string): bigint | null {
  const hex = code.replace(/[^0-9a-z]/gi, "");
  if (!/^[0-9a-f]{16}$/i.test(hex)) return null;
  return BigInt(`0x${hex}`);
}

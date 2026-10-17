// El azar de Frijolito, portado de la app (core/loteria/Shuffle.kt y Boards.kt). La baraja completa se
// decide al barajar, con una semilla de 64 bits del generador criptográfico del navegador: nada de lo que
// pase después (el ritmo, los toques, las pausas) cambia qué carta sigue. Con la misma semilla sale el mismo
// orden que en el teléfono.

const MASK = (1n << 64n) - 1n;
export const BARAJA = 54;
export const CASILLAS = 16;

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
  nextBelow(bound: number): number {
    const b = BigInt(bound);
    const threshold = ((1n << 64n) - b) % b;
    for (;;) {
      const r = this.next();
      if (r >= threshold) return Number(r % b);
    }
  }
}

/** Semilla nueva del generador criptográfico. */
export function nuevaSemilla(): bigint {
  const words = crypto.getRandomValues(new Uint32Array(2));
  return (BigInt(words[0]) << 32n) | BigInt(words[1]);
}

/** Fisher-Yates: cada orden posible tiene la misma probabilidad. */
function revolver(items: number[], rng: SplitMix64): number[] {
  const out = items.slice();
  for (let i = out.length - 1; i >= 1; i--) {
    const j = rng.nextBelow(i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const TODAS = Array.from({ length: BARAJA }, (_, i) => i + 1);

/** Las 54 cartas (1 a 54) en el orden en que se van a cantar. */
export function orden(semilla: bigint): number[] {
  return revolver(TODAS, new SplitMix64(semilla));
}

/** [cuantas] tablas de 4 × 4, distintas entre sí: ninguna repite el mismo conjunto de cartas. */
export function tablas(semilla: bigint, cuantas: number): number[][] {
  const rng = new SplitMix64(semilla);
  const vistas = new Set<string>();
  const out: number[][] = [];
  while (out.length < cuantas) {
    const casillas = revolver(TODAS, rng).slice(0, CASILLAS);
    const clave = [...casillas].sort((a, b) => a - b).join(",");
    if (!vistas.has(clave)) {
      vistas.add(clave);
      out.push(casillas);
    }
  }
  return out;
}

/** La semilla como texto para guardarla (16 cifras hexadecimales). */
export function semillaATexto(semilla: bigint): string {
  return (semilla & MASK).toString(16).toUpperCase().padStart(16, "0");
}

export function textoASemilla(texto: unknown): bigint | null {
  return typeof texto === "string" && /^[0-9A-F]{16}$/i.test(texto) ? BigInt(`0x${texto}`) : null;
}

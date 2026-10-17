// La rueda y su giro, portados de la app (core/wheel/WheelLayout.kt y core/draw/SpinPlan.kt, SpinVisuals.kt).
// Nada de esto decide al ganador: solo reparte la rueda y la lleva hasta el resultado que ya salió de pick().

export type Entry = {
  id: number;
  label: string;
  weight: number;
  removed?: boolean;
};

/** Una casilla colocada. Ángulos en grados, sentido horario; el 0 queda bajo el puntero sin girar. */
export type Slice = {
  id: number;
  label: string;
  weight: number;
  start: number;
  sweep: number;
  color: number;
};

export function normalize(angle: number): number {
  const a = angle % 360;
  return a < 0 ? a + 360 : a;
}

/** Colores en ciclo, cuidando que la última casilla no repita el color de la primera, que es su vecina. */
function colorIndices(count: number, palette: number): number[] {
  const indices = Array.from({ length: count }, (_, i) => i % palette);
  if (count > 2 && palette > 2 && indices[count - 1] === indices[0]) {
    const before = indices[count - 2];
    for (let c = 0; c < palette; c++) {
      if (c !== indices[0] && c !== before) {
        indices[count - 1] = c;
        break;
      }
    }
  }
  return indices;
}

/** Reparto de la rueda entre los participantes activos, proporcional a sus boletos. */
export function layout(entries: Entry[], palette: number): Slice[] {
  const active = entries.filter((e) => !e.removed);
  if (active.length === 0) return [];
  const total = active.reduce((n, e) => n + Math.max(1, e.weight), 0);
  const colors = colorIndices(active.length, palette);
  // Cada borde sale de los boletos acumulados, no de sumar arcos: así la última casilla cierra en 360.
  let before = 0;
  return active.map((e, i) => {
    const weight = Math.max(1, e.weight);
    const start = (360 * before) / total;
    before += weight;
    const end = i === active.length - 1 ? 360 : (360 * before) / total;
    return {
      id: e.id,
      label: e.label,
      weight,
      start,
      sweep: end - start,
      color: colors[i],
    };
  });
}

/** Índice de la casilla que contiene [angle]. Búsqueda binaria: con mil casillas se llama en cada cuadro. */
export function indexAt(slices: Slice[], angle: number): number {
  if (slices.length === 0) return -1;
  const a = normalize(angle);
  let low = 0;
  let high = slices.length - 1;
  while (low < high) {
    const mid = (low + high + 1) >>> 1;
    if (slices[mid].start <= a) low = mid;
    else high = mid - 1;
  }
  return low;
}

/** Casilla bajo el puntero cuando la rueda lleva girados [rotation] grados en sentido horario. */
export const indexUnderPointer = (slices: Slice[], rotation: number) => indexAt(slices, -rotation);

/** Rotación (0 a 360) que deja el puntero en la [fraction] del arco de la casilla [index]. */
export function rotationFor(slices: Slice[], index: number, fraction: number): number {
  const s = slices[index];
  return normalize(-(s.start + s.sweep * Math.min(1, Math.max(0, fraction))));
}

const POWER = 3;
const MIN_TURNS = 3;
const MIN_SPEED = 700;
const MAX_SPEED = 3200;

/**
 * Trayectoria de un giro. La velocidad cae como (1 - t/T)^2: arranca rápido, frena largo y llega con
 * velocidad cero exactamente al ángulo del ganador, sin corrección final.
 */
export type SpinPlan = { start: number; distance: number; duration: number };

export function createPlan(start: number, target: number, fling: number, baseSeconds: number, variation: number): SpinPlan {
  const direction = fling < 0 ? -1 : 1;
  const speed = fling === 0 ? 1500 + 600 * variation : Math.min(MAX_SPEED, Math.max(MIN_SPEED, Math.abs(fling)));
  // Un impulso fuerte gira un poco más de tiempo, no solo más rápido.
  const duration = baseSeconds * (0.8 + (0.45 * (speed - MIN_SPEED)) / (MAX_SPEED - MIN_SPEED));
  const natural = (speed * duration) / POWER;
  const offset = normalize(direction * (target - start));
  const turns = Math.max(MIN_TURNS, Math.round((natural - offset) / 360));
  return { start, distance: direction * (offset + 360 * turns), duration };
}

export function angleAt(plan: SpinPlan, seconds: number): number {
  const remaining = 1 - Math.min(1, Math.max(0, seconds / plan.duration));
  return plan.start + plan.distance * (1 - remaining ** POWER);
}

/** Velocidad angular en grados por segundo, con signo. */
export function velocityAt(plan: SpinPlan, seconds: number): number {
  const remaining = 1 - Math.min(1, Math.max(0, seconds / plan.duration));
  return ((plan.distance * POWER) / plan.duration) * remaining ** (POWER - 1);
}

function smoothstep(from: number, to: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - from) / (to - from)));
  return t * t * (3 - 2 * t);
}

/** Acercamiento hacia el puntero: empieza a medio giro y llega al máximo justo antes de parar. */
export const zoomAt = (progress: number) => 1 + 0.22 * smoothstep(0.45, 0.96, progress);

/** La lengüeta como resorte amortiguado: cada clavija que pasa la empuja y el resorte la regresa. */
export class Flapper {
  angle = 0;
  private velocity = 0;

  kick(speed: number, direction: number) {
    this.velocity -= direction * Math.min(1000, 240 + speed * 0.3);
  }

  step(dt: number) {
    this.velocity += (-950 * this.angle - 22 * this.velocity) * dt;
    this.angle = Math.min(32, Math.max(-32, this.angle + this.velocity * dt));
  }

  reset() {
    this.angle = 0;
    this.velocity = 0;
  }
}

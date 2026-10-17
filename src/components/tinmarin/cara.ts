// La cara de la rueda se dibuja una sola vez en un canvas aparte (como WheelFace.kt en la app). En pantalla
// solo se rota: girar una rueda de mil casillas cuesta lo mismo que girar una de ocho.

import type { Slice } from "@/lib/tinmarin/rueda";
import { DISPLAY, feria, sobre } from "./feria";

/** Por debajo de este tamaño de letra (px CSS) un nombre ya no se lee: la casilla va sin texto. */
const MIN_LABEL = 7.5;
const MAX_SEPARATORS = 180;
export const MAX_PEGS = 40;

const rad = (deg: number) => (deg * Math.PI) / 180;

/**
 * @param size lado del canvas en pixeles reales.
 * @param unit pixeles reales por px CSS, para que bordes y letras midan lo mismo en cualquier pantalla.
 */
export function renderFace(slices: Slice[], size: number, unit: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  if (slices.length === 0) return canvas;
  const c = size / 2;
  const rimWidth = feria.borde * 1.7 * unit;
  const radius = c - 1 - rimWidth / 2;
  const colors = feria.casillas;
  const count = slices.length;

  if (count === 1) {
    ctx.fillStyle = colors[slices[0].color % colors.length];
    ctx.beginPath();
    ctx.arc(c, c, radius, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Un cuarto de grado de traslape tapa la costura que deja el suavizado entre dos casillas.
    const overlap = count > 720 ? 0 : 0.25;
    const wedge = (start: number, sweep: number, color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(c, c);
      ctx.arc(c, c, radius, rad(start), rad(start + sweep));
      ctx.closePath();
      ctx.fill();
    };
    for (const s of slices) wedge(s.start, s.sweep + overlap, colors[s.color % colors.length]);
    // La primera casilla se repinta en su inicio para que el traslape de la última no la muerda.
    wedge(slices[0].start, Math.min(slices[0].sweep, 1), colors[slices[0].color % colors.length]);
  }

  if (count >= 2 && count <= MAX_SEPARATORS) {
    const narrowest = Math.min(...slices.map((s) => s.sweep));
    ctx.strokeStyle = feria.tinta;
    ctx.lineCap = "round";
    // En ruedas apretadas la línea adelgaza para no comerse las casillas.
    ctx.lineWidth = Math.max(1, Math.min(feria.borde * unit, radius * Math.sin(rad(narrowest / 2)) * 0.5));
    ctx.beginPath();
    for (const s of slices) {
      ctx.moveTo(c, c);
      ctx.lineTo(c + radius * Math.cos(rad(s.start)), c + radius * Math.sin(rad(s.start)));
    }
    ctx.stroke();
  }

  const pegs = count >= 2 && count <= MAX_PEGS;
  drawLabels(ctx, slices, c, radius, unit, pegs);

  ctx.strokeStyle = feria.tinta;
  ctx.lineWidth = rimWidth;
  ctx.beginPath();
  ctx.arc(c, c, radius, 0, Math.PI * 2);
  ctx.stroke();

  if (pegs) {
    const pegRadius = 3.4 * unit;
    const ring = radius - rimWidth / 2 - pegRadius * 1.9;
    ctx.fillStyle = feria.eje;
    ctx.strokeStyle = feria.tinta;
    ctx.lineWidth = Math.max(1, feria.borde * 0.7 * unit);
    for (const s of slices) {
      ctx.beginPath();
      ctx.arc(c + ring * Math.cos(rad(s.start)), c + ring * Math.sin(rad(s.start)), pegRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
  return canvas;
}

/**
 * Los nombres van a lo largo del radio y terminan cerca del borde, así el que queda bajo el puntero (a la
 * derecha) se lee horizontal. Cada uno usa la letra más grande que quepa: hacia el centro la casilla se
 * angosta, así que un nombre largo obliga a una letra más chica.
 */
function drawLabels(ctx: CanvasRenderingContext2D, slices: Slice[], c: number, radius: number, unit: number, pegs: boolean) {
  const rOut = radius * (pegs ? 0.885 : 0.93);
  const rIn = radius * 0.25;
  const minSize = MIN_LABEL * unit;
  const maxSize = radius * 0.2;
  const font = (size: number) => `condensed 800 ${size}px ${DISPLAY}`;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  for (const s of slices) {
    const sinHalf = Math.sin(rad(Math.min(s.sweep, 180) / 2));
    let size = Math.min(maxSize, 2 * rOut * sinHalf * 0.7);
    if (size < minSize) continue;
    let label = s.label;
    for (;;) {
      ctx.font = font(size);
      const room = roomFor(size, rOut, rIn, sinHalf);
      if (ctx.measureText(label).width <= room) break;
      if (size <= minSize) {
        label = ellipsize(ctx, label, room);
        break;
      }
      size = Math.max(minSize, size * 0.9);
    }
    if (!label) continue;
    ctx.fillStyle = sobre(feria.casillas[s.color % feria.casillas.length]);
    ctx.save();
    ctx.translate(c, c);
    // Con una sola casilla el centro del arco cae del lado opuesto al puntero y el nombre saldría de cabeza.
    ctx.rotate(slices.length === 1 ? 0 : rad(s.start + s.sweep / 2));
    ctx.fillText(label, rOut, 0);
    ctx.restore();
  }
}

/** Largo máximo de un texto de alto [size]: llega hasta donde la casilla todavía es tan alta como la letra. */
function roomFor(size: number, rOut: number, rIn: number, sinHalf: number): number {
  const narrowest = sinHalf >= 0.999 ? rIn : (size * 1.02) / (2 * sinHalf);
  return rOut - Math.max(narrowest, rIn);
}

function ellipsize(ctx: CanvasRenderingContext2D, text: string, room: number): string {
  if (room <= 0) return "";
  const dots = "…";
  let fit = text.length;
  while (fit > 0 && ctx.measureText(text.slice(0, fit) + dots).width > room) fit--;
  return fit <= 0 ? "" : text.slice(0, fit).trimEnd() + dots;
}

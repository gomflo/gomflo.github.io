// La imagen del resultado (ResultCard.kt): el nombre enorme sobre el color de la casilla que ganó, con el
// acta mínima debajo. Vertical de 1080 × 1350, lista para mandar al grupo.

import { DISPLAY, TEXTO, feria, sobre } from "./feria";

export type Acta = {
  wheelName: string;
  label: string;
  color: string;
  place: number | null;
  participants: number;
  tickets: number;
  timestamp: number;
  code: string;
  hash: string;
};

export const fechaHora = (timestamp: number, seconds = false) =>
  new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    ...(seconds ? { second: "2-digit" } : {}),
  })
    .format(timestamp)
    .replace(",", "");

export const entre = (participants: number, tickets: number) =>
  `entre ${participants.toLocaleString("es-MX")} ${participants === 1 ? "participante" : "participantes"}` +
  (tickets !== participants ? ` · ${tickets.toLocaleString("es-MX")} boletos` : "");

/** Mezcla [color] sobre [base] con [alpha]: el chip del código es el fondo con un velo del color del texto. */
function veil(base: string, color: string, alpha: number) {
  const mix = [1, 3, 5].map((i) => {
    const b = parseInt(base.slice(i, i + 2), 16);
    const c = parseInt(color.slice(i, i + 2), 16);
    return Math.round(b + (c - b) * alpha);
  });
  return `rgb(${mix.join(",")})`;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, width: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= width || !line) line = next;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function spaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number) {
  const chars = [...text];
  const width = chars.reduce((w, ch) => w + ctx.measureText(ch).width, 0) + spacing * (chars.length - 1);
  let cursor = x - width / 2;
  ctx.textAlign = "left";
  for (const ch of chars) {
    ctx.fillText(ch, cursor, y);
    cursor += ctx.measureText(ch).width + spacing;
  }
  ctx.textAlign = "center";
}

function logo(ctx: CanvasRenderingContext2D, x: number, y: number, ink: string) {
  ctx.font = `800 46px ${DISPLAY}`;
  const label = "Tin Marín";
  const text = ctx.measureText(label).width;
  const r = 26;
  const total = r * 2 + 18 + text;
  const cx = x - total / 2 + r;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(cx, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    ctx.moveTo(cx + Math.cos(a) * 6, y + Math.sin(a) * 6);
    ctx.lineTo(cx + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  ctx.stroke();
  ctx.fillStyle = ink;
  ctx.textAlign = "left";
  ctx.fillText(label, cx + r + 18, y + 2);
  ctx.textAlign = "center";
}

export async function drawCard(acta: Acta): Promise<Blob> {
  await document.fonts?.ready;
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const on = sobre(acta.color);
  const soft = (alpha: number) => veil(acta.color, on, alpha);
  ctx.fillStyle = acta.color;
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = soft(0.9);
  ctx.font = `800 50px ${DISPLAY}`;
  ctx.fillText(acta.wheelName, W / 2, 148, W - 160);

  ctx.fillStyle = soft(0.75);
  ctx.font = `700 40px ${TEXTO}`;
  spaced(ctx, (acta.place ? `${acta.place}.º lugar` : "Ganó").toUpperCase(), W / 2, 245, 7);

  // El nombre: la letra más grande que deje entera la palabra más larga, en hasta tres renglones.
  const room = W - 140;
  let size = 300;
  let lines: string[] = [];
  for (; size > 60; size -= 6) {
    ctx.font = `condensed 800 ${size}px ${DISPLAY}`;
    const longest = Math.max(...acta.label.split(/\s+/).map((w) => ctx.measureText(w).width));
    lines = wrap(ctx, acta.label, room);
    if (longest <= room && lines.length <= 3 && lines.length * size * 0.98 <= 420) break;
  }
  ctx.fillStyle = on;
  const lineHeight = size * 0.98;
  const top = 500 - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, i) => ctx.fillText(line, W / 2, top + i * lineHeight, room));

  ctx.fillStyle = on;
  ctx.font = `700 46px ${TEXTO}`;
  ctx.fillText(entre(acta.participants, acta.tickets), W / 2, 760, W - 120);
  ctx.fillStyle = soft(0.78);
  ctx.font = `400 46px ${TEXTO}`;
  ctx.fillText(fechaHora(acta.timestamp, true), W / 2, 828);

  const chip = { w: 660, h: 165, x: (W - 660) / 2, y: 900 };
  ctx.beginPath();
  ctx.roundRect(chip.x, chip.y, chip.w, chip.h, 36);
  ctx.fillStyle = soft(0.12);
  ctx.fill();
  ctx.lineWidth = 7;
  ctx.strokeStyle = feria.tinta;
  ctx.stroke();
  ctx.fillStyle = soft(0.7);
  ctx.font = `500 38px ${TEXTO}`;
  ctx.fillText("Código del sorteo", W / 2, chip.y + 52);
  ctx.fillStyle = on;
  ctx.font = `500 44px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
  spaced(ctx, acta.code, W / 2, chip.y + 112, 2);

  ctx.fillStyle = soft(0.78);
  ctx.font = `400 38px ${TEXTO}`;
  ctx.fillText(`Huella de la lista: ${acta.hash}`, W / 2, 1126);

  logo(ctx, W / 2, 1244, on);

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("No se pudo crear la imagen"))), "image/png"));
}

/** Comparte la imagen con el menú del sistema; si el navegador no puede, la descarga. */
export async function shareCard(acta: Acta): Promise<"shared" | "downloaded"> {
  const blob = await drawCard(acta);
  const name = `tinmarin-${acta.code}.png`;
  const file = new File([blob], name, { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: `Ganó ${acta.label}` });
      return "shared";
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return "shared";
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return "downloaded";
}

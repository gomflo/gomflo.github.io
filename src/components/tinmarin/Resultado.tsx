// El momento del sorteo (Reveal.kt): el color de la casilla ganadora crece desde la punta del puntero hasta
// llenar la pantalla, el nombre entra con rebote y cae confeti. Debajo queda el acta mínima.

import { useEffect, useLayoutEffect, useRef } from "react";
import { DISPLAY, feria, sobre } from "./feria";
import { entre, fechaHora } from "./tarjeta";

export type RevealInfo = {
  key: number;
  label: string;
  color: string;
  place: number | null;
  participants: number;
  tickets: number;
  timestamp: number;
  code: string;
  /** Cuántos quedan en la ruleta, en modo "sacar al ganador". */
  remaining: number | null;
  /** En los primeros sorteos se explica para qué sirve el código; después estorba. */
  hint: boolean;
};

type Props = {
  info: RevealInfo;
  origin: { x: number; y: number };
  onAgain: (() => void) | null;
  onShare: () => void;
  onClose: () => void;
  onCopy: () => void;
  /** Mientras la ruleta sigue con los nombres de ejemplo, lo que toca es poner la lista propia. */
  onOwnNames: (() => void) | null;
};

const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Dos cañones desde las esquinas de abajo y un remate que cae desde arriba. */
function confetti(canvas: HTMLCanvasElement, colors: string[]) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext("2d")!;
  type P = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
    vr: number;
    s: number;
    c: string;
    born: number;
  };
  const pieces: P[] = [];
  const power = Math.max(900, h * 2.1);
  const burst = (x: number, y: number, count: number, angle: number, spread: number, speed: number, delay: number) => {
    for (let i = 0; i < count; i++) {
      const a = ((angle + (Math.random() - 0.5) * spread) * Math.PI) / 180;
      const v = speed * (0.45 + Math.random() * 0.55);
      pieces.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        r: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 14,
        s: 7 + Math.random() * 7,
        c: colors[i % colors.length],
        born: delay,
      });
    }
  };
  burst(0, h, 60, -62, 46, power, 200);
  burst(w, h, 60, -118, 46, power, 200);
  burst(w / 2, -20, 50, 90, 150, power * 0.3, 460);
  let start = 0;
  let last = 0;
  let raf = 0;
  const frame = (now: number) => {
    if (!start) start = last = now;
    const dt = Math.min(0.04, (now - last) / 1000);
    last = now;
    const t = now - start;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    let alive = false;
    for (const p of pieces) {
      if (t < p.born) {
        alive = true;
        continue;
      }
      p.vy += 1500 * dt;
      p.vx *= 1 - 1.6 * dt;
      p.vy *= 1 - 1.2 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.r += p.vr * dt;
      if (p.y < h + 30) alive = true;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.scale(1, Math.cos(p.r * 1.7));
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * 0.66);
      ctx.restore();
    }
    if (alive && t < 6000) raf = requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, w, h);
  };
  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}

export default function Resultado({ info, origin, onAgain, onShare, onClose, onCopy, onOwnNames }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const name = useRef<HTMLParagraphElement>(null);
  const primary = useRef<HTMLButtonElement>(null);
  const confettiRef = useRef<HTMLCanvasElement>(null);
  const on = sobre(info.color);

  // El nombre usa la letra más grande que deje entera a su palabra más larga, en hasta tres renglones.
  useLayoutEffect(() => {
    const el = name.current;
    if (!el) return;
    const fit = () => {
      const room = el.clientWidth;
      const probe = document.createElement("canvas").getContext("2d")!;
      probe.font = `condensed 800 100px ${DISPLAY}`;
      const longest = Math.max(...info.label.split(/\s+/).map((w) => probe.measureText(w).width));
      // El espacio es el del bloque de arriba, que crece hasta llenar la pantalla, menos su título.
      const area = el.parentElement!.parentElement!;
      const maxHeight = area.clientHeight - (area.firstElementChild as HTMLElement).offsetHeight - 10;
      // 132 es el tope de la app en un teléfono; en una pantalla grande el nombre puede crecer con ella.
      const cap = Math.max(132, innerHeight * 0.3);
      let size = Math.min(cap, Math.max(13, ((100 * room) / Math.max(1, longest)) * 0.97));
      el.style.fontSize = `${size}px`;
      while (size > 26 && (el.scrollHeight > maxHeight || el.scrollHeight > size * 0.98 * 3 + 4)) {
        size -= 2;
        el.style.fontSize = `${size}px`;
      }
    };
    fit();
    document.fonts?.ready.then(fit);
    const observer = new ResizeObserver(fit);
    observer.observe(el.parentElement!.parentElement!);
    return () => observer.disconnect();
  }, [info.key, info.label]);

  useEffect(() => {
    const el = root.current!;
    const reach = Math.hypot(Math.max(origin.x, innerWidth - origin.x), Math.max(origin.y, innerHeight - origin.y));
    el.style.setProperty("--x", `${origin.x}px`);
    el.style.setProperty("--y", `${origin.y}px`);
    el.style.setProperty("--alcance", `${reach + 2}px`);
    requestAnimationFrame(() => el.classList.add("is-abierto"));
    const focus = setTimeout(() => primary.current?.focus({ preventScroll: true }), calm() ? 0 : 320);
    const stop = calm()
      ? undefined
      : confetti(
          confettiRef.current!,
          [...feria.casillas, "#FFFFFF"].filter((c) => c !== info.color),
        );
    return () => {
      clearTimeout(focus);
      stop?.();
    };
  }, [info.key]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // Foco atrapado: el resultado tapa toda la pantalla y lo de abajo no debe recibir foco.
      if (e.key === "Tab") {
        const items = root.current!.querySelectorAll<HTMLElement>("button");
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, [onClose]);

  const heading = info.place ? `${info.place}.º lugar` : "Ganó";
  const again = info.remaining !== null ? "Sortear el siguiente" : "Girar otra vez";
  const left =
    info.remaining === null
      ? null
      : info.remaining > 0
        ? `${info.remaining === 1 ? "Queda" : "Quedan"} ${info.remaining.toLocaleString("es-MX")} en la ruleta`
        : "Era el último de la ruleta";

  return (
    <div
      ref={root}
      className="tm-resultado"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tm-resultado-titulo tm-resultado-nombre"
      style={{ "--casilla": info.color, "--sobre": on } as React.CSSProperties}
    >
      <p className="tm-sr" aria-live="assertive">
        {info.place ? `${info.place}.º lugar: ${info.label}` : `Ganó ${info.label}`}
      </p>
      <canvas ref={confettiRef} className="tm-confeti" aria-hidden="true" />
      <div className="tm-resultado__contenido">
        <button type="button" className="tm-burbuja tm-resultado__cerrar" onClick={onClose} aria-label="Cerrar">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
        <div className="tm-resultado__arriba">
          <p id="tm-resultado-titulo" className="tm-resultado__titulo">
            {heading}
          </p>
          <div className="tm-resultado__caja">
            <p ref={name} id="tm-resultado-nombre" className="tm-resultado__nombre">
              {info.label}
            </p>
          </div>
        </div>
        <div className="tm-resultado__acta">
          <p className="tm-resultado__entre">{entre(info.participants, info.tickets)}</p>
          <p className="tm-resultado__fecha">{fechaHora(info.timestamp)}</p>
          <button type="button" className="tm-codigo" onClick={onCopy}>
            <span className="tm-codigo__etiqueta">Código del sorteo</span>
            <span className="tm-codigo__valor">{info.code}</span>
            <span className="tm-sr">. Toca para copiarlo</span>
          </button>
          {info.hint && <p className="tm-resultado__nota">Con este código y la misma lista, el sorteo se repite igual.</p>}
          {left && <p className="tm-resultado__nota">{left}</p>}
        </div>
        <div className="tm-resultado__acciones">
          {onOwnNames ? (
            <>
              <button ref={primary} type="button" className="tm-boton tm-boton--sobre" onClick={onOwnNames}>
                Poner mis nombres
              </button>
              {onAgain && (
                <button type="button" className="tm-boton tm-boton--suave" onClick={onAgain}>
                  {again}
                </button>
              )}
            </>
          ) : (
            <>
              {onAgain && (
                <button ref={primary} type="button" className="tm-boton tm-boton--sobre" onClick={onAgain}>
                  {again}
                </button>
              )}
              <button ref={onAgain ? undefined : primary} type="button" className="tm-boton tm-boton--suave" onClick={onShare}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
                </svg>
                Compartir imagen
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

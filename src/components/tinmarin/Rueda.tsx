// La rueda en pantalla (WheelStage.kt y SpinController.kt de la app): sombra, cara ya dibujada que solo se
// rota, eje y lengüeta. Se gira arrastrando y soltando, tocándola o con Enter. Durante un giro React no
// vuelve a pintar nada: rotación, acercamiento y lengüeta se escriben directo en el canvas.

import { useEffect, useImperativeHandle, useRef, type Ref, type RefObject } from "react";
import { newSeed, pick } from "@/lib/tinmarin/sorteo";
import {
  Flapper,
  angleAt,
  createPlan,
  indexUnderPointer,
  normalize,
  rotationFor,
  velocityAt,
  zoomAt,
  type Slice,
  type SpinPlan,
} from "@/lib/tinmarin/rueda";
import { renderFace } from "./cara";
import { feria, sobre } from "./feria";
import { buzz, play, prepareSounds, warmSounds } from "./sonido";

export type Outcome = {
  seed: bigint;
  index: number;
  slice: Slice;
  slices: Slice[];
  plan: SpinPlan;
};

export type RuedaHandle = {
  spin: (fling?: number) => void;
  /** Regresa el acercamiento y la lengüeta a su reposo. Se llama al cerrar el resultado. */
  relax: () => void;
  /** Punta del puntero en coordenadas de la ventana: de ahí crece el color del ganador. */
  tip: () => { x: number; y: number };
};

type Props = {
  ref?: Ref<RuedaHandle>;
  slices: Slice[];
  enabled: boolean;
  sound: boolean;
  description: string;
  /** Donde se va leyendo el nombre bajo el puntero mientras gira. */
  pointerOut: RefObject<HTMLElement | null>;
  onStart: () => void;
  onResult: (outcome: Outcome) => void;
};

const SECONDS = 6;
const OVERHANG = 24;
const SOUND_GAP = 26;
const HAPTIC_GAP = 48;
const SETTLE = 420;
const MIN_FLING = 260;
const ENTER_SWEEP = 46;

const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

function geometry(width: number, height: number) {
  const radius = Math.max(1, Math.min(width - OVERHANG, height) / 2 - 4);
  const cx = (width - OVERHANG) / 2;
  const cy = height / 2;
  return { radius, cx, cy, tipX: cx + radius * 0.87, hub: radius * 0.17 };
}

export default function Rueda({ ref, slices, enabled, sound, description, pointerOut, onStart, onResult }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useRef({
    rotation: 0,
    zoom: 1,
    flapper: new Flapper(),
    spinning: false,
    face: null as HTMLCanvasElement | null,
    size: { width: 0, height: 0 },
    pointer: -1,
    lastSound: 0,
    lastHaptic: 0,
  });
  const live = useRef({ slices, enabled, sound, onStart, onResult });
  live.current = { slices, enabled, sound, onStart, onResult };

  const writePointer = (index: number) => {
    const s = state.current;
    if (index === s.pointer) return;
    s.pointer = index;
    const label = live.current.slices[index]?.label;
    if (pointerOut.current && label !== undefined) pointerOut.current.textContent = label;
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const s = state.current;
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = s.size;
    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    if (width === 0) return;
    const g = geometry(width, height);

    // El acercamiento crece desde la punta del puntero: lo que se agranda es justo lo que decide.
    canvas.style.transformOrigin = `${g.tipX}px ${g.cy}px`;
    canvas.style.transform = s.zoom === 1 ? "" : `scale(${s.zoom})`;

    ctx.fillStyle = feria.tinta;
    ctx.beginPath();
    ctx.arc(g.cx, g.cy + 8, g.radius, 0, Math.PI * 2);
    ctx.fill();

    if (s.face && live.current.slices.length > 0) {
      ctx.save();
      ctx.translate(g.cx, g.cy);
      ctx.rotate((s.rotation * Math.PI) / 180);
      ctx.drawImage(s.face, -g.radius, -g.radius, g.radius * 2, g.radius * 2);
      ctx.restore();
    } else {
      ctx.fillStyle = feria.superficieAlt;
      ctx.strokeStyle = feria.tinta;
      ctx.lineWidth = feria.borde * 1.7;
      ctx.beginPath();
      ctx.arc(g.cx, g.cy, g.radius - feria.borde, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Eje.
    ctx.lineWidth = feria.borde;
    ctx.fillStyle = feria.tinta;
    ctx.beginPath();
    ctx.arc(g.cx, g.cy + 3, g.hub, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = feria.eje;
    ctx.strokeStyle = feria.tinta;
    ctx.beginPath();
    ctx.arc(g.cx, g.cy, g.hub, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = feria.acento;
    ctx.beginPath();
    ctx.arc(g.cx, g.cy, g.hub * 0.34, 0, Math.PI * 2);
    ctx.fill();

    // Lengüeta: una púa que apunta a la izquierda y pivota en su extremo derecho.
    const tip = { x: g.tipX, y: g.cy };
    const length = g.radius * 0.13 + OVERHANG;
    const half = length * 0.36;
    const pivotX = tip.x + length * 0.78;
    const path = new Path2D();
    path.moveTo(tip.x, tip.y);
    path.bezierCurveTo(tip.x + length * 0.34, tip.y - half * 0.5, tip.x + length * 0.5, tip.y - half, pivotX, tip.y - half);
    path.bezierCurveTo(tip.x + length * 1.07, tip.y - half, tip.x + length * 1.07, tip.y + half, pivotX, tip.y + half);
    path.bezierCurveTo(tip.x + length * 0.5, tip.y + half, tip.x + length * 0.34, tip.y + half * 0.5, tip.x, tip.y);
    path.closePath();
    ctx.save();
    ctx.translate(pivotX, tip.y);
    ctx.rotate((s.flapper.angle * Math.PI) / 180);
    ctx.translate(-pivotX, -tip.y);
    ctx.save();
    ctx.translate(0, 3);
    ctx.fillStyle = feria.tinta;
    ctx.fill(path);
    ctx.restore();
    ctx.fillStyle = feria.acento;
    ctx.fill(path);
    ctx.lineJoin = "round";
    ctx.strokeStyle = feria.tinta;
    ctx.stroke(path);
    ctx.fillStyle = sobre(feria.acento);
    ctx.beginPath();
    ctx.arc(pivotX, tip.y, half * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const repaintFace = () => {
    const s = state.current;
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = s.size;
    if (width === 0) return;
    const { radius } = geometry(width, height);
    s.face = renderFace(live.current.slices, Math.round(radius * 2 * dpr), dpr);
    draw();
  };

  /** Clavija que pasa: suena, vibra y empuja la lengüeta, con tope de ritmo para que no se vuelva zumbido. */
  const tick = (speed: number, direction: number, now: number) => {
    const s = state.current;
    if (live.current.sound && now - s.lastSound >= SOUND_GAP) {
      s.lastSound = now;
      const fast = Math.min(1, speed / 2600);
      play("tic", 0.86 + 0.5 * fast, 0.6 + 0.4 * fast);
    }
    if (live.current.sound && now - s.lastHaptic >= HAPTIC_GAP) {
      s.lastHaptic = now;
      buzz(6);
    }
    if (!reducedMotion()) s.flapper.kick(speed, direction);
  };

  /** Fuera de un giro (al arrastrar) la lengüeta se asienta en su propio ciclo hasta quedar quieta. */
  const idle = useRef(0);
  const wakeFlapper = () => {
    if (idle.current) return;
    let last = 0;
    const step = (now: number) => {
      const s = state.current;
      if (s.spinning) return void (idle.current = 0);
      const dt = last === 0 ? 1 / 60 : Math.min(0.05, (now - last) / 1000);
      last = now;
      s.flapper.step(dt);
      draw();
      if (Math.abs(s.flapper.angle) > 0.02) idle.current = requestAnimationFrame(step);
      else {
        s.flapper.reset();
        draw();
        idle.current = 0;
      }
    };
    idle.current = requestAnimationFrame(step);
  };

  const spin = (fling = 0) => {
    const s = state.current;
    const current = live.current.slices;
    if (s.spinning || current.length === 0 || !live.current.enabled) return;
    prepareSounds();
    s.spinning = true;
    // El ganador sale aquí, antes de mover la rueda. El gesto solo cambia cuánto y hacia dónde gira.
    const seed = newSeed();
    const result = pick(
      seed,
      current.map((x) => x.weight),
    );
    const plan = createPlan(s.rotation, rotationFor(current, result.index, result.fraction), fling, SECONDS, Math.random());
    const calm = reducedMotion();
    live.current.onStart();
    let start = 0;
    let last = 0;
    let lastIndex = s.pointer;
    let settleFrom = 0;
    const frame = (now: number) => {
      if (start === 0) {
        start = now;
        last = now;
      }
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      const t = (now - start) / 1000;
      if (settleFrom === 0) {
        const angle = angleAt(plan, t);
        const speed = Math.abs(velocityAt(plan, t));
        s.rotation = angle;
        const index = indexUnderPointer(current, angle);
        if (index !== lastIndex) {
          lastIndex = index;
          writePointer(index);
          tick(speed, Math.sign(plan.distance), now);
        }
        if (!calm) {
          s.flapper.step(dt);
          s.zoom = zoomAt(t / plan.duration);
        }
        if (t >= plan.duration) settleFrom = now;
      } else if (!calm) {
        s.flapper.step(dt);
      }
      draw();
      // La lengüeta termina de asentarse antes de anunciar al ganador: ese instante es el suspenso.
      if (settleFrom !== 0 && (calm || now - settleFrom > SETTLE)) {
        s.rotation = normalize(plan.start + plan.distance);
        writePointer(result.index);
        s.spinning = false;
        live.current.onResult({
          seed,
          index: result.index,
          slice: current[result.index],
          slices: current,
          plan,
        });
        return;
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };

  const relax = () => {
    const s = state.current;
    s.flapper.reset();
    const from = s.zoom;
    if (from === 1) return draw();
    const begin = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - begin) / 380);
      const eased = 1 - (1 - p) ** 3;
      s.zoom = from + (1 - from) * eased;
      draw();
      if (p < 1 && !s.spinning) requestAnimationFrame(step);
      else if (p >= 1) s.zoom = 1;
    };
    requestAnimationFrame(step);
  };

  useImperativeHandle(ref, () => ({
    spin,
    relax,
    tip: () => {
      const canvas = canvasRef.current!;
      const box = canvas.parentElement!.getBoundingClientRect();
      const g = geometry(box.width, box.height);
      return { x: box.left + g.tipX, y: box.top + g.cy };
    },
  }));

  // Tamaño del lienzo y entrada de la rueda: llega girando un tramo corto y se asienta con rebote.
  // El audio se prepara en un momento ocioso después de cargar, para que el primer giro no espere al contexto.
  useEffect(() => {
    let idle = 0;
    const timer = window.setTimeout(() => {
      if ("requestIdleCallback" in window) idle = requestIdleCallback(() => warmSounds(), { timeout: 2000 });
      else warmSounds();
    }, 3000);
    return () => {
      clearTimeout(timer);
      if (idle) cancelIdleCallback(idle);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const box = canvas.parentElement!;
    const observer = new ResizeObserver(() => {
      const rect = box.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      state.current.size = { width: rect.width, height: rect.height };
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      repaintFace();
    });
    observer.observe(box);
    // La cara usa Bricolage: si se dibuja antes de que cargue, sale con la letra del sistema.
    document.fonts?.load(`condensed 800 20px "Bricolage Grotesque"`).then(repaintFace, () => {});

    let raf = 0;
    if (!reducedMotion()) {
      const s = state.current;
      const rest = s.rotation;
      let x = -ENTER_SWEEP;
      let v = 0;
      let last = 0;
      const step = (now: number) => {
        const dt = last === 0 ? 1 / 60 : Math.min(0.05, (now - last) / 1000);
        last = now;
        // Resorte "wobbly" de la app: poca rigidez y amortiguamiento bajo.
        v += (-180 * x - 2 * 0.4 * Math.sqrt(180) * v) * dt;
        x += v * dt;
        if (s.spinning) return;
        s.rotation = rest + x;
        draw();
        if (Math.abs(x) > 0.05 || Math.abs(v) > 0.05) raf = requestAnimationFrame(step);
        else {
          s.rotation = rest;
          draw();
        }
      };
      raf = requestAnimationFrame(step);
    }
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const s = state.current;
    s.pointer = -1;
    repaintFace();
    if (slices.length > 0) writePointer(Math.max(0, indexUnderPointer(slices, s.rotation)));
  }, [slices]);

  // Arrastre: la rueda sigue al dedo y al soltar hereda su velocidad. Un toque sin arrastre la gira.
  useEffect(() => {
    const canvas = canvasRef.current!;
    let drag: null | {
      id: number;
      previous: number;
      travelled: number;
      dragging: boolean;
      total: number;
      samples: { t: number; a: number }[];
      x: number;
      y: number;
    } = null;

    const center = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      const g = geometry(rect.width, rect.height);
      return { x: rect.left + g.cx, y: rect.top + g.cy, radius: g.radius };
    };
    const angleOf = (x: number, y: number) => {
      const c = center();
      return (Math.atan2(y - c.y, x - c.x) * 180) / Math.PI;
    };
    const shortest = (d: number) => {
      let a = d % 360;
      if (a > 180) a -= 360;
      if (a < -180) a += 360;
      return a;
    };

    const down = (e: PointerEvent) => {
      if (!live.current.enabled || state.current.spinning || e.button !== 0) return;
      const c = center();
      if (Math.hypot(e.clientX - c.x, e.clientY - c.y) > c.radius * 1.08) return;
      prepareSounds();
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        // Sin captura el gesto sigue funcionando mientras el dedo no salga del lienzo.
      }
      drag = {
        id: e.pointerId,
        previous: angleOf(e.clientX, e.clientY),
        travelled: 0,
        dragging: false,
        total: 0,
        samples: [],
        x: e.clientX,
        y: e.clientY,
      };
    };
    const move = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      drag.travelled += Math.hypot(e.clientX - drag.x, e.clientY - drag.y);
      drag.x = e.clientX;
      drag.y = e.clientY;
      if (!drag.dragging && drag.travelled > 8) drag.dragging = true;
      if (!drag.dragging) return;
      const angle = angleOf(e.clientX, e.clientY);
      const delta = shortest(angle - drag.previous);
      drag.previous = angle;
      drag.total += delta;
      const s = state.current;
      s.rotation += delta;
      const index = indexUnderPointer(live.current.slices, s.rotation);
      if (index !== s.pointer && index >= 0) {
        writePointer(index);
        tick(500, delta < 0 ? -1 : 1, e.timeStamp);
      }
      draw();
      wakeFlapper();
      drag.samples.push({ t: e.timeStamp, a: drag.total });
      if (drag.samples.length > 16) drag.samples.shift();
    };
    const up = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const finished = drag;
      drag = null;
      if (e.type === "pointercancel") return;
      if (!finished.dragging) return spin(0);
      // Velocidad angular de los últimos 90 ms del gesto, en grados por segundo.
      const samples = finished.samples;
      if (samples.length < 2) return;
      const newest = samples[samples.length - 1];
      let oldest = newest;
      for (let i = samples.length - 2; i >= 0; i--) {
        if (newest.t - samples[i].t > 90) break;
        oldest = samples[i];
      }
      const dt = (newest.t - oldest.t) / 1000;
      // Si el dedo se quedó quieto antes de soltar, ya no hay impulso.
      const still = e.timeStamp - newest.t > 90;
      const velocity = dt <= 0.008 || still ? 0 : (newest.a - oldest.a) / dt;
      if (Math.abs(velocity) >= MIN_FLING) spin(velocity);
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
    };
  }, []);

  return (
    <div className="tm-escenario">
      <canvas
        ref={canvasRef}
        role="button"
        tabIndex={enabled && slices.length > 0 ? 0 : -1}
        aria-label={description}
        aria-disabled={!enabled || slices.length === 0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            // Un turno después, para que entre lo que estaba a medio escribir en la lista.
            setTimeout(() => spin(0));
          }
        }}
      />
    </div>
  );
}

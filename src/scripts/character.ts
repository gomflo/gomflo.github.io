/**
 * Personalidad del sitio:
 * - Los ojos (`[data-eyes]` con pupilas `[data-pupil]`) siguen al puntero,
 *   parpadean y miran alrededor cuando nadie se mueve.
 * - El rosetón (`[data-rosette]`) gira sus pétalos con el puntero y da una
 *   vuelta completa al hacer clic.
 * - Los escenarios de motivo (`[data-motif-stage]`) reproducen su animación
 *   al cargar y la repiten al pasar el puntero.
 */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

interface EyeRig {
  el: SVGGElement;
  pupils: SVGElement[];
  range: number;
  x: number;
  y: number;
  tx: number;
  ty: number;
}

const rigs: EyeRig[] = Array.from(
  document.querySelectorAll<SVGGElement>("[data-eyes]"),
).map((el) => ({
  el,
  pupils: Array.from(el.querySelectorAll<SVGElement>("[data-pupil]")),
  range: Number(el.dataset.eyeRange ?? 2),
  x: 0,
  y: 0,
  tx: 0,
  ty: 0,
}));

const rosette = document.querySelector<HTMLElement>("[data-rosette]");
const petals = rosette?.querySelector<SVGGElement>("[data-rosette-petals]");
const ring = rosette?.querySelector<SVGGElement>("[data-rosette-ring]");
const spin = { cur: 0, target: 0, offset: 0 };

let pointer = { x: window.innerWidth / 2, y: window.innerHeight / 3 };
let lastMove = 0;
let frame = 0;

const aimRigs = () => {
  for (const rig of rigs) {
    const rect = rig.el.getBoundingClientRect();
    if (rect.width === 0) continue;
    const dx = pointer.x - (rect.left + rect.width / 2);
    const dy = pointer.y - (rect.top + rect.height / 2);
    const dist = Math.hypot(dx, dy) || 1;
    const reach = Math.min(dist / 220, 1) * rig.range;
    rig.tx = (dx / dist) * reach;
    rig.ty = (dy / dist) * reach;
  }
  const width = window.innerWidth;
  if (!reduceMotion.matches && width > 0) {
    spin.target = (pointer.x / width - 0.5) * 50 + spin.offset;
  }
};

const tick = () => {
  let moving = false;

  for (const rig of rigs) {
    rig.x += (rig.tx - rig.x) * 0.18;
    rig.y += (rig.ty - rig.y) * 0.18;
    if (Math.abs(rig.tx - rig.x) + Math.abs(rig.ty - rig.y) > 0.02) moving = true;
    const t = `translate(${rig.x.toFixed(2)} ${rig.y.toFixed(2)})`;
    for (const pupil of rig.pupils) pupil.setAttribute("transform", t);
  }

  if (petals && ring) {
    spin.cur += (spin.target - spin.cur) * 0.07;
    if (Math.abs(spin.target - spin.cur) > 0.02) moving = true;
    petals.setAttribute("transform", `rotate(${spin.cur.toFixed(2)} 200 200)`);
    ring.setAttribute("transform", `rotate(${(-spin.cur * 0.4).toFixed(2)} 200 200)`);
  }

  frame = moving ? requestAnimationFrame(tick) : 0;
};

const wake = () => {
  aimRigs();
  if (!frame) frame = requestAnimationFrame(tick);
};

const onPointer = (e: PointerEvent) => {
  pointer = { x: e.clientX, y: e.clientY };
  lastMove = performance.now();
  wake();
};

window.addEventListener("pointermove", onPointer, { passive: true });
window.addEventListener("pointerdown", onPointer, { passive: true });
window.addEventListener("scroll", wake, { passive: true });

/* Cuando nadie mueve el puntero, los ojos miran alrededor. */
const lookAround = () => {
  if (!document.hidden && performance.now() - lastMove > 4000) {
    pointer = {
      x: window.innerWidth * (0.15 + Math.random() * 0.7),
      y: window.innerHeight * (0.2 + Math.random() * 0.7),
    };
    wake();
  }
  window.setTimeout(lookAround, 2200 + Math.random() * 2500);
};

/* Parpadeo con ritmo irregular; a veces doble. */
const blink = () => {
  if (!document.hidden) {
    const twice = Math.random() < 0.2;
    for (const rig of rigs) rig.el.classList.add("is-blinking");
    window.setTimeout(() => {
      for (const rig of rigs) rig.el.classList.remove("is-blinking");
      if (twice) {
        window.setTimeout(() => {
          for (const rig of rigs) rig.el.classList.add("is-blinking");
          window.setTimeout(() => {
            for (const rig of rigs) rig.el.classList.remove("is-blinking");
          }, 110);
        }, 140);
      }
    }, 120);
  }
  window.setTimeout(blink, 2600 + Math.random() * 3800);
};

if (rigs.length) {
  wake();
  window.setTimeout(lookAround, 3000);
  window.setTimeout(blink, 1800);
}

/* Clic en el rosetón: vuelta completa y ojos felices. */
if (rosette) {
  let happyTimer = 0;
  rosette.addEventListener("click", () => {
    const face = rosette.querySelector("[data-eyes]");
    face?.classList.add("is-happy");
    window.clearTimeout(happyTimer);
    happyTimer = window.setTimeout(() => face?.classList.remove("is-happy"), 1100);
    if (reduceMotion.matches) return;
    spin.offset += 360;
    wake();
  });
}

/* Escenario de motivo en las páginas de herramienta. */
for (const stage of document.querySelectorAll<HTMLElement>("[data-motif-stage]")) {
  let timer = 0;
  const play = (delay: number) => {
    window.clearTimeout(timer);
    stage.removeAttribute("data-play");
    timer = window.setTimeout(() => stage.setAttribute("data-play", ""), delay);
  };
  play(350);
  stage.addEventListener("pointerenter", () => play(450));
}

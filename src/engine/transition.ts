// El color entre páginas: la pieza que tocaste llena la pantalla desde ese punto
// y, al llegar, se encoge hasta ser la cabeza de la página nueva ([data-cabeza]).
// El adaptador corre leave() mientras se descarga la página, así que casi no agrega espera.
import { gsap } from "gsap";
import { ease, prefersReducedMotion } from "./env";

type Origen = { x: number; y: number };
let origen: Origen = { x: 0, y: 0 };

const curtain = () => document.getElementById("curtain") as HTMLElement;
const nombre = (c: HTMLElement) => c.querySelector<HTMLElement>("[data-curtain-nombre]");

function leave(c: HTMLElement) {
  const { x, y } = origen;
  const radio = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 40;
  return gsap
    .timeline()
    .set(c, { autoAlpha: 1 })
    .fromTo(c, { clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${radio}px at ${x}px ${y}px)`, duration: 0.55, ease: ease.inOut })
    .fromTo(nombre(c), { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, ease: ease.out }, 0.2);
}

function enter(c: HTMLElement) {
  const destino = document.querySelector<HTMLElement>("[data-cabeza]");
  const r = destino?.getBoundingClientRect();
  // Sin cabeza a la vista, el color se recoge hacia arriba.
  const visible = r && r.bottom > 0 && r.top < innerHeight;
  const fin = visible
    ? `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px round ${getComputedStyle(destino!).borderTopLeftRadius})`
    : `inset(0px 0px ${innerHeight}px 0px round 0px)`;
  return gsap
    .timeline()
    .to(nombre(c), { autoAlpha: 0, duration: 0.15 })
    .fromTo(c, { clipPath: "inset(0px 0px 0px 0px round 0px)" }, { clipPath: fin, duration: 0.6, ease: ease.inOut }, 0)
    .to(c, { autoAlpha: 0, duration: 0.2 }, visible ? 0.5 : 0.6)
    .set(c, { clearProps: "clipPath" });
}

const reduced = {
  leave: (c: HTMLElement) => gsap.timeline().set(c, { autoAlpha: 1, clipPath: "none" }).fromTo(c, { opacity: 0 }, { opacity: 1, duration: 0.15 }),
  enter: (c: HTMLElement) => gsap.to(c, { autoAlpha: 0, duration: 0.15 }),
};

export const playLeave = () => Promise.resolve(prefersReducedMotion() ? reduced.leave(curtain()) : leave(curtain()));
export const playEnter = () => Promise.resolve(prefersReducedMotion() ? reduced.enter(curtain()) : enter(curtain()));

/** Prepara el color: de dónde sale, de qué categoría es y a dónde lleva. */
export const setCurtain = ({ label, cat, x, y }: { label: string; cat?: string } & Origen) => {
  const c = curtain();
  if (!c) return;
  origen = { x, y };
  if (cat) c.dataset.cat = cat;
  else delete c.dataset.cat;
  const el = nombre(c);
  if (el) el.textContent = label;
};
/** Quita el color sin animar (página restaurada desde el caché del navegador). */
export const resetCurtain = () => gsap.set(curtain(), { autoAlpha: 0 });

// Núcleo del motor: ciclo de vida de página, sin framework. Sin DOM al importar.
// El adaptador (astro.ts) llama:
//   boot(setup)           una vez, en la primera carga
//   leave() → cleanup()   antes de cambiar de ruta
//   enter()               con el DOM nuevo en su lugar
// El código del sitio se engancha con onPage(fn): corre en cada página dentro de
// un gsap.context, así que sus tweens y ScrollTriggers se revierten solos.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initScroll, resetScroll } from "./scroll";
import { initReveals } from "./reveal";
import { playEnter, playLeave } from "./transition";
import { prefersReducedMotion } from "./env";

export { onScroll, scrollState } from "./scroll";
export { resetCurtain, setCurtain } from "./transition";
export { ease, isTouch, isMobile, prefersReducedMotion } from "./env";

export type PageFn = (page: { intro: gsap.core.Timeline; path: string }) => void | (() => void);
const pageFns = new Set<PageFn>();
const cleanups: (() => void)[] = [];
let ctx: gsap.Context | null = null;
let intro: gsap.core.Timeline | null = null;
let ready = false;
let booted = false;

/** Corre fn en cada carga de página (y ahora, si ya hay una lista). Devuelve cómo darse de baja. */
export function onPage(fn: PageFn) {
  pageFns.add(fn);
  if (ready) runPageFn(fn);
  return () => {
    pageFns.delete(fn);
  };
}

function runPageFn(fn: PageFn) {
  ctx?.add(() => {
    const c = fn({ intro: intro!, path: location.pathname });
    if (typeof c === "function") cleanups.push(c);
  });
}

// Banderas en <html>. Astro reemplaza los atributos de <html> al navegar.
export function syncFlags() {
  const h = document.documentElement.classList;
  h.add("js", "is-booted");
  h.toggle("motion", !prefersReducedMotion());
}

function initPage() {
  syncFlags();
  ctx = gsap.context(() => {
    intro = initReveals(document);
  });
  ready = true;
  pageFns.forEach(runPageFn);
  requestAnimationFrame(() => ScrollTrigger.refresh());
}

/** Primera carga. `setup` corre una vez, antes de iniciar la primera página. */
export function boot(setup?: () => void) {
  if (booted) return;
  booted = true;
  syncFlags();
  initScroll();
  setup?.();
  initPage();
  intro?.play();
}

/** El color cubre la pantalla (resuelve cuando ya la cubrió). */
export async function leave() {
  await playLeave();
}

/** Desarma la página actual: revierte tweens y ScrollTriggers. */
export function cleanup() {
  if (!ready) return;
  ready = false;
  cleanups.splice(0).forEach((c) => c());
  ctx?.revert();
  ctx = null;
}

/** Inicia la página nueva. `transition: false` en atrás/adelante, donde no hubo leave. */
export async function enter({ transition = true, scrollTop = true } = {}) {
  if (!booted) return;
  cleanup();
  if (scrollTop) resetScroll();
  initPage();
  intro?.play();
  if (transition) await playEnter();
}

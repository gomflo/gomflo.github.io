// Scroll nativo (sin suavizado: aquí la gente trabaja en campos de texto), pero
// publicado en el mismo reloj: un ScrollTrigger global corre sobre gsap.ticker.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export type ScrollState = { y: number; velocity: number; progress: number };
const state: ScrollState = { y: 0, velocity: 0, progress: 0 };
const listeners = new Set<(s: ScrollState) => void>();
let feed: ScrollTrigger | null = null;

export function initScroll() {
  if (feed) return;
  feed = ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate(self) {
      state.y = self.scroll();
      state.velocity = self.getVelocity() / 60; // px por cuadro, aprox.
      state.progress = self.progress;
      listeners.forEach((fn) => fn(state));
    },
  });
}

export const onScroll = (fn: (s: ScrollState) => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
export const scrollState = () => state;
export function resetScroll() {
  scrollTo(0, 0);
  state.y = 0;
  state.velocity = 0;
}

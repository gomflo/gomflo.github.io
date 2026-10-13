// Movimiento declarativo. Se escribe en el marcado:
//   data-entra            el bloque cae en su lugar (en grupo, uno tras otro)
//   data-intro            entra con la página en vez de al hacer scroll
//   data-delay="0.2"      retraso extra, en segundos (solo con data-intro)
// Con movimiento reducido no corre nada y el CSS deja todo visible.
import { gsap } from "gsap";
import { prefersReducedMotion } from "./env";

// Un observador por página: no depende de que haya scroll (llegar con ancla, filtrar la lista).
let observador: IntersectionObserver | null = null;

const DESDE = { y: 28, scale: 0.94, autoAlpha: 0 };
const cae = (extra: gsap.TweenVars = {}): gsap.TweenVars => ({
  y: 0,
  scale: 1,
  autoAlpha: 1,
  duration: 0.7,
  ease: "back.out(1.6)",
  clearProps: "transform",
  ...extra,
});

/** Conecta las entradas dentro de `root`. Devuelve la línea de tiempo de entrada, en pausa. */
export function initReveals(root: ParentNode = document) {
  const intro = gsap.timeline({ paused: true });
  observador?.disconnect();
  observador = null;
  if (prefersReducedMotion()) return intro;
  const todos = [...root.querySelectorAll<HTMLElement>("[data-entra]")];
  const deIntro = todos.filter((el) => el.hasAttribute("data-intro"));
  const alScroll = todos.filter((el) => !el.hasAttribute("data-intro"));
  deIntro.forEach((el) => {
    intro.fromTo(el, DESDE, cae({ delay: parseFloat(el.dataset.delay || "0") }), 0);
  });
  if (alScroll.length) {
    gsap.set(alScroll, DESDE);
    observador = new IntersectionObserver(
      (entradas, io) => {
        const lote = entradas.filter((e) => e.isIntersecting).map((e) => e.target);
        if (!lote.length) return;
        lote.forEach((el) => io.unobserve(el));
        gsap.to(lote, cae({ stagger: 0.045 }));
      },
      { rootMargin: "0px 0px -6% 0px" },
    );
    alScroll.forEach((el) => observador!.observe(el));
  }
  return intro;
}

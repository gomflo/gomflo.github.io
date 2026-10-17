// Las apps del inicio: la vista cruza despacio una toma por app y, al apuntar
// (o enfocar) una fila del libro, muestra la suya. Solo se turnan si la vista
// está en pantalla, la pestaña visible y el movimiento permitido.
import { onPage, prefersReducedMotion } from "../engine";

const TURNO = 5500;

export function startObras() {
  onPage(() => {
    const raiz = document.querySelector<HTMLElement>("[data-obras]");
    if (!raiz) return;
    const filas = [...raiz.querySelectorAll<HTMLElement>("[data-obra]")];
    const tomas = [...raiz.querySelectorAll<HTMLElement>("[data-toma]")];
    const total = filas.length;
    let actual = 0;
    let quieta = false;
    let visible = false;
    let timer = 0;

    const mostrar = (i: number) => {
      actual = (i + total) % total;
      for (const el of tomas) el.toggleAttribute("data-activa", Number(el.dataset.toma) === actual);
      filas.forEach((f, n) => f.toggleAttribute("data-activa", n === actual));
    };

    const parar = () => {
      clearInterval(timer);
      timer = 0;
    };
    const seguir = () => {
      parar();
      if (quieta || !visible || document.hidden || prefersReducedMotion()) return;
      timer = window.setInterval(() => mostrar(actual + 1), TURNO);
    };

    const elegir = (e: Event) => {
      const fila = e.currentTarget as HTMLElement;
      quieta = true;
      parar();
      mostrar(Number(fila.dataset.obra));
    };
    const soltar = () => {
      quieta = false;
      seguir();
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      seguir();
    });
    io.observe(raiz);
    document.addEventListener("visibilitychange", seguir);
    for (const f of filas) {
      f.addEventListener("pointerenter", elegir);
      f.addEventListener("focus", elegir);
      f.addEventListener("pointerleave", soltar);
      f.addEventListener("blur", soltar);
    }
    mostrar(0);

    return () => {
      parar();
      io.disconnect();
      document.removeEventListener("visibilitychange", seguir);
      for (const f of filas) {
        f.removeEventListener("pointerenter", elegir);
        f.removeEventListener("focus", elegir);
        f.removeEventListener("pointerleave", soltar);
        f.removeEventListener("blur", soltar);
      }
    };
  });
}

// Movimiento global del sitio: corre una vez en el cliente, antes de la primera página.
import { onPage } from "../engine";
import { startBuscador } from "./buscador";
import { startPiezas } from "./piezas";
import { startTema } from "./tema";

export function setupMotion() {
  startTema();
  startBuscador();
  startPiezas();

  // El dibujo de la cabeza de una herramienta se anima al llegar y al apuntarlo.
  onPage(() => {
    const stage = document.querySelector<HTMLElement>("[data-motif-stage]");
    if (!stage) return;
    let timer = 0;
    const play = (delay: number) => {
      clearTimeout(timer);
      stage.removeAttribute("data-play");
      timer = window.setTimeout(() => stage.setAttribute("data-play", ""), delay);
    };
    const again = () => play(450);
    play(700);
    stage.addEventListener("pointerenter", again);
    return () => {
      clearTimeout(timer);
      stage.removeEventListener("pointerenter", again);
    };
  });
}

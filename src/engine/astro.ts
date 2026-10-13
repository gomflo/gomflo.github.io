// Adaptador de Astro (ClientRouter). Llama start(setup) una vez desde el layout.
// El color corre EN PARALELO con la descarga de la página siguiente.
import { boot, cleanup, enter, leave, resetCurtain, setCurtain, syncFlags } from "./index";

let navigating = false;
let covered = false;

export function start(setup?: () => void) {
  document.addEventListener("astro:before-preparation", (e) => {
    navigating = true;
    // Atrás/adelante: el navegador ya cambió la URL, no se le hace esperar.
    covered = e.navigationType !== "traverse";
    if (!covered) return;
    // El color sale de la pieza que se tocó y lleva escrito el destino.
    const link = e.sourceElement?.closest?.("a");
    const r = link?.getBoundingClientRect();
    const label = link?.querySelector(".pieza__nombre")?.textContent ?? link?.dataset.destino ?? "";
    setCurtain({
      label: label.replace(/\s+/g, " ").trim().slice(0, 48),
      cat: link?.closest<HTMLElement>("a[data-cat], li[data-cat]")?.dataset.cat,
      x: r ? r.left + r.width / 2 : innerWidth / 2,
      y: r ? r.top + r.height / 2 : innerHeight / 2,
    });
    const load = e.loader;
    e.loader = async () => {
      await Promise.all([leave(), load()]);
    };
  });
  document.addEventListener("astro:before-swap", () => cleanup());
  document.addEventListener("astro:after-swap", () => syncFlags());
  document.addEventListener("astro:page-load", () => {
    if (!navigating) return void boot(setup);
    navigating = false;
    // Con ancla (/#apps) Astro ya llevó el scroll a su lugar: no se regresa arriba.
    void enter({ transition: covered, scrollTop: covered && !location.hash });
  });
  // Página restaurada del caché del navegador con el color puesto: se quita.
  addEventListener("pageshow", (e) => {
    if (e.persisted) resetCurtain();
  });
  boot(setup);
}

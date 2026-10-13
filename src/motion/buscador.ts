// El buscador filtra las piezas mientras escribes.
import { gsap } from "gsap";
import { onPage } from "../engine";

const plano = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

export function startBuscador() {
  onPage(() => {
    const input = document.querySelector<HTMLInputElement>("[data-buscador]");
    const lista = document.querySelector<HTMLElement>("[data-piezas]");
    if (!input || !lista) return;
    const filas = [...lista.querySelectorAll<HTMLElement>("[data-pieza]")];
    const grupos = [...lista.querySelectorAll<HTMLElement>("[data-grupo]")];
    const vacio = document.querySelector<HTMLElement>("[data-sin-resultados]");
    const cuenta = document.querySelector<HTMLElement>("[data-cuenta]");
    const total = filas.length;

    let destapadas = false;
    const filtrar = () => {
      const q = plano(input.value.trim());
      // Al filtrar, una pieza que aún no entraba con el scroll puede quedar a la vista: se destapan todas.
      if (q && !destapadas) {
        destapadas = true;
        gsap.set(lista.querySelectorAll("[data-entra]"), { autoAlpha: 1, y: 0, scale: 1, overwrite: true });
      }
      let visibles = 0;
      for (const fila of filas) {
        const ok = !q || plano(fila.dataset.pieza || "").includes(q);
        fila.hidden = !ok;
        if (ok) visibles++;
      }
      for (const grupo of grupos) grupo.hidden = !grupo.querySelector("[data-pieza]:not([hidden])");
      lista.toggleAttribute("data-filtrando", !!q);
      if (vacio) vacio.hidden = visibles > 0;
      if (cuenta) cuenta.textContent = q ? `${visibles} de ${total}` : `${total} piezas`;
    };

    // Al enfocar, el buscador sube para que la lista quede a la vista.
    const subir = () => {
      const top = input.closest<HTMLElement>("[data-buscador-barra]")?.getBoundingClientRect().top ?? 0;
      if (top > innerHeight * 0.45) input.closest("[data-buscador-barra]")?.scrollIntoView({ block: "start", behavior: "smooth" });
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        const primero = lista.querySelector<HTMLAnchorElement>("[data-pieza]:not([hidden]) a");
        if (primero && input.value.trim()) primero.click();
      } else if (e.key === "Escape" && input.value) {
        input.value = "";
        filtrar();
      }
    };

    input.addEventListener("input", filtrar);
    input.addEventListener("focus", subir);
    input.addEventListener("keydown", tecla);
    filtrar();
    return () => {
      input.removeEventListener("input", filtrar);
      input.removeEventListener("focus", subir);
      input.removeEventListener("keydown", tecla);
    };
  });
}

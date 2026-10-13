// Botón de tema ([data-tema]). El estado vive en la clase .dark de <html>; el
// script en línea de Layout.astro la pone antes de pintar y tras cada navegación.
import { onPage } from "../engine";

const COLORES = { light: "#fbf2e1", dark: "#131120" } as const;

const actual = () => (document.documentElement.classList.contains("dark") ? "dark" : "light");

function sincronizar() {
  const tema = actual();
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", COLORES[tema]);
  for (const boton of document.querySelectorAll("[data-tema]")) {
    boton.setAttribute("aria-label", tema === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
  }
}

export function startTema() {
  document.addEventListener("click", (e) => {
    if (!(e.target as Element).closest?.("[data-tema]")) return;
    const next = actual() === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
    sincronizar();
    // El toaster de las herramientas escucha este evento.
    dispatchEvent(new CustomEvent("themechange", { detail: { theme: next } }));
  });
  onPage(sincronizar);
}

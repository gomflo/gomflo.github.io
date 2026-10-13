export const prefersReducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
export const isTouch = () => matchMedia("(hover: none), (pointer: coarse)").matches;
export const isMobile = () => matchMedia("(max-width: 700px)").matches;

// Una sola familia de curvas para todo el sitio. No inventar curvas por componente.
export const ease = {
  out: "expo.out", // entradas: arranca rápido y frena
  inOut: "expo.inOut", // el color entre páginas
  soft: "power3.out", // respuestas chicas
} as const;

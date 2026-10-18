// Las guías de Tin Marín: una página por uso (src/pages/tinmarin/<slug>.astro), con la ruleta adentro.
// De aquí salen los enlaces entre ellas y desde /tinmarin/, y las imágenes para compartir (scripts/og-tinmarin.mjs).

export type Guia = {
  slug: string;
  /** Título del enlace y de la imagen para compartir. */
  nombre: string;
  /** Una línea de qué resuelve, para la tarjeta del enlace. */
  resumen: string;
};

export const guias: Guia[] = [
  {
    slug: "sorteo-whatsapp-instagram",
    nombre: "Sorteo por WhatsApp o Instagram",
    resumen: "Pega la lista del grupo o los comentarios, sortea en vivo y comparte el código para que cualquiera lo compruebe.",
  },
  {
    slug: "elegir-alumno-al-azar",
    nombre: "Elegir alumno al azar",
    resumen: "Pasa a alguien al pizarrón sin favoritos: proyecta la ruleta con tu lista del grupo.",
  },
  {
    slug: "sortear-sin-repetir",
    nombre: "Sortear sin repetir",
    resumen: "Varios ganadores en orden, turnos para exponer o quién lleva qué: cada quien sale una sola vez.",
  },
  {
    slug: "ruleta-de-numeros",
    nombre: "Ruleta de números",
    resumen: "Del 1 al 100 o del 1 al 500: arma la ruleta de tu rifa con boletos numerados en un toque.",
  },
  {
    slug: "intercambio-navideno",
    nombre: "Intercambio navideño y posada",
    resumen: "El amigo secreto en el teléfono, el orden de los regalos robados y la rifa de la posada sin repetir.",
  },
];

// El tema Feria de la app (design/Theme.kt): el de casa. La web solo trae este; los demás viven en el teléfono.

export const feria = {
  fondo: "#FFF8EC",
  superficie: "#FFFFFF",
  superficieAlt: "#FFEDCC",
  tinta: "#17130F",
  tintaSuave: "#6B6257",
  acento: "#FF3D2E",
  casillas: ["#FF3D2E", "#FFC400", "#1FB5A8", "#2D4BFF", "#FF8AC8"],
  eje: "#FFFFFF",
  /** Grosor del borde de tinta, en px CSS. */
  borde: 2.5,
};

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Texto legible sobre [color]. El corte está en 0.33 y no a la mitad porque el blanco deja de leerse mucho
 * antes que la tinta: sobre un turquesa medio el blanco no llega a 3:1.
 */
export const sobre = (color: string) => (luminance(color) > 0.33 ? feria.tinta : "#FFFFFF");

/** La familia de los titulares. En canvas el ancho se pide con la palabra clave de font-stretch. */
export const DISPLAY = '"Bricolage Grotesque", ui-sans-serif, system-ui, sans-serif';
export const TEXTO = '"DM Sans", ui-sans-serif, system-ui, sans-serif';

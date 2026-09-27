/**
 * Conteo de caracteres, palabras y tiempos de lectura. Los caracteres se
 * cuentan como grafemas: un emoji o una letra con tilde combinada valen 1.
 */

export interface Estadisticas {
  caracteres: number;
  sinEspacios: number;
  palabras: number;
  lineas: number;
  parrafos: number;
  segundosLectura: number;
  segundosVoz: number;
}

/** Palabras por minuto: lectura en silencio y en voz alta, en español. */
const PPM_LECTURA = 220;
const PPM_VOZ = 140;

const segmenter = typeof Intl !== "undefined" && "Segmenter" in Intl
  ? new Intl.Segmenter("es", { granularity: "grapheme" })
  : null;

const graphemes = (texto: string) => {
  if (!segmenter) return [...texto].length;
  let total = 0;
  for (const _ of segmenter.segment(texto)) total++;
  return total;
};

export const analizarTexto = (texto: string): Estadisticas => {
  const limpio = texto.trim();
  const palabras = limpio ? limpio.split(/\s+/).length : 0;
  return {
    caracteres: graphemes(texto),
    sinEspacios: graphemes(texto.replace(/\s/g, "")),
    palabras,
    lineas: texto ? texto.split("\n").length : 0,
    parrafos: limpio ? limpio.split(/\n\s*\n/).filter((p) => p.trim()).length : 0,
    segundosLectura: Math.round((palabras / PPM_LECTURA) * 60),
    segundosVoz: Math.round((palabras / PPM_VOZ) * 60),
  };
};

/** "45 s", "3 min", "1 h 5 min". */
export const formatearDuracion = (segundos: number) => {
  if (segundos < 60) return `${segundos} s`;
  const minutos = Math.round(segundos / 60);
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto ? `${horas} h ${resto} min` : `${horas} h`;
};

export const LIMITES = [
  { nombre: "Post en X (Twitter)", max: 280 },
  { nombre: "Título SEO", max: 60 },
  { nombre: "Meta description", max: 160 },
  { nombre: "SMS", max: 160 },
  { nombre: "Bio de Instagram", max: 150 },
  { nombre: "Descripción de Instagram", max: 2200 },
  { nombre: "Publicación de LinkedIn", max: 3000 },
  { nombre: "Título de YouTube", max: 100 },
];

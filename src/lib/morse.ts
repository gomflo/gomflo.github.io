/**
 * Código morse internacional (UIT-R M.1677) con la Ñ y la CH del español.
 */

const TABLA: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....",
  I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", Ñ: "--.--", O: "---",
  P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--",
  X: "-..-", Y: "-.--", Z: "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-",
  "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--",
  "/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...",
  ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-", _: "..--.-",
  '"': ".-..-.", $: "...-..-", "@": ".--.-.", "¿": "..-.-", "¡": "--...-",
};

const INVERSA: Record<string, string> = Object.fromEntries(
  Object.entries(TABLA).map(([letra, codigo]) => [codigo, letra])
);

/** Quita tildes pero conserva la Ñ, que tiene código propio. */
const normalizar = (texto: string) =>
  texto
    .toUpperCase()
    .replace(/Ñ/g, "\u0000")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\u0000/g, "Ñ");

export interface ResultadoMorse {
  salida: string;
  /** Caracteres que no tienen equivalente y se omitieron. */
  omitidos: string[];
}

/** Letras separadas por espacio y palabras por " / ". */
export const aMorse = (texto: string): ResultadoMorse => {
  const omitidos = new Set<string>();
  const palabras = normalizar(texto)
    .split(/\s+/)
    .filter(Boolean)
    .map((palabra) =>
      [...palabra]
        .map((c) => {
          const codigo = TABLA[c];
          if (!codigo) omitidos.add(c);
          return codigo;
        })
        .filter(Boolean)
        .join(" ")
    )
    .filter(Boolean);
  return { salida: palabras.join(" / "), omitidos: [...omitidos] };
};

/** Acepta · y • como punto, — y _ como raya, y "/" o 3+ espacios entre palabras. */
export const deMorse = (codigo: string): ResultadoMorse => {
  const omitidos = new Set<string>();
  const limpio = codigo.replace(/[·•]/g, ".").replace(/[—–_−]/g, "-").trim();
  const palabras = limpio
    .split(/\s*[/|]\s*|\s{3,}|\n+/)
    .filter(Boolean)
    .map((palabra) =>
      palabra
        .split(/\s+/)
        .map((simbolo) => {
          const letra = INVERSA[simbolo];
          if (!letra) omitidos.add(simbolo);
          return letra ?? "";
        })
        .join("")
    );
  return { salida: palabras.join(" "), omitidos: [...omitidos] };
};

/** ¿Parece morse? Solo puntos, rayas, separadores y espacios. */
export const pareceMorse = (texto: string) => /^[\s.\-·•—–_−/|]+$/.test(texto) && /[.\-·•—–_−]/.test(texto);

/**
 * Tiempos en unidades (punto = 1): raya 3, entre símbolos 1,
 * entre letras 3 y entre palabras 7.
 */
export const secuencia = (morse: string): { on: boolean; unidades: number }[] => {
  const pasos: { on: boolean; unidades: number }[] = [];
  const palabras = morse.split(" / ");
  palabras.forEach((palabra, p) => {
    if (p > 0) pasos.push({ on: false, unidades: 7 });
    palabra.split(" ").forEach((letra, l) => {
      if (l > 0) pasos.push({ on: false, unidades: 3 });
      [...letra].forEach((s, i) => {
        if (i > 0) pasos.push({ on: false, unidades: 1 });
        pasos.push({ on: true, unidades: s === "-" ? 3 : 1 });
      });
    });
  });
  return pasos;
};

/** Letras y luego dígitos (Object.entries pondría primero las claves numéricas). */
export const ALFABETO = [..."ABCDEFGHIJKLMNÑOPQRSTUVWXYZ0123456789"].map((c) => [c, TABLA[c]] as const);

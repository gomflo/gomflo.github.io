/** Transformaciones de mayúsculas, minúsculas y estilos de nombres de código. */

export type CaseMode =
  | "upper"
  | "lower"
  | "sentence"
  | "title"
  | "camel"
  | "pascal"
  | "snake"
  | "kebab"
  | "constant"
  | "invert";

export const CASE_MODES: { id: CaseMode; label: string; sample: string }[] = [
  { id: "upper", label: "MAYÚSCULAS", sample: "HOLA MUNDO" },
  { id: "lower", label: "minúsculas", sample: "hola mundo" },
  { id: "sentence", label: "Tipo oración", sample: "Hola mundo" },
  { id: "title", label: "Cada Palabra", sample: "Hola Mundo" },
  { id: "invert", label: "iNVERTIR", sample: "hOLA mUNDO" },
  { id: "camel", label: "camelCase", sample: "holaMundo" },
  { id: "pascal", label: "PascalCase", sample: "HolaMundo" },
  { id: "snake", label: "snake_case", sample: "hola_mundo" },
  { id: "kebab", label: "kebab-case", sample: "hola-mundo" },
  { id: "constant", label: "CONSTANT_CASE", sample: "HOLA_MUNDO" },
];

const LOCALE = "es";
const upper = (s: string) => s.toLocaleUpperCase(LOCALE);
const lower = (s: string) => s.toLocaleLowerCase(LOCALE);
const capitalize = (s: string) => upper(s.charAt(0)) + lower(s.slice(1));

/** Parte "holaMundo", "hola_mundo" o "Hola mundo" en palabras. */
const words = (line: string): string[] =>
  line
    .normalize("NFC")
    .replace(/([\p{Ll}\d])(\p{Lu})/gu, "$1 $2")
    .replace(/(\p{Lu})(\p{Lu}\p{Ll})/gu, "$1 $2")
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);

/** Primera letra de cada oración en mayúscula; respeta ¿ y ¡. */
const sentenceCase = (text: string) =>
  lower(text).replace(/(^|[.!?…]\s+|\n\s*)([¿¡"«(]*)(\p{L})/gu, (_, pre, open, letter) => pre + open + upper(letter));

const titleCase = (text: string) =>
  lower(text).replace(/(^|[^\p{L}\p{N}'’])(\p{L})/gu, (_, pre, letter) => pre + upper(letter));

const invert = (text: string) =>
  [...text].map((ch) => (ch === upper(ch) ? lower(ch) : upper(ch))).join("");

/** Los estilos de código se aplican línea por línea para poder convertir listas. */
const perLine = (text: string, fn: (w: string[]) => string) =>
  text
    .split("\n")
    .map((line) => fn(words(line)))
    .join("\n");

export const convertCase = (text: string, mode: CaseMode): string => {
  switch (mode) {
    case "upper":
      return upper(text);
    case "lower":
      return lower(text);
    case "sentence":
      return sentenceCase(text);
    case "title":
      return titleCase(text);
    case "invert":
      return invert(text);
    case "camel":
      return perLine(text, (w) => w.map((x, i) => (i === 0 ? lower(x) : capitalize(x))).join(""));
    case "pascal":
      return perLine(text, (w) => w.map(capitalize).join(""));
    case "snake":
      return perLine(text, (w) => w.map(lower).join("_"));
    case "kebab":
      return perLine(text, (w) => w.map(lower).join("-"));
    case "constant":
      return perLine(text, (w) => w.map(upper).join("_"));
  }
};

/** Conversión entre HEX, RGB, HSL y OKLCH, más contraste WCAG. */

export interface Rgba {
  r: number; // 0–255
  g: number;
  b: number;
  a: number; // 0–1
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const round = (n: number, digits = 0) => {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
};

/* ---------- Lectura ---------- */

const parseHex = (input: string): Rgba | null => {
  const m = input.match(/^#?([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i);
  if (!m) return null;
  let hex = m[1];
  if (hex.length <= 4) hex = [...hex].map((c) => c + c).join("");
  const n = (i: number) => parseInt(hex.slice(i, i + 2), 16);
  return { r: n(0), g: n(2), b: n(4), a: hex.length === 8 ? round(n(6) / 255, 3) : 1 };
};

/** Lee los argumentos de rgb()/hsl()/oklch() con comas o con espacios y "/". */
const readArgs = (input: string, fn: string): string[] | null => {
  const m = input.match(new RegExp(`^${fn}a?\\(([^)]*)\\)$`, "i"));
  if (!m) return null;
  const parts = m[1].trim().split(/\s*[,/]\s*|\s+/).filter(Boolean);
  return parts.length === 3 || parts.length === 4 ? parts : null;
};

const num = (s: string, percentOf = 1) =>
  s.endsWith("%") ? (parseFloat(s) / 100) * percentOf : parseFloat(s);

const alpha = (s?: string) => (s === undefined ? 1 : clamp(num(s), 0, 1));

const parseRgb = (input: string): Rgba | null => {
  const p = readArgs(input, "rgb");
  if (!p) return null;
  const [r, g, b] = p.slice(0, 3).map((s) => clamp(num(s, 255), 0, 255));
  if ([r, g, b].some(Number.isNaN)) return null;
  return { r, g, b, a: alpha(p[3]) };
};

const parseHsl = (input: string): Rgba | null => {
  const p = readArgs(input, "hsl");
  if (!p) return null;
  const h = parseFloat(p[0]);
  const s = clamp(parseFloat(p[1]), 0, 100);
  const l = clamp(parseFloat(p[2]), 0, 100);
  if ([h, s, l].some(Number.isNaN)) return null;
  return { ...hslToRgb(h, s, l), a: alpha(p[3]) };
};

const parseOklch = (input: string): Rgba | null => {
  const p = readArgs(input, "oklch");
  if (!p) return null;
  const l = p[0].endsWith("%") ? parseFloat(p[0]) / 100 : parseFloat(p[0]);
  const c = p[1].endsWith("%") ? (parseFloat(p[1]) / 100) * 0.4 : parseFloat(p[1]);
  const h = parseFloat(p[2]);
  if ([l, c, h].some(Number.isNaN)) return null;
  return { ...oklchToRgb(l, c, h), a: alpha(p[3]) };
};

/** Nombres CSS (red, rebeccapurple…) resueltos por el propio navegador. */
const parseNamed = (input: string): Rgba | null => {
  if (!/^[a-z]+$/i.test(input) || typeof document === "undefined") return null;
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#000001";
  ctx.fillStyle = input;
  const resolved = String(ctx.fillStyle);
  return resolved === "#000001" ? null : parseHex(resolved);
};

export const parseColor = (input: string): Rgba | null => {
  const value = input.trim().replace(/;$/, "");
  if (!value) return null;
  return parseHex(value) ?? parseRgb(value) ?? parseHsl(value) ?? parseOklch(value) ?? parseNamed(value);
};

/* ---------- Conversiones ---------- */

export const hslToRgb = (h: number, s: number, l: number) => {
  const sat = s / 100;
  const light = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sat * Math.min(light, 1 - light);
  const f = (n: number) => light - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return { r: f(0) * 255, g: f(8) * 255, b: f(4) * 255 };
};

export const rgbToHsl = ({ r, g, b }: Rgba) => {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: s * 100, l: l * 100 };
};

const toLinear = (c: number) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};

const fromLinear = (v: number) =>
  clamp((v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055) * 255, 0, 255);

export const rgbToOklch = ({ r, g, b }: Rgba) => {
  const [lr, lg, lb] = [toLinear(r), toLinear(g), toLinear(b)];
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.hypot(A, B);
  let H = (Math.atan2(B, A) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { l: L, c: C, h: C < 0.0001 ? 0 : H };
};

export const oklchToRgb = (L: number, C: number, H: number) => {
  const hr = (H * Math.PI) / 180;
  const A = C * Math.cos(hr);
  const B = C * Math.sin(hr);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return {
    r: fromLinear(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: fromLinear(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: fromLinear(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  };
};

/* ---------- Formatos de salida ---------- */

const hex2 = (n: number) => Math.round(n).toString(16).padStart(2, "0");

export const toHexString = (c: Rgba) =>
  `#${hex2(c.r)}${hex2(c.g)}${hex2(c.b)}${c.a < 1 ? hex2(c.a * 255) : ""}`;

export const toRgbString = (c: Rgba) => {
  const rgb = [c.r, c.g, c.b].map((n) => Math.round(n)).join(", ");
  return c.a < 1 ? `rgba(${rgb}, ${round(c.a, 2)})` : `rgb(${rgb})`;
};

export const toHslString = (c: Rgba) => {
  const { h, s, l } = rgbToHsl(c);
  const body = `${round(h)}, ${round(s)}%, ${round(l)}%`;
  return c.a < 1 ? `hsla(${body}, ${round(c.a, 2)})` : `hsl(${body})`;
};

export const toOklchString = (c: Rgba) => {
  const { l, c: chroma, h } = rgbToOklch(c);
  const body = `${round(l * 100, 1)}% ${round(chroma, 3)} ${round(h, 1)}`;
  return c.a < 1 ? `oklch(${body} / ${round(c.a, 2)})` : `oklch(${body})`;
};

/* ---------- Contraste WCAG 2.2 ---------- */

export const luminance = ({ r, g, b }: Rgba) =>
  0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

export const contrastRatio = (a: Rgba, b: Rgba) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** Generadores aleatorios criptográficamente seguros (Web Crypto). */

/** Entero uniforme en [0, max) sin sesgo de módulo. */
export const randomInt = (max: number): number => {
  const limit = Math.floor(0x1_0000_0000 / max) * max;
  const buf = new Uint32Array(1);
  do crypto.getRandomValues(buf);
  while (buf[0] >= limit);
  return buf[0] % max;
};

/* ---------- Contraseñas ---------- */

export const CHARSETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  digits: "0123456789",
  symbols: "!#$%&*+-.:;=?@^_~",
} as const;

export type CharsetId = keyof typeof CHARSETS;

const AMBIGUOUS = /[O0oIl1|]/g;

export interface PasswordOptions {
  length: number;
  sets: CharsetId[];
  excludeAmbiguous: boolean;
}

const poolsFor = ({ sets, excludeAmbiguous }: PasswordOptions) =>
  sets.map((id) => (excludeAmbiguous ? CHARSETS[id].replace(AMBIGUOUS, "") : CHARSETS[id]));

/** Garantiza al menos un carácter de cada conjunto elegido. */
export const generatePassword = (options: PasswordOptions): string => {
  const pools = poolsFor(options);
  if (pools.length === 0) return "";
  const all = pools.join("");
  const chars = pools.map((pool) => pool[randomInt(pool.length)]);
  while (chars.length < options.length) chars.push(all[randomInt(all.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.slice(0, options.length).join("");
};

/** Bits de entropía de una contraseña generada con estas opciones. */
export const passwordEntropy = (options: PasswordOptions): number => {
  const size = poolsFor(options).join("").length;
  return size > 0 ? options.length * Math.log2(size) : 0;
};

export const strengthLabel = (bits: number) => {
  if (bits < 40) return { label: "Débil", level: 1 };
  if (bits < 60) return { label: "Aceptable", level: 2 };
  if (bits < 90) return { label: "Fuerte", level: 3 };
  return { label: "Muy fuerte", level: 4 };
};

/* ---------- UUID ---------- */

const hex = (bytes: Uint8Array) => Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

const format = (h: string) =>
  `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;

export const uuidV4 = (): string => {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  return format(hex(b));
};

/** UUID v7 (RFC 9562): milisegundos Unix en los primeros 48 bits, ordenable por fecha. */
export const uuidV7 = (now = Date.now()): string => {
  const b = crypto.getRandomValues(new Uint8Array(16));
  let ms = now;
  for (let i = 5; i >= 0; i--) {
    b[i] = ms % 256;
    ms = Math.floor(ms / 256);
  }
  b[6] = (b[6] & 0x0f) | 0x70;
  b[8] = (b[8] & 0x3f) | 0x80;
  return format(hex(b));
};

/** Fecha embebida en un UUID v7, o null si no es v7. */
export const uuidV7Date = (uuid: string): Date | null => {
  const h = uuid.replace(/-/g, "");
  if (!/^[\da-f]{32}$/i.test(h) || h[12] !== "7") return null;
  return new Date(parseInt(h.slice(0, 12), 16));
};

/**
 * Genera las imágenes para compartir (Open Graph, 1200×630) de cada página.
 *
 *   npm run build && npm run og
 *
 * Lee el HTML de ./dist (título, descripción y el motivo SVG de cada
 * herramienta), arma una tarjeta con la identidad "Bloques" y la captura con
 * Chrome sin interfaz. Escribe public/img/<slug>.jpeg (el inicio es inicio.jpeg).
 * Vuelve a correrlo al agregar herramientas o al cambiar de año (días feriados).
 *
 * Chrome: usa CHROME_PATH o la ruta estándar de macOS.
 */
import { execFile } from "node:child_process";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const ROOT = new URL("..", import.meta.url).pathname;
const DIST = join(ROOT, "dist");
const OUT = join(ROOT, "public/img");
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
/** Motivos del mosaico del inicio: uno por categoría. */
const HOME_MOTIFS = ["contar-caracteres", "formatear-json", "generador-contrasenas", "validar-clabe", "numeros-romanos"];

if (!existsSync(DIST)) throw new Error("No existe ./dist: corre npm run build primero.");
if (!existsSync(CHROME)) throw new Error(`No encontré Chrome en ${CHROME}. Define CHROME_PATH.`);

const decode = (s) =>
  s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const text = (html) => decode(html.replace(/<[^>]+>/g, "")).trim();

const match = (html, re) => html.match(re)?.[1];
const motifSvg = (html) => html.match(/cabeza__dibujo[\s\S]*?(<svg class="motif"[\s\S]*?<\/svg>)/)?.[1];

const motifsCss = await readFile(join(ROOT, "src/styles/motifs.css"), "utf8");
const FONTS = `file://${join(ROOT, "public/fonts")}`;

const COLORES = { texto: "#96e6c1", codigo: "#ff8767", generadores: "#b8a6ff", mexico: "#ffcf4a", conversores: "#8ecbff" };

// Tarjeta "Bloques": un bloque del color de la categoría sobre la mesa crema, con el dibujo en su ficha oscura.
const page = ({ title, lead, art, url, size, color }) => `<!doctype html>
<html lang="es-MX"><head><meta charset="utf-8">
<style>
  @font-face { font-family: "Bricolage Grotesque"; src: url("${FONTS}/bricolage-grotesque-200_800-normal.woff2") format("woff2");
    font-weight: 200 800; font-stretch: 75% 100%; font-display: block; }
  @font-face { font-family: "DM Mono"; src: url("${FONTS}/dm-mono-500-normal.woff2") format("woff2"); font-weight: 500; font-display: block; }
  :root { --tinta: #1c1a2e; --crema: #fbf2e1; --pieza: ${color}; --acento-dibujo: var(--pieza);
    --ease-out: linear; --ease-in-out: linear; --ease-spring: linear; }
  * { box-sizing: border-box; }
  html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
  body { padding: 28px; background: var(--crema); color: var(--tinta); font-family: "Bricolage Grotesque", system-ui, sans-serif; }
  .bloque { position: relative; height: 100%; padding: 44px 52px; border-radius: 44px; background: var(--pieza);
    display: flex; flex-direction: column; }
  .bloque.oscuro { background: var(--tinta); color: var(--crema); }
  .brand { display: flex; align-items: center; gap: 14px; font-size: 34px; font-weight: 800; letter-spacing: -0.015em; }
  .brand i { display: grid; grid-template-columns: 15px 15px; gap: 4px; padding: 7px; border-radius: 12px; background: var(--tinta); }
  .brand i b { width: 15px; height: 15px; border-radius: 5px; }
  .ficha { position: absolute; top: 40px; right: 48px; width: 136px; height: 136px; padding: 20px; border-radius: 32px;
    background: var(--tinta); color: var(--crema); rotate: 4deg; }
  .ficha .motif { width: 100%; height: 100%; stroke-width: 4; }
  .mosaic { position: absolute; top: 44px; right: 52px; display: flex; gap: 10px; }
  .mosaic span { width: 84px; height: 84px; padding: 16px; border-radius: 22px; color: var(--tinta); --acento-dibujo: #fff; }
  .mosaic .motif { width: 100%; height: 100%; stroke-width: 4; }
  h1 { margin: auto 0 0; max-width: 1000px; font-size: ${size}px; line-height: 0.92; font-weight: 800;
    font-stretch: 90%; letter-spacing: -0.015em; text-wrap: balance; }
  .oscuro h1 em { font-style: normal; color: #ffcf4a; }
  p { margin: 22px 0 0; max-width: 900px; font-size: 30px; font-weight: 500; line-height: 1.25; text-wrap: pretty;
    display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
  .url { margin-top: 26px; align-self: flex-start; padding: 10px 18px; border-radius: 14px; background: var(--tinta); color: var(--crema);
    font-family: "DM Mono", monospace; font-size: 24px; font-weight: 500; white-space: nowrap; }
  .oscuro .url { background: var(--crema); color: var(--tinta); }
  ${motifsCss}
  /* Congela cada motivo en su estado "en juego" final. */
  .motif, .motif * { transition-duration: 0s !important; transition-delay: 0s !important;
    animation-duration: 1ms !important; animation-delay: 0s !important; animation-iteration-count: 1 !important; }
</style></head>
<body data-play>
  <div class="bloque${color ? "" : " oscuro"}">
    <div class="brand"><i><b style="background:#b8a6ff"></b><b style="background:#96e6c1"></b><b style="background:#ff8767"></b><b style="background:#ffcf4a"></b></i>gomflo</div>
    ${art}
    <h1>${title}</h1>
    <p>${escape(lead)}</p>
    <div class="url">${escape(url)}</div>
  </div>
</body></html>`;

/** Tamaño del título según su largo, para que quepa en tres líneas. */
const titleSize = (title) => (title.length <= 16 ? 128 : title.length <= 26 ? 108 : 88);

const pages = [];
for (const entry of await readdir(DIST, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const file = join(DIST, entry.name, "index.html");
  if (!existsSync(file)) continue;
  const html = await readFile(file, "utf8");
  const svg = motifSvg(html);
  if (!svg) continue; // redirecciones y páginas sin herramienta
  pages.push({
    slug: entry.name,
    title: escape(text(match(html, /<h1[^>]*>([\s\S]*?)<\/h1>/))),
    lead: text(match(html, /<p class="cabeza__entrada[^"]*"[^>]*>([\s\S]*?)<\/p>/)),
    art: `<div class="ficha">${svg}</div>`,
    color: COLORES[match(html, /<main[^>]*data-cat="([^"]+)"/)] ?? COLORES.mexico,
    url: `gomflo.dev/${entry.name}`,
  });
}

const home = await readFile(join(DIST, "index.html"), "utf8");
const tiles = Object.fromEntries(
  [...home.matchAll(/<svg class="motif pieza__dibujo" data-motif="([^"]+)"[\s\S]*?<\/svg>/g)].map((m) => [m[1], m[0]])
);
pages.push({
  slug: "inicio",
  title: "Herramientas online gratis <em>para el día a día.</em>",
  lead: "Texto, código, dinero y conversores. En español, sin cuenta y sin instalar nada.",
  art: `<div class="mosaic">${HOME_MOTIFS.map((s, i) => `<span style="background:${Object.values(COLORES)[i]}">${tiles[s]}</span>`).join("")}</div>`,
  url: "gomflo.dev",
});

const work = await mkdtemp(join(tmpdir(), "og-"));
const render = async ({ slug, title, ...rest }) => {
  const htmlPath = join(work, `${slug}.html`);
  const pngPath = join(work, `${slug}.png`);
  await writeFile(htmlPath, page({ title, ...rest, size: titleSize(title.replace(/<[^>]+>/g, "")) }));
  await run(CHROME, [
    "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
    "--window-size=1200,630", "--virtual-time-budget=6000", `--screenshot=${pngPath}`, `file://${htmlPath}`,
  ]);
  await run("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "85", pngPath, "--out", join(OUT, `${slug}.jpeg`)]);
  console.log(`✓ ${slug}`);
};

// De cuatro en cuatro para no saturar la máquina.
for (let i = 0; i < pages.length; i += 4) await Promise.all(pages.slice(i, i + 4).map(render));
await rm(work, { recursive: true, force: true });
console.log(`${pages.length} imágenes en public/img`);

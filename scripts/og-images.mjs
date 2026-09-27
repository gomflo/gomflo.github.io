/**
 * Genera las imágenes para compartir (Open Graph, 1200×630) de cada página.
 *
 *   npm run build && npm run og
 *
 * Lee el HTML de ./dist (título, descripción y el motivo SVG de cada
 * herramienta), arma una tarjeta con la identidad "Azulejo" y la captura con
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
const HOME_MOTIFS = ["contar-caracteres", "formatear-json", "generador-contrasenas", "validar-clabe", "numeros-romanos", "codigo-morse"];

if (!existsSync(DIST)) throw new Error("No existe ./dist: corre npm run build primero.");
if (!existsSync(CHROME)) throw new Error(`No encontré Chrome en ${CHROME}. Define CHROME_PATH.`);

const decode = (s) =>
  s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const text = (html) => decode(html.replace(/<[^>]+>/g, "")).trim();

const match = (html, re) => html.match(re)?.[1];
const motifSvg = (html, cls) => html.match(new RegExp(`<svg class="motif ${cls}"[\\s\\S]*?</svg>`))?.[0];

const motifsCss = await readFile(join(ROOT, "src/styles/motifs.css"), "utf8");

const page = ({ title, lead, art, url, size }) => `<!doctype html>
<html lang="es-MX"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,300..800&family=Martian+Mono:wdth,wght@75..112.5,400..600&display=block" rel="stylesheet">
<style>
  :root {
    --glaze: #f5f7fc; --glaze-raised: #fff; --cobalt: #2340b8; --ink: #111a4a; --ink-muted: #4a5584;
    --yolk: #f2b01e; --yolk-ink: #2b1f00; --grout: #d3daf0;
    --ease-out: linear; --ease-in-out: linear; --ease-spring: linear;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
  body {
    display: grid; grid-template-columns: 430px 1fr; align-items: center; gap: 64px;
    padding: 72px 80px 88px; background: var(--glaze); color: var(--ink);
    font-family: "Bricolage Grotesque", system-ui, sans-serif;
  }
  body::after {
    content: ""; position: absolute; inset: auto 0 0 0; height: 20px;
    background: radial-gradient(circle at 10px 0, var(--yolk) 5px, transparent 5.5px) 0 0 / 40px 20px, var(--cobalt);
  }
  .tile {
    --r: 64px; --w: 4px; --orn: color-mix(in oklab, var(--cobalt) 18%, transparent);
    position: relative; width: 430px; aspect-ratio: 1; display: grid; place-items: center;
    border: 6px solid var(--cobalt); border-radius: 56px; color: var(--cobalt); overflow: hidden;
    background:
      radial-gradient(circle at 0 0, var(--yolk) 14px, transparent 14.5px),
      radial-gradient(circle at 100% 0, var(--yolk) 14px, transparent 14.5px),
      radial-gradient(circle at 100% 100%, var(--yolk) 14px, transparent 14.5px),
      radial-gradient(circle at 0 100%, var(--yolk) 14px, transparent 14.5px),
      radial-gradient(circle at 0 0, transparent var(--r), var(--orn) calc(var(--r) + .5px) calc(var(--r) + var(--w)), transparent calc(var(--r) + var(--w) + .5px)),
      radial-gradient(circle at 100% 0, transparent var(--r), var(--orn) calc(var(--r) + .5px) calc(var(--r) + var(--w)), transparent calc(var(--r) + var(--w) + .5px)),
      radial-gradient(circle at 100% 100%, transparent var(--r), var(--orn) calc(var(--r) + .5px) calc(var(--r) + var(--w)), transparent calc(var(--r) + var(--w) + .5px)),
      radial-gradient(circle at 0 100%, transparent var(--r), var(--orn) calc(var(--r) + .5px) calc(var(--r) + var(--w)), transparent calc(var(--r) + var(--w) + .5px)),
      var(--glaze-raised);
  }
  .tile > .motif { width: 62%; }
  .mosaic { display: grid; grid-template-columns: repeat(3, 1fr); gap: 34px; width: 72%; }
  .mosaic .motif { width: 100%; }
  .brand { display: flex; align-items: center; gap: 14px; font-size: 30px; font-weight: 700; color: var(--ink); }
  .brand svg { width: 48px; height: 48px; }
  h1 {
    margin: 28px 0 0; font-size: ${size}px; line-height: 0.95; font-weight: 800;
    font-variation-settings: "wdth" 78; letter-spacing: -0.035em; text-wrap: balance;
  }
  p { margin: 24px 0 0; font-size: 29px; line-height: 1.3; color: var(--ink-muted); text-wrap: pretty;
    display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden; }
  .url { margin-top: 32px; font-family: "Martian Mono", monospace; font-size: 22px; color: var(--cobalt);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  ${motifsCss}
  /* Congela cada motivo en su estado "en juego" final. */
  .motif, .motif * { transition-duration: 0s !important; transition-delay: 0s !important;
    animation-duration: 1ms !important; animation-delay: 0s !important; animation-iteration-count: 1 !important; }
</style></head>
<body data-play>
  <div class="tile">${art}</div>
  <div style="min-width: 0">
    <div class="brand">
      <svg viewBox="0 0 36 36"><rect x="1" y="1" width="34" height="34" rx="9" fill="#2340b8"/>
        <path d="M1 12A11 11 0 0 0 12 1H10A9 9 0 0 1 1 10Z" fill="#f2b01e"/><circle cx="29" cy="29" r="2.5" fill="#f2b01e"/>
        <ellipse cx="13" cy="18" rx="4.2" ry="5" fill="#fff"/><circle cx="13.6" cy="18.6" r="2.2" fill="#0b1233"/>
        <ellipse cx="23" cy="18" rx="4.2" ry="5" fill="#fff"/><circle cx="23.6" cy="18.6" r="2.2" fill="#0b1233"/></svg>
      gomflo.dev
    </div>
    <h1>${escape(title)}</h1>
    <p>${escape(lead)}</p>
    <div class="url">${escape(url)}</div>
  </div>
</body></html>`;

/** Tamaño del título según su largo, para que quepa en tres líneas. */
const titleSize = (title) => (title.length <= 16 ? 104 : title.length <= 26 ? 88 : 72);

const pages = [];
for (const entry of await readdir(DIST, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const file = join(DIST, entry.name, "index.html");
  if (!existsSync(file)) continue;
  const html = await readFile(file, "utf8");
  const svg = motifSvg(html, "tool-stage-motif");
  if (!svg) continue; // redirecciones y páginas sin herramienta
  pages.push({
    slug: entry.name,
    title: text(match(html, /<h1[^>]*>([\s\S]*?)<\/h1>/)),
    lead: text(match(html, /<p class="tool-lead[^"]*"[^>]*>([\s\S]*?)<\/p>/)),
    art: svg,
    url: `gomflo.dev/${entry.name}`,
  });
}

const home = await readFile(join(DIST, "index.html"), "utf8");
const tiles = Object.fromEntries(
  [...home.matchAll(/<svg class="motif tile-motif" data-motif="([^"]+)"[\s\S]*?<\/svg>/g)].map((m) => [m[1], m[0]])
);
pages.push({
  slug: "inicio",
  title: "Herramientas pequeñas para todos los días",
  lead: "Texto, código, dinero y conversores. Gratis, en español y sin enviar tus datos.",
  art: `<div class="mosaic">${HOME_MOTIFS.map((s) => tiles[s]).join("")}</div>`,
  url: "gomflo.dev",
});

const work = await mkdtemp(join(tmpdir(), "og-"));
const render = async ({ slug, title, ...rest }) => {
  const htmlPath = join(work, `${slug}.html`);
  const pngPath = join(work, `${slug}.png`);
  await writeFile(htmlPath, page({ title, ...rest, size: titleSize(title) }));
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

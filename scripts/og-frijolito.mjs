/**
 * Imágenes para compartir (Open Graph, 1200×630) de /frijolito/ y sus páginas, con la identidad de la app:
 * la mesa añil, el papel crema, Fraunces y tres cartas de la baraja de feria en abanico.
 *
 *   npm run og:frijolito
 *
 * No necesita el build: títulos y cartas salen de src/data/frijolito-paginas.ts. Escribe
 * public/img/frijolito.jpeg y public/img/frijolito/<slug>.jpeg. Vuelve a correrlo al agregar una página.
 * Las cartas 2, 8, 14, 25, 26, 38 y 42 no van en estas imágenes.
 *
 * Chrome: usa CHROME_PATH o la ruta estándar de macOS.
 */
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const ROOT = new URL("..", import.meta.url).pathname;
const OUT = join(ROOT, "public/img");
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const FONTS = `file://${join(ROOT, "public/fonts")}`;
const CARTAS = join(ROOT, "public/frijolito/cartas/grande");
const ICONO = `file://${join(ROOT, "public/img/android/frijolito/icono.png")}`;
const FUERA = new Set([2, 8, 14, 25, 26, 38, 42]);

if (!existsSync(CHROME)) throw new Error(`No encontré Chrome en ${CHROME}. Define CHROME_PATH.`);

// Las páginas se leen del catálogo sin compilar TypeScript: cada una trae slug, nombre, titulo y cartas en ese orden.
const catalogo = await readFile(join(ROOT, "src/data/frijolito-paginas.ts"), "utf8");
const paginas = [...catalogo.matchAll(/slug: "([^"]*)",\s*nombre: "[^"]+",\s*titulo: "([^"]+)",\s*cartas: \[(\d+), (\d+), (\d+)\]/g)].map((m) => ({
  slug: m[1],
  titulo: m[2],
  cartas: [m[3], m[4], m[5]].map(Number),
}));
const archivos = await readdir(CARTAS);
const archivo = (n) => {
  if (FUERA.has(n)) throw new Error(`La carta ${n} no va en imágenes para compartir.`);
  return `file://${join(CARTAS, archivos.find((f) => f.startsWith(`${String(n).padStart(2, "0")}-`)))}`;
};
const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const carta = (n, estilo) => `<div class="carta" style="${estilo}">
  <img src="${archivo(n)}" alt=""><span>${n}</span>
</div>`;

const page = ({ antetitulo, titulo, url, cartas }) => `<!doctype html>
<html lang="es-MX"><head><meta charset="utf-8">
<style>
  @font-face { font-family: "Fraunces"; src: url("${FONTS}/fraunces-400_600-normal.woff2") format("woff2"); font-weight: 400 600; font-display: block; }
  @font-face { font-family: "Instrument Sans"; src: url("${FONTS}/instrument-sans-400_700-normal.woff2") format("woff2"); font-weight: 400 700; font-display: block; }
  * { box-sizing: border-box; margin: 0; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body { position: relative; background: linear-gradient(#1D2D76, #131E4E); color: #FBF3E4; font-family: "Instrument Sans", sans-serif; }
  .texto { position: absolute; left: 72px; top: 60px; bottom: 60px; width: 590px; display: flex; flex-direction: column; }
  .marca { display: flex; align-items: center; gap: 16px; font-family: "Fraunces"; font-weight: 500; font-size: 42px; }
  .marca img { width: 64px; height: 64px; border-radius: 16px; }
  .antetitulo { margin-top: auto; font-size: 26px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: rgb(251 243 228 / 0.75); }
  h1 { margin-top: 14px; font-family: "Fraunces"; font-weight: 500; font-variation-settings: "opsz" 144; font-size: 74px; line-height: 1.02;
    letter-spacing: -0.02em; text-wrap: balance; }
  .url { margin-top: 32px; align-self: flex-start; padding: 14px 26px; border-radius: 999px; background: #FBF3E4; color: #16225A;
    font-size: ${url.length > 32 ? 21 : 26}px; font-weight: 600; white-space: nowrap; }
  .carta { position: absolute; width: 270px; aspect-ratio: 2 / 3; border-radius: 19px; overflow: hidden; background: #F6EBD4;
    box-shadow: 0 24px 50px -14px rgb(0 0 0 / 0.55); }
  .carta img { width: 100%; height: 100%; object-fit: cover; }
  .carta span { position: absolute; left: 20px; top: 14px; font-family: "Fraunces"; font-weight: 500; font-size: 30px; color: #1F1A17; }
</style></head>
<body>
  <div class="texto">
    <div class="marca"><img src="${ICONO}" alt="">Frijolito</div>
    <p class="antetitulo">${escape(antetitulo)}</p>
    <h1>${escape(titulo)}</h1>
    <div class="url">${escape(url)}</div>
  </div>
  ${carta(cartas[0], "left: 650px; top: 150px; rotate: -12deg;")}
  ${carta(cartas[2], "left: 862px; top: 140px; rotate: 11deg;")}
  ${carta(cartas[1], "left: 756px; top: 100px; rotate: -1deg;")}
</body></html>`;

const pages = paginas.map((p) =>
  p.slug
    ? { file: `frijolito/${p.slug}.jpeg`, antetitulo: "Lotería mexicana", titulo: p.titulo, url: `gomflo.dev/frijolito/${p.slug}`, cartas: p.cartas }
    : { file: "frijolito.jpeg", antetitulo: "Con voz y verso", titulo: p.titulo, url: "gomflo.dev/frijolito", cartas: p.cartas },
);
// La portada en inglés (src/pages/frijolito/en/) no está en el catálogo: sus enlaces y tarjetas son en español.
pages.push({ file: "frijolito/en.jpeg", antetitulo: "Called in Spanish", titulo: "Mexican lotería caller", url: "gomflo.dev/frijolito/en", cartas: [1, 23, 27] });

await mkdir(join(OUT, "frijolito"), { recursive: true });
const work = await mkdtemp(join(tmpdir(), "og-frijolito-"));
for (const [i, p] of pages.entries()) {
  const htmlPath = join(work, `${i}.html`);
  const pngPath = join(work, `${i}.png`);
  await writeFile(htmlPath, page(p));
  await run(CHROME, [
    "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", "--allow-file-access-from-files",
    "--window-size=1200,630", "--virtual-time-budget=4000", `--screenshot=${pngPath}`, `file://${htmlPath}`,
  ]);
  await run("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "82", pngPath, "--out", join(OUT, p.file)]);
  console.log(`✓ ${p.file}`);
}
await rm(work, { recursive: true, force: true });

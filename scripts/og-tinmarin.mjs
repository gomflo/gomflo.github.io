/**
 * Imágenes para compartir (Open Graph, 1200×630) de /tinmarin/ y sus guías, con la identidad de la app
 * (tema Feria): crema, tinta gruesa, sombra dura y la ruleta de colores.
 *
 *   npm run og:tinmarin
 *
 * No necesita el build: los títulos salen de src/data/tinmarin-guias.ts. Escribe public/img/tinmarin.jpeg
 * y public/img/tinmarin/<slug>.jpeg. Vuelve a correrlo al agregar una guía.
 *
 * Chrome: usa CHROME_PATH o la ruta estándar de macOS.
 */
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const ROOT = new URL("..", import.meta.url).pathname;
const OUT = join(ROOT, "public/img");
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const FONTS = `file://${join(ROOT, "public/fonts")}`;
const ICONO = `file://${join(ROOT, "public/img/android/tinmarin/icono.png")}`;

if (!existsSync(CHROME)) throw new Error(`No encontré Chrome en ${CHROME}. Define CHROME_PATH.`);

// Las guías se leen del catálogo sin compilar TypeScript: cada una trae slug y nombre en ese orden.
const catalogo = await readFile(join(ROOT, "src/data/tinmarin-guias.ts"), "utf8");
const guias = [...catalogo.matchAll(/slug: "([^"]+)",\s*nombre: "([^"]+)"/g)].map((m) => ({ slug: m[1], nombre: m[2] }));

const CASILLAS = ["#FF3D2E", "#FFC400", "#1FB5A8", "#2D4BFF", "#FF8AC8"];
const NOMBRES = ["Ana", "Beto", "Carla", "Dani", "Elena", "Fer", "Gaby", "Hugo"];
const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** La rueda en SVG: casillas con su nombre, borde de tinta, eje blanco y el puntero a la derecha. */
function rueda(nombres) {
  const r = 230;
  const n = nombres.length;
  const paso = (2 * Math.PI) / n;
  const casillas = nombres
    .map((nombre, i) => {
      const a0 = i * paso - Math.PI / 2;
      const a1 = a0 + paso;
      const [x0, y0, x1, y1] = [Math.cos(a0) * r, Math.sin(a0) * r, Math.cos(a1) * r, Math.sin(a1) * r];
      const color = CASILLAS[i % CASILLAS.length];
      const texto = color === "#FFC400" || color === "#FF8AC8" ? "#17130F" : "#FFFFFF";
      const medio = ((a0 + paso / 2) * 180) / Math.PI;
      return `<path d="M0 0L${x0.toFixed(1)} ${y0.toFixed(1)}A${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}Z" fill="${color}" stroke="#17130F" stroke-width="5"/>
        <text transform="rotate(${medio.toFixed(1)}) translate(${r * 0.6} 0)" fill="${texto}" text-anchor="middle" dominant-baseline="central">${escape(nombre)}</text>`;
    })
    .join("");
  return `<svg class="rueda" viewBox="-250 -300 600 600" aria-hidden="true">
    <circle r="${r + 12}" fill="#17130F" transform="translate(0 10)"/>
    <circle r="${r + 12}" fill="#17130F"/>
    ${casillas}
    <circle r="46" fill="#FFFFFF" stroke="#17130F" stroke-width="6"/>
    <circle r="16" fill="#FF3D2E"/>
    <path d="M${r + 4} 0L${r + 48} -26Q${r + 64} 0 ${r + 48} 26Z" fill="#FF3D2E" stroke="#17130F" stroke-width="6" stroke-linejoin="round"/>
    <circle cx="${r + 44}" r="7" fill="#FFFFFF"/>
  </svg>`;
}

const page = ({ antetitulo, titulo, url }) => `<!doctype html>
<html lang="es-MX"><head><meta charset="utf-8">
<style>
  @font-face { font-family: "Bricolage Grotesque"; src: url("${FONTS}/bricolage-grotesque-200_800-normal.woff2") format("woff2");
    font-weight: 200 800; font-stretch: 75% 100%; font-display: block; }
  @font-face { font-family: "DM Sans"; src: url("${FONTS}/dm-sans-100_1000-normal.woff2") format("woff2"); font-weight: 100 1000; font-display: block; }
  * { box-sizing: border-box; margin: 0; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body { position: relative; background: #FFF8EC; color: #17130F; font-family: "DM Sans", sans-serif; }
  .texto { position: absolute; left: 64px; top: 56px; bottom: 56px; width: 560px; display: flex; flex-direction: column; }
  .marca { display: flex; align-items: center; gap: 16px; font-family: "Bricolage Grotesque"; font-weight: 800; font-size: 40px; letter-spacing: -0.01em; }
  .marca img { width: 64px; height: 64px; border-radius: 16px; border: 4px solid #17130F; }
  .antetitulo { margin-top: auto; font-size: 30px; font-weight: 700; color: #6B6257; }
  h1 { margin-top: 10px; font-family: "Bricolage Grotesque"; font-weight: 800; font-stretch: 90%; font-size: 76px; line-height: 0.98;
    letter-spacing: -0.02em; text-wrap: balance; }
  .url { margin-top: 30px; align-self: flex-start; padding: 12px 24px; border: 4px solid #17130F; border-radius: 999px; background: #FFFFFF;
    box-shadow: 0 6px 0 #17130F; font-size: ${url.length > 30 ? 21 : 26}px; font-weight: 700; white-space: nowrap; }
  .rueda { position: absolute; right: 8px; top: 50%; width: 560px; height: 560px; translate: 0 -50%; }
  .rueda text { font-family: "Bricolage Grotesque"; font-weight: 800; font-size: 40px; }
</style></head>
<body>
  <div class="texto">
    <div class="marca"><img src="${ICONO}" alt="">Tin Marín</div>
    <p class="antetitulo">${escape(antetitulo)}</p>
    <h1>${escape(titulo)}</h1>
    <div class="url">${escape(url)}</div>
  </div>
  ${rueda(NOMBRES)}
</body></html>`;

const pages = [
  { file: "tinmarin.jpeg", antetitulo: "Gratis, sin anuncios y sin cuenta", titulo: "Ruleta de nombres para sortear", url: "gomflo.dev/tinmarin" },
  ...guias.map((g) => ({
    file: `tinmarin/${g.slug}.jpeg`,
    antetitulo: "Ruleta de nombres para sortear",
    titulo: g.nombre,
    url: `gomflo.dev/tinmarin/${g.slug}`,
  })),
];

await mkdir(join(OUT, "tinmarin"), { recursive: true });
const work = await mkdtemp(join(tmpdir(), "og-tinmarin-"));
for (const [i, p] of pages.entries()) {
  const htmlPath = join(work, `${i}.html`);
  const pngPath = join(work, `${i}.png`);
  await writeFile(htmlPath, page(p));
  await run(CHROME, [
    "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", "--allow-file-access-from-files",
    "--window-size=1200,630", "--virtual-time-budget=4000", `--screenshot=${pngPath}`, `file://${htmlPath}`,
  ]);
  await run("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "85", pngPath, "--out", join(OUT, p.file)]);
  console.log(`✓ ${p.file}`);
}
await rm(work, { recursive: true, force: true });

// Descarga la guía de partidos televisados y la guarda como JSON para /partidos/.
// Uso: npm run partidos  (en CI corre antes de `npm run build`).
// Si la descarga o el análisis fallan, se conserva el archivo anterior y el proceso no rompe el build.
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createCrestResolver } from "./escudos.mjs";

const SOURCE = "https://www.futbolenvivomexico.com/";
const OUT = fileURLToPath(new URL("../src/data/partidos.json", import.meta.url));
// Días a guardar a partir de hoy: suficiente para que una compilación vieja siga sirviendo.
const MAX_DAYS = 8;
// La guía publica las horas en el centro de México (UTC−6, sin horario de verano desde 2022).
const OFFSET = "-06:00";

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function decode(text) {
  return text
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m)
    .replace(/\s+/g, " ")
    .trim();
}

function first(html, re) {
  const m = html.match(re);
  return m ? decode(m[1]) : undefined;
}

function slugify(text) {
  return text.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
}

// Escudos y logos de la guía (32 px, webp, con CORS abierto).
function logo(html) {
  const src = html.match(/<img[^>]*\ssrc="(https:\/\/static\.futbolenlatv\.com\/[^"]+)"/)?.[1];
  return src && !/sinimagen|default/i.test(src) ? src : undefined;
}

function parseChannel(raw) {
  const label = decode(raw);
  // "DAZN App Gratis (Ver gratis)" → "DAZN App Gratis"; "Prime Video (Míralo en vivo)" → "Prime Video"
  const name = label.replace(/\s*\([^)]*\)\s*$/, "").trim();
  // Gratis: TV abierta, YouTube, servicios con anuncios y sitios web de las cadenas.
  const free = /gratis|youtube|tubi|pluto|\.com\b|azteca (7|uno)|canal 5|las estrellas|imagen tv|nu9ve/i.test(label);
  return { name, free };
}

function parseTable(table) {
  const header = table.match(/class="cabeceraTabla[^"]*">\s*<td[^>]*>([^<]*)/);
  const dm = header?.[1].match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!dm) return null;
  const date = `${dm[3]}-${dm[2]}-${dm[1]}`;

  const matches = [];
  let league = { name: "Otros", slug: "otros", logo: undefined };

  for (const [, attrs, row] of table.matchAll(/<tr([^>]*)>([\s\S]*?)<\/tr>/g)) {
    if (attrs.includes("cabeceraCompericion")) {
      // Algunas competiciones no tienen enlace: el nombre sale del title del logo.
      const m = row.match(/href="\/competicion\/([^"]+)"[^>]*>([^<]+)</);
      const name = m ? decode(m[2]) : first(row, /<img[^>]*title="([^"]*)"/);
      if (name) league = { name, slug: m?.[1] ?? slugify(name), logo: logo(row) };
      continue;
    }
    const time = first(row, /<td class="hora[^"]*">([^<]*)<\/td>/);
    const homeCell = row.match(/<td class="local">([\s\S]*?)<\/td>/)?.[1] ?? "";
    const awayCell = row.match(/<td class="visitante">([\s\S]*?)<\/td>/)?.[1] ?? "";
    const home = first(homeCell, /<span title="([^"]*)"/);
    const away = first(awayCell, /<span title="([^"]*)"/);
    if (!time || !home || !away || !/^\d{1,2}:\d{2}$/.test(time)) continue;

    const canales = row.match(/<ul class="listaCanales">([\s\S]*?)<\/ul>/)?.[1] ?? "";
    const channels = [...canales.matchAll(/<li[^>]*title="([^"]*)"/g)]
      .map((m) => parseChannel(m[1]))
      .filter((c) => c.name && !/por confirmar/i.test(c.name));

    const hhmm = time.padStart(5, "0");
    matches.push({
      id: slugify(`${date}-${hhmm}-${home}-${away}`),
      start: `${date}T${hhmm}:00${OFFSET}`,
      league: league.name,
      leagueSlug: league.slug,
      leagueLogo: league.logo,
      round: first(row.match(/<td class="detalles[^"]*">([\s\S]*?)<\/td>/)?.[1] ?? "", /<span title="([^"]*)"/),
      home,
      away,
      homeLogo: logo(homeCell),
      awayLogo: logo(awayCell),
      venue: first(row, /itemtype="https:\/\/schema.org\/Place">\s*<meta itemprop="name" content="([^"]*)"/),
      channels,
    });
  }
  return { date, matches };
}

async function main() {
  const res = await fetch(SOURCE, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; gomflo.dev/partidos)", "accept-language": "es-MX" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`La guía respondió ${res.status}`);
  const html = await res.text();

  const days = html
    .split('<table class="tablaPrincipal')
    .slice(1)
    .map(parseTable)
    .filter(Boolean)
    .slice(0, MAX_DAYS);

  const total = days.reduce((n, d) => n + d.matches.length, 0);
  if (total === 0) throw new Error("No se encontró ningún partido: ¿cambió el HTML de la guía?");

  // Escudos nítidos: si ESPN o la bandera no aparecen, queda el de 32 px de la guía.
  const crests = await createCrestResolver();
  let hd = 0;
  const teams = days.flatMap((d) => d.matches).flatMap((m) => [
    ["home", m],
    ["away", m],
  ]);
  for (const [side, m] of teams) {
    const url = crests.resolve(m[side], m.league);
    if (url) {
      m[`${side}Logo`] = url;
      hd++;
    }
  }
  console.log(`partidos: ${hd} de ${teams.length} escudos en alta resolución (${crests.loaded}/${crests.total} ligas de ESPN)`);

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), source: SOURCE, days }));
  console.log(`partidos: ${total} partidos en ${days.length} días → ${OUT}`);
}

main().catch(async (e) => {
  const kept = await readFile(OUT).then(() => true, () => false);
  console.warn(`partidos: ${e instanceof Error ? e.message : e}. ${kept ? "Se conserva el archivo anterior." : "La página saldrá vacía."}`);
});

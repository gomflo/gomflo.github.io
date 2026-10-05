// Escudos en alta resolución para la guía de partidos.
// - Selecciones: bandera SVG de flagcdn.com, a partir del nombre del país en español.
// - Clubes: escudo de 500 px de ESPN, cruzando nombres con las ligas que cubre su API.
// Si nada coincide, el partido conserva el escudo de 32 px de la guía.

const ESPN = "https://site.api.espn.com/apis/site/v2/sports/soccer";

/** Ligas de ESPN y la competición de la guía que les corresponde (por nombre). */
const LEAGUES = [
  ["mex.1", /^liga mx$/],
  ["mex.2", /expansi[oó]n/],
  ["mex.w.1", /femenil/],
  ["eng.1", /^premier league$/],
  ["eng.2", /championship/],
  ["esp.1", /la ?liga(?! hypermotion)/],
  ["esp.2", /hypermotion|segunda/],
  ["ita.1", /serie a italiana/],
  ["ita.2", /serie b italiana/],
  ["ger.1", /^bundesliga$/],
  ["ger.2", /^2\. bundesliga$/],
  ["fra.1", /ligue 1/],
  ["por.1", /portuguesa/],
  ["ned.1", /eredivisie/],
  ["usa.1", /^mls$/],
  ["arg.1", /primera divisi[oó]n argentina/],
  ["bra.1", /serie a brasil/],
  ["col.1", /colombiana|betplay/],
  ["ksa.1", /saudi/],
  ["tur.1", /turca/],
  ["per.1", /per[uú]/],
  ["uru.1", /uruguaya/],
  ["chi.1", /chilena|chile/],
  ["uefa.champions", /champions league$/],
  ["uefa.europa", /europa league/],
  ["conmebol.libertadores", /libertadores/],
  ["concacaf.champions", /concacaf champions/],
  ["concacaf.leagues.cup", /leagues cup/],
  ["eng.w.1", /women's super league|wsl/],
  ["aut.1", /admiral bundesliga/],
  ["arg.2", /primera nacional/],
];

/** Competiciones de selecciones: ahí los equipos son países. */
const NATIONAL = /amistoso|nations league|eliminatoria|mundial|copa am[eé]rica|copa oro|eurocopa|sub-?\d+|clasificaci[oó]n/i;

// Nombres de la guía que Intl no resuelve igual.
const COUNTRY_ALIASES = {
  inglaterra: "gb-eng",
  escocia: "gb-sct",
  gales: "gb-wls",
  "irlanda norte": "gb-nir",
  eeuu: "us",
  "estados unidos": "us",
  usa: "us",
  "islas virgenes eeuu": "vi",
  "islas virgenes britanicas": "vg",
  "corea sur": "kr",
  "corea norte": "kp",
  "republica checa": "cz",
  chequia: "cz",
  curazao: "cw",
  "sint maarten": "sx",
  "san vicente granadinas": "vc",
  "san cristobal nieves": "kn",
  "trinidad tobago": "tt",
  "costa marfil": "ci",
  "turcas caicos": "tc",
  "islas turcas caicos": "tc",
  aiques: "tc",
  "bosnia herzegovina": "ba",
  "macedonia norte": "mk",
  "rd congo": "cd",
  holanda: "nl",
  "paises bajos": "nl",
  kosovo: "xk",
  bosnia: "ba",
  bonaire: "bq",
  "saint martin": "mf",
};

// Abreviaturas de la guía → nombre de ESPN (ambos ya normalizados).
const CLUB_ALIASES = {
  "u guadalajara": "leones negros",
  "manchester utd": "manchester united",
  "inter milan": "internazionale",
  "o lyonnais": "lyon",
  "stade brestois": "brest",
  "hamburger sv": "hamburg sv",
  "new york rb": "red bull new york",
  "sporting kc": "sporting kansas city",
  angeles: "lafc",
  "atletico paranaense": "athletico paranaense",
  "dc united": "d c united",
  "red bull salzburg": "rb salzburg",
  "austria wien": "austria vienna",
  "rapid wien": "rapid vienna",
  "sv ried": "sv josko ried",
  "grazer ak 1902": "grazer ak",
  "scr altach": "sc rheindorf altach",
  "wolfsberger": "wolfsberger",
};

// Palabras abreviadas que la guía usa seguido.
const EXPAND = { at: "atletico", utd: "united", dep: "deportivo", ind: "independiente" };

const STOP = new Set(["fc", "cf", "cd", "sc", "ac", "afc", "club", "de", "del", "la", "las", "el", "los", "y", "the", "femenino", "fem", "w"]);

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\bsub-?\d+\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .map((w) => EXPAND[w] ?? w)
    .filter((w) => w && !STOP.has(w))
    .join(" ");
}

function countryCodes() {
  const names = new Intl.DisplayNames(["es"], { type: "region" });
  const map = new Map(Object.entries(COUNTRY_ALIASES));
  const A = 65;
  for (let i = 0; i < 26; i++) {
    for (let j = 0; j < 26; j++) {
      const code = String.fromCharCode(A + i, A + j);
      const name = names.of(code);
      if (name && name !== code) {
        const key = normalize(name);
        if (!map.has(key)) map.set(key, code.toLowerCase());
      }
    }
  }
  return map;
}

async function espnTeams(code) {
  try {
    const res = await fetch(`${ESPN}/${code}/teams?lang=es&region=mx&limit=500`, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.sports?.[0]?.leagues?.[0]?.teams ?? [])
      .map(({ team }) => ({
        keys: [...new Set([team.displayName, team.shortDisplayName, team.location, team.name].filter(Boolean).map(normalize))],
        logo: team.logos?.[0]?.href,
      }))
      // Sin escudo o con el genérico de ESPN: mejor el de la guía.
      .filter((t) => t.logo && !/default\.png$/.test(t.logo));
  } catch {
    return [];
  }
}

/** Crea el resolvedor: (equipo, competición) → URL del escudo en alta resolución o undefined. */
export async function createCrestResolver() {
  const countries = countryCodes();
  const pools = new Map(await Promise.all(LEAGUES.map(async ([code]) => [code, await espnTeams(code)])));
  const everyone = [...pools.values()].flat();
  const loaded = [...pools.values()].filter((p) => p.length).length;

  const exact = (pool, key) => pool.find((t) => t.keys.includes(key));
  const tokens = (s) => new Set(s.split(" "));
  // "Chivas Guadalajara" ↔ "Guadalajara": todas las palabras de uno están en el otro.
  const partial = (pool, key) => {
    const mine = tokens(key);
    const hits = pool.filter((t) =>
      t.keys.some((k) => {
        const theirs = tokens(k);
        const [small, big] = theirs.size <= mine.size ? [theirs, mine] : [mine, theirs];
        return [...small].every((w) => w.length > 2 && big.has(w));
      }),
    );
    const logos = new Set(hits.map((t) => t.logo));
    return logos.size === 1 ? hits[0] : undefined;
  };

  const resolve = (team, league) => {
    const raw = normalize(team);
    if (!raw) return undefined;
    const key = CLUB_ALIASES[raw] ?? raw;

    if (NATIONAL.test(league) || /sub-?\d+/i.test(team)) {
      const code = countries.get(raw);
      if (code) return `https://flagcdn.com/${code}.svg`;
    }

    const leagueKey = league.toLowerCase();
    const context = LEAGUES.filter(([, re]) => re.test(leagueKey)).flatMap(([code]) => pools.get(code) ?? []);
    // Coincidencia exacta en cualquier liga; la parcial solo dentro de la liga del partido,
    // para no confundir "U de Guadalajara" con "Guadalajara".
    return (exact(context, key) ?? exact(everyone, key) ?? partial(context, key))?.logo;
  };

  return { resolve, loaded, total: LEAGUES.length };
}

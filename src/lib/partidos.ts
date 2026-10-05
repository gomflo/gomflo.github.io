// Guía de partidos: tipos del JSON que genera scripts/partidos.mjs y lógica pura de la página.

export interface Channel {
  name: string;
  free: boolean;
}

export interface Match {
  id: string;
  /** ISO 8601 con desfase del centro de México. */
  start: string;
  league: string;
  leagueSlug: string;
  leagueLogo?: string;
  round?: string;
  home: string;
  away: string;
  homeLogo?: string;
  awayLogo?: string;
  venue?: string;
  channels: Channel[];
}

export interface MatchDay {
  /** YYYY-MM-DD en el centro de México. */
  date: string;
  matches: Match[];
}

export interface MatchData {
  generatedAt: string;
  source: string;
  days: MatchDay[];
}

export const MX_TZ = "America/Mexico_City";
/** Duración que se asume para un partido: 90 minutos, medio tiempo y reposición. */
export const MATCH_MINUTES = 115;

export type MatchStatus = "upcoming" | "live" | "finished";

export function matchStatus(match: Match, now: number): MatchStatus {
  const start = Date.parse(match.start);
  if (now < start) return "upcoming";
  return now < start + MATCH_MINUTES * 60_000 ? "live" : "finished";
}

/** Minuto aproximado del partido, contando 15 minutos de medio tiempo. */
export function liveMinute(match: Match, now: number): string {
  const elapsed = Math.floor((now - Date.parse(match.start)) / 60_000);
  if (elapsed < 1) return "1'";
  if (elapsed <= 45) return `${elapsed}'`;
  if (elapsed < 50) return "45+'";
  if (elapsed < 62) return "MT";
  const second = elapsed - 17;
  return second <= 90 ? `${second}'` : "90+'";
}

/** Fecha YYYY-MM-DD de un instante en el centro de México. */
export function mxDate(instant: number): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: MX_TZ }).format(instant);
}

/** "en 2 h 15 min", "en 8 min". */
export function countdown(match: Match, now: number): string {
  const minutes = Math.max(1, Math.round((Date.parse(match.start) - now) / 60_000));
  if (minutes < 60) return `en ${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `en ${h} h ${m} min` : `en ${h} h`;
}

export function normalize(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
}

export function matchesQuery(match: Match, query: string): boolean {
  const q = normalize(query.trim());
  if (!q) return true;
  const haystack = normalize([match.home, match.away, match.league, match.round, ...match.channels.map((c) => c.name)].join(" "));
  return q.split(/\s+/).every((word) => haystack.includes(word));
}

/** Monograma de dos letras para el escudo genérico: "Chivas Guadalajara" → "CG". */
export function initials(team: string): string {
  const words = team
    .replace(/\b(Femenino|Sub-?\d+|FC|CF|CD|CA|Club|de|del|la|el)\b/gi, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return team.slice(0, 2).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/** Tono estable (0–359) por equipo para el fondo del monograma. */
export function teamHue(team: string): number {
  let h = 0;
  for (const ch of team) h = (h * 31 + ch.codePointAt(0)!) % 360;
  return h;
}

function icsDate(instant: number): string {
  return new Date(instant).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function icsText(text: string): string {
  return text.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");
}

/** Evento de calendario (.ics) con los canales en la descripción y aviso 15 minutos antes. */
export function toIcs(match: Match): string {
  const start = Date.parse(match.start);
  const channels = match.channels.map((c) => c.name).join(", ") || "Canal por confirmar";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//gomflo.dev//partidos//ES",
    "BEGIN:VEVENT",
    `UID:${match.id}@gomflo.dev`,
    `DTSTAMP:${icsDate(Date.now())}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(start + MATCH_MINUTES * 60_000)}`,
    `SUMMARY:${icsText(`${match.home} vs ${match.away}`)}`,
    `DESCRIPTION:${icsText(`${match.league}\nDónde verlo: ${channels}`)}`,
    match.venue ? `LOCATION:${icsText(match.venue)}` : "",
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${icsText(`${match.home} vs ${match.away} en 15 minutos`)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}

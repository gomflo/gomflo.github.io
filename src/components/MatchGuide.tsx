import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarPlus, ChevronLeft, MapPin, Search, Share2, Star, Tv, X } from "lucide-react";
import {
  MX_TZ,
  countdown,
  initials,
  liveMinute,
  matchStatus,
  matchesQuery,
  mxDate,
  teamHue,
  toIcs,
  type Match,
  type MatchData,
} from "@/lib/partidos";

const FAV_KEY = "partidos:favoritos";

function dayLabel(date: string, today: string | null) {
  const d = new Date(`${date}T12:00:00-06:00`);
  const num = d.toLocaleDateString("es-MX", { day: "numeric", month: "short", timeZone: MX_TZ }).replace(".", "");
  if (today) {
    const diff = Math.round((Date.parse(`${date}T12:00:00Z`) - Date.parse(`${today}T12:00:00Z`)) / 86_400_000);
    if (diff === 0) return { top: "Hoy", num };
    if (diff === 1) return { top: "Mañana", num };
    if (diff === -1) return { top: "Ayer", num };
  }
  const top = d.toLocaleDateString("es-MX", { weekday: "short", timeZone: MX_TZ }).replace(".", "");
  return { top: top.charAt(0).toUpperCase() + top.slice(1), num };
}

function longDate(date: string) {
  const s = new Date(`${date}T12:00:00-06:00`).toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: MX_TZ,
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatTime(iso: string, timeZone: string) {
  return new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone });
}

/** Escudo de la guía; si no carga, monograma con color estable. */
function Crest({ src, name, className = "mg-crest" }: { src?: string; name: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    // Banderas en círculo; los escudos de 32 px de la guía no se agrandan para que no se vean borrosos.
    const kind = src.includes("flagcdn.com") ? "flag" : src.includes("futbolenlatv.com") ? "small" : "hd";
    return (
      <span className={`${className} mg-logo`} data-kind={kind}>
        <img src={src} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} />
      </span>
    );
  }
  return (
    <span className={`${className} mg-monogram`} style={{ "--hue": teamHue(name) } as React.CSSProperties} aria-hidden="true">
      {initials(name).slice(0, 2)}
    </span>
  );
}

interface RowProps {
  match: Match;
  now: number | null;
  timeZone: string;
  favorites: Set<string>;
  showLeague?: boolean;
  onOpen: (match: Match) => void;
}

function MatchRow({ match, now, timeZone, favorites, showLeague, onOpen }: RowProps) {
  const status = now === null ? "upcoming" : matchStatus(match, now);
  const time = formatTime(match.start, timeZone);
  const soon = status === "upcoming" && now !== null && Date.parse(match.start) - now < 3 * 3_600_000;
  const channels = match.channels.map((c) => c.name).join(" · ") || "Canal por confirmar";
  const free = match.channels.some((c) => c.free);
  const label = `${match.home} contra ${match.away}, ${
    status === "live" ? "en vivo" : status === "finished" ? "terminado" : `a las ${time}`
  }. ${channels}`;

  return (
    <li>
      <button type="button" className="mg-row" data-status={status} onClick={() => onOpen(match)} aria-label={label} aria-haspopup="dialog">
        <span className="mg-time" aria-hidden="true">
          {status === "live" && now !== null ? (
            <>
              <span className="mg-minute">{liveMinute(match, now)}</span>
              <span className="mg-sub mg-live-label">En vivo</span>
            </>
          ) : (
            <>
              <span className="mg-clock">{time}</span>
              {status === "finished" && <span className="mg-sub">Final</span>}
              {soon && now !== null && <span className="mg-sub mg-soon">{countdown(match, now)}</span>}
            </>
          )}
        </span>

        <span className="mg-body" aria-hidden="true">
          {showLeague && <span className="mg-row-league">{match.league}</span>}
          {[
            { team: match.home, logo: match.homeLogo },
            { team: match.away, logo: match.awayLogo },
          ].map(({ team, logo }, i) => (
            <span className="mg-team" key={team + i}>
              <Crest src={logo} name={team} />
              <span className="mg-team-name">{team}</span>
              {favorites.has(team) && <Star className="mg-fav-mark" />}
            </span>
          ))}
          <span className="mg-channels-line">
            <Tv />
            <span className="mg-channels-text">{channels}</span>
            {free && <span className="mg-free">Gratis</span>}
          </span>
        </span>
      </button>
    </li>
  );
}

interface SheetProps {
  match: Match | null;
  now: number | null;
  timeZone: string;
  favorites: Set<string>;
  onClose: () => void;
  onToggleFavorite: (team: string) => void;
  onChannel: (name: string) => void;
  onShare: (match: Match) => void;
}

/** Hoja con el detalle del partido: canales, estadio y acciones. */
function MatchSheet({ match, now, timeZone, favorites, onClose, onToggleFavorite, onChannel, onShare }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (match && !dialog.open) {
      dialog.showModal();
      // El foco va a la hoja y no al botón de cerrar, para no mostrar su aro al abrir.
      dialog.focus();
    }
    if (!match && dialog.open) dialog.close();
  }, [match]);

  const status = match && now !== null ? matchStatus(match, now) : "upcoming";

  const downloadIcs = () => {
    if (!match) return;
    const url = URL.createObjectURL(new Blob([toIcs(match)], { type: "text/calendar;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${match.id}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <dialog
      ref={ref}
      className="mg-sheet"
      aria-labelledby="mg-sheet-title"
      tabIndex={-1}
      onClose={onClose}
      onClick={(e) => {
        // Clic en el fondo (fuera del contenido) cierra la hoja.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {match && (
        <div className="mg-sheet-inner">
          <div className="mg-sheet-grip" aria-hidden="true" />
          <header className="mg-sheet-head">
            <p className="mg-sheet-league">
              {match.league}
              {match.round && ` · ${match.round}`}
            </p>
            <button type="button" className="mg-icon-btn" onClick={onClose} aria-label="Cerrar">
              <X />
            </button>
          </header>

          <h2 id="mg-sheet-title" className="sr-only">
            {match.home} contra {match.away}
          </h2>
          <div className="mg-versus">
            {[
              { team: match.home, logo: match.homeLogo },
              { team: match.away, logo: match.awayLogo },
            ].map(({ team, logo }, i) => (
              <div className={`mg-side ${i === 0 ? "mg-side-home" : "mg-side-away"}`} key={team + i}>
                <Crest src={logo} name={team} className="mg-crest-lg" />
                <span className="mg-side-name">{team}</span>
                <button type="button" className="mg-follow" aria-pressed={favorites.has(team)} onClick={() => onToggleFavorite(team)}>
                  <Star aria-hidden="true" />
                  {favorites.has(team) ? "Siguiendo" : "Seguir"}
                  <span className="sr-only"> a {team}</span>
                </button>
              </div>
            ))}
            <div className="mg-vs-center">
              {status === "live" && now !== null ? (
                <>
                  <span className="mg-minute mg-minute-lg">{liveMinute(match, now)}</span>
                  <span className="mg-sub mg-live-label">En vivo</span>
                </>
              ) : (
                <>
                  <span className="mg-vs-time">{formatTime(match.start, timeZone)}</span>
                  <span className="mg-sub">{status === "finished" ? "Final" : longDate(match.start.slice(0, 10))}</span>
                </>
              )}
            </div>
          </div>

          <section className="mg-sheet-section" aria-labelledby="mg-where">
            <h3 id="mg-where">Dónde verlo</h3>
            {match.channels.length === 0 ? (
              <p className="mg-muted">Canal por confirmar.</p>
            ) : (
              <ul className="mg-channel-list">
                {match.channels.map((c) => (
                  <li key={c.name}>
                    <button type="button" onClick={() => onChannel(c.name)}>
                      <Tv aria-hidden="true" />
                      <span className="mg-channel-name">{c.name}</span>
                      {c.free && <span className="mg-free">Gratis</span>}
                      <span className="mg-channel-more">Ver partidos</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {match.venue && (
            <p className="mg-venue">
              <MapPin aria-hidden="true" /> {match.venue}
            </p>
          )}

          {status !== "finished" && (
            <div className="mg-sheet-actions">
              <button type="button" className="mg-btn" onClick={downloadIcs}>
                <CalendarPlus aria-hidden="true" /> Calendario
              </button>
              <button type="button" className="mg-btn" onClick={() => onShare(match)}>
                <Share2 aria-hidden="true" /> Compartir
              </button>
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}

export default function MatchGuide({ data }: { data: MatchData }) {
  const days = data.days;
  // `now` vale null en el HTML estático: el estado en vivo y la zona horaria se calculan ya en el navegador.
  const [now, setNow] = useState<number | null>(null);
  const [timeZone, setTimeZone] = useState(MX_TZ);
  const [dayIndex, setDayIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Match | null>(null);
  const [notice, setNotice] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const daysRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = Date.now();
    setNow(t);
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone || MX_TZ);
    const today = mxDate(t);
    const idx = days.findIndex((d) => d.date >= today);
    setDayIndex(idx === -1 ? Math.max(0, days.length - 1) : idx);
    try {
      setFavorites(new Set(JSON.parse(localStorage.getItem(FAV_KEY) ?? "[]")));
    } catch {
      /* favoritos dañados: se empieza de cero */
    }
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, [days]);

  useEffect(() => {
    // Centra el día elegido moviendo solo la tira (scrollIntoView también desplazaría la página).
    const strip = daysRef.current;
    const active = strip?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (strip && active) strip.scrollLeft = active.offsetLeft - (strip.clientWidth - active.offsetWidth) / 2;
  }, [dayIndex]);

  useEffect(() => {
    if (searching) searchRef.current?.focus();
  }, [searching]);

  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(""), 2500);
    return () => clearTimeout(id);
  }, [notice]);

  const closeSearch = () => {
    setQuery("");
    setSearching(false);
    requestAnimationFrame(() => searchButtonRef.current?.focus());
  };

  const toggleFavorite = useCallback(
    (team: string) => {
      const next = new Set(favorites);
      if (next.has(team)) next.delete(team);
      else next.add(team);
      localStorage.setItem(FAV_KEY, JSON.stringify([...next]));
      setFavorites(next);
      setNotice(next.has(team) ? `Sigues a ${team}` : `Dejaste de seguir a ${team}`);
    },
    [favorites],
  );

  const filterByChannel = useCallback((name: string) => {
    setSelected(null);
    setQuery(name);
    setSearching(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const share = useCallback(
    async (m: Match) => {
      const text = `${m.home} vs ${m.away} · ${formatTime(m.start, timeZone)} · ${m.channels.map((c) => c.name).join(", ") || "canal por confirmar"}`;
      try {
        if (navigator.share) await navigator.share({ title: `${m.home} vs ${m.away}`, text, url: location.href });
        else {
          await navigator.clipboard.writeText(`${text}\n${location.href}`);
          setNotice("Copiado al portapapeles");
        }
      } catch (e) {
        if (!(e instanceof Error && e.name === "AbortError")) setNotice("No se pudo compartir");
      }
    },
    [timeZone],
  );

  const day = days[dayIndex];
  const today = now === null ? null : mxDate(now);
  const isFav = (m: Match) => favorites.has(m.home) || favorites.has(m.away);
  // En vivo, luego por jugarse y al final los terminados.
  const rank = (m: Match) => (now === null ? 1 : { live: 0, upcoming: 1, finished: 2 }[matchStatus(m, now)]);

  const visible = (day?.matches ?? [])
    .filter((m) => matchesQuery(m, query))
    .sort((a, b) => rank(a) - rank(b) || Date.parse(a.start) - Date.parse(b.start));

  // Tarjetas por competición, en el orden de la guía (las ligas mexicanas van primero).
  const leagueOrder = new Map((day?.matches ?? []).map((m, i) => [m.league, i]));
  const pinned = !query ? visible.filter((m) => isFav(m) && rank(m) < 2) : [];
  const groupLeagues = (list: Match[]) => {
    const groups = new Map<string, Match[]>();
    for (const m of list) groups.set(m.league, [...(groups.get(m.league) ?? []), m]);
    // Cada competición se ordena por su mejor partido (el primero ya es el más relevante).
    return [...groups].sort(([a, ma], [b, mb]) => rank(ma[0]) - rank(mb[0]) || leagueOrder.get(a)! - leagueOrder.get(b)!);
  };
  const active = groupLeagues(visible.filter((m) => rank(m) < 2 && !pinned.includes(m)));
  const finishedMatches = visible.filter((m) => rank(m) === 2);
  const finished = groupLeagues(finishedMatches);

  const rowProps = { now, timeZone, favorites, onOpen: setSelected };

  const leagueCard = (league: string, matches: Match[]) => (
    <section className="mg-card" key={league} aria-label={league}>
      <header className="mg-card-head">
        <Crest src={matches[0].leagueLogo} name={league} className="mg-league-logo" />
        <h2>{league}</h2>
      </header>
      <ul className="mg-rows">
        {matches.map((m) => (
          <MatchRow key={m.id} match={m} {...rowProps} />
        ))}
      </ul>
    </section>
  );

  // Monterrey o Mérida tienen otra zona IANA pero la misma hora: solo se avisa si el reloj cambia.
  const clock = (tz: string) => new Date(now ?? 0).toLocaleTimeString("es-MX", { timeZone: tz });
  const outsideMx = now !== null && clock(timeZone) !== clock(MX_TZ);

  return (
    <>
      <header className="mg-top">
        <div className="mg-appbar">
          {searching ? (
            <label className="mg-search">
              <Search aria-hidden="true" />
              <span className="sr-only">Buscar equipo, liga o canal</span>
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && closeSearch()}
                placeholder="Equipo, liga o canal"
                autoComplete="off"
                enterKeyHint="search"
              />
              <button type="button" className="mg-cancel" onClick={closeSearch}>
                Cancelar
              </button>
            </label>
          ) : (
            <>
              <a href="/" className="mg-icon-btn" aria-label="Volver a gomflo.dev">
                <ChevronLeft />
              </a>
              <h1 className="mg-title">Partidos</h1>
              <button ref={searchButtonRef} type="button" className="mg-icon-btn" onClick={() => setSearching(true)} aria-label="Buscar">
                <Search />
              </button>
            </>
          )}
        </div>

        <div className="mg-days" ref={daysRef} role="group" aria-label="Elegir día">
          {days.map((d, i) => {
            const label = dayLabel(d.date, today);
            return (
              <button
                key={d.date}
                type="button"
                className="mg-day"
                aria-pressed={i === dayIndex}
                aria-label={`${longDate(d.date)}, ${d.matches.length} partidos`}
                onClick={() => setDayIndex(i)}
              >
                <span className="mg-day-top">{label.top}</span>
                <span className="mg-day-num">{label.num}</span>
              </button>
            );
          })}
        </div>

      </header>

      <main id="guia" className="mg-main">
        <h2 className="sr-only" aria-live="polite">
          {day ? `${longDate(day.date)}: ${visible.length} partidos` : "Sin partidos"}
        </h2>
        {outsideMx && <p className="mg-tz-note">Horarios en tu zona ({timeZone.split("/").pop()?.replace(/_/g, " ")}).</p>}

        {!day && <p className="mg-empty">No hay partidos en la guía. Vuelve más tarde.</p>}

        {day && visible.length === 0 && (
          <div className="mg-empty">
            <p>Ningún partido coincide con “{query}” este día.</p>
            <button
              type="button"
              className="mg-btn"
              onClick={() => {
                setQuery("");
                setSearching(false);
              }}
            >
              Ver todos los partidos
            </button>
          </div>
        )}

        {pinned.length > 0 && (
          <section className="mg-card" aria-labelledby="mg-fav-title">
            <header className="mg-card-head">
              <Star className="mg-fav-icon" aria-hidden="true" />
              <h2 id="mg-fav-title">Mis equipos</h2>
            </header>
            <ul className="mg-rows">
              {pinned.map((m) => (
                <MatchRow key={m.id} match={m} showLeague {...rowProps} />
              ))}
            </ul>
          </section>
        )}

        {active.map(([league, matches]) => leagueCard(league, matches))}

        {finishedMatches.length > 0 && (
          <details className="mg-finished" open={active.length === 0 && pinned.length === 0}>
            <summary>Terminados ({finishedMatches.length})</summary>
            {finished.map(([league, matches]) => leagueCard(league, matches))}
          </details>
        )}
      </main>

      <MatchSheet
        match={selected}
        now={now}
        timeZone={timeZone}
        favorites={favorites}
        onClose={() => setSelected(null)}
        onToggleFavorite={toggleFavorite}
        onChannel={filterByChannel}
        onShare={share}
      />

      <p className="mg-toast" role="status" aria-live="polite" data-show={notice ? "" : undefined}>
        {notice}
      </p>
    </>
  );
}

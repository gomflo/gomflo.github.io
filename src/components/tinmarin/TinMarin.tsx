// Tin Marín en la web: la ruleta, el editor de nombres, los sorteos con su acta y el comprobador de códigos.
// Todo vive en este navegador (localStorage); no hay servidor ni cuenta. El sorteo es el mismo de la app,
// así que un código hecho en el teléfono se comprueba aquí con la misma lista.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MAX_NAMES, MAX_WEIGHT, interpret, key, parse } from "@/lib/tinmarin/lista";
import { layout, type Entry } from "@/lib/tinmarin/rueda";
import { listHash, parseSeedCode, pick, seedCode } from "@/lib/tinmarin/sorteo";
import { feria } from "./feria";
import Resultado, { type RevealInfo } from "./Resultado";
import Rueda, { type Outcome, type RuedaHandle } from "./Rueda";
import { play, buzz } from "./sonido";
import { entre, fechaHora, shareCard, type Acta } from "./tarjeta";

type Wheel = { name: string; entries: Entry[]; removeWinner: boolean };

/** Acta de un sorteo. La semilla va en hexadecimal porque JSON no guarda enteros de 64 bits. */
type DrawRecord = {
  id: number;
  timestamp: number;
  seed: string;
  hash: string;
  participants: number;
  tickets: number;
  winnerId: number;
  winnerLabel: string;
  color: string;
  place: number;
  series: boolean;
  wheelName: string;
};

type Data = {
  wheel: Wheel;
  history: DrawRecord[];
  nextId: number;
  sound: boolean;
  draws: number;
};

const STORE = "tinmarin";
const MAX_HISTORY = 500;
const STARTER_NAME = "¿A quién le toca?";
const STARTER = ["Ana", "Beto", "Carla", "Dani", "Elena", "Fer", "Gaby", "Hugo"];
const LIST_ROWS = 300;

const starterData = (): Data => ({
  wheel: {
    name: STARTER_NAME,
    entries: STARTER.map((label, i) => ({ id: i + 1, label, weight: 1 })),
    removeWinner: false,
  },
  history: [],
  nextId: STARTER.length + 1,
  sound: true,
  draws: 0,
});

function load(): Data {
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return starterData();
    const data = JSON.parse(raw) as Data;
    if (!data?.wheel?.entries || !Array.isArray(data.history)) return starterData();
    return { ...starterData(), ...data };
  } catch {
    return starterData();
  }
}

const isUntouchedStarter = (entries: Entry[]) =>
  entries.length === STARTER.length && entries.every((e, i) => e.label === STARTER[i] && e.weight === 1 && !e.removed);

const join = (entries: Entry[]) => entries.map((e) => e.label).join("\n");
const plural = (n: number, one: string, other: string) => `${n.toLocaleString("es-MX")} ${n === 1 ? one : other}`;

/** Reemplaza los participantes conservando id, boletos y estado de quienes ya estaban (por nombre, en orden). */
function setLabels(data: Data, labels: string[]): Data {
  const pool = new Map<string, Entry[]>();
  for (const e of data.wheel.entries) pool.set(e.label, [...(pool.get(e.label) ?? []), e]);
  let id = data.nextId;
  const entries = labels.map((label) => pool.get(label)?.shift() ?? { id: id++, label, weight: 1 });
  return { ...data, wheel: { ...data.wheel, entries }, nextId: id };
}

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const collator = new Intl.Collator("es-MX", {
  numeric: true,
  sensitivity: "base",
});

type Recheck = { kind: "ok"; label: string } | { kind: "changed"; hash: string; winnerLeft: boolean } | { kind: "mismatch"; label: string };

export default function TinMarin() {
  const [data, setData] = useState<Data>(starterData);
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState(() => join(starterData().wheel.entries));
  const [mode, setMode] = useState<"texto" | "lista">("texto");
  const [spinning, setSpinning] = useState(false);
  const [reveal, setReveal] = useState<{
    info: RevealInfo;
    origin: { x: number; y: number };
    record: DrawRecord;
  } | null>(null);
  const [notice, setNotice] = useState("");
  const [open, setOpen] = useState<number | null>(null);
  const [checks, setChecks] = useState<Record<number, Recheck>>({});
  const [presenting, setPresenting] = useState(false);
  const wheelRef = useRef<RuedaHandle>(null);
  const pointerOut = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const appRef = useRef<HTMLDivElement>(null);
  const noticeTimer = useRef(0);
  // Lo último guardado, para leerlo dentro de los manejadores sin esperar a que React vuelva a pintar.
  const dataRef = useRef(data);
  dataRef.current = data;
  const commit = (next: Data) => {
    dataRef.current = next;
    setData(next);
  };

  useEffect(() => {
    const loaded = load();
    commit(loaded);
    setDraft(join(loaded.wheel.entries));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORE, JSON.stringify(data));
    } catch {
      say("No se pudo guardar en este navegador. La ruleta funciona, pero se perderá al cerrar.");
    }
  }, [data, ready]);

  useEffect(() => {
    const change = () => setPresenting(document.fullscreenElement === appRef.current);
    document.addEventListener("fullscreenchange", change);
    return () => document.removeEventListener("fullscreenchange", change);
  }, []);

  const say = (message: string) => {
    setNotice(message);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(""), 5000);
  };

  const { wheel } = data;
  const active = useMemo(() => wheel.entries.filter((e) => !e.removed), [wheel.entries]);
  const slices = useMemo(() => layout(wheel.entries, feria.casillas.length), [wheel.entries]);
  const out = wheel.entries.length - active.length;
  const tickets = active.reduce((n, e) => n + Math.max(1, e.weight), 0);
  const starter = isUntouchedStarter(wheel.entries);

  /** Cambios que no vienen del texto: el borrador se reescribe para que lo que se ve sea lo guardado. */
  const updateEntries = (transform: (entries: Entry[]) => Entry[]) => {
    const d = dataRef.current;
    const entries = transform(d.wheel.entries);
    setDraft(join(entries));
    commit({ ...d, wheel: { ...d.wheel, entries } });
  };

  const updateWheel = (change: Partial<Wheel>) => {
    const d = dataRef.current;
    commit({ ...d, wheel: { ...d.wheel, ...change } });
  };

  // Con listas largas, repartir la rueda en cada tecla se siente: se espera a que dejen de escribir.
  const pending = useRef<{ text: string; timer: number } | null>(null);

  const flushDraft = () => {
    const p = pending.current;
    if (!p) return;
    clearTimeout(p.timer);
    pending.current = null;
    applyDraft(p.text);
  };

  const onDraft = (text: string) => {
    setDraft(text);
    if (pending.current) clearTimeout(pending.current.timer);
    pending.current = null;
    if (text.length < 20_000) return applyDraft(text);
    pending.current = { text, timer: window.setTimeout(flushDraft, 350) };
  };

  const applyDraft = (text: string) => {
    const d = dataRef.current;
    const labels = interpret(
      text,
      d.wheel.entries.map((e) => e.label),
    );
    if (labels.length > MAX_NAMES) say(`La lista era muy larga: quedó en los primeros ${MAX_NAMES.toLocaleString("es-MX")} nombres.`);
    commit(setLabels(d, labels.slice(0, MAX_NAMES)));
  };

  const bring = (incoming: string[]) => {
    if (incoming.length === 0) return say("No encontré nombres en ese texto.");
    const d = dataRef.current;
    const own = d.wheel.entries.length === 0 || isUntouchedStarter(d.wheel.entries) ? [] : d.wheel.entries.map((e) => e.label);
    const room = Math.max(0, MAX_NAMES - own.length);
    const added = incoming.slice(0, room);
    const next = setLabels(d, [...own, ...added]);
    setDraft(join(next.wheel.entries));
    commit(next);
    say(
      added.length < incoming.length
        ? `Entraron ${added.length.toLocaleString("es-MX")}; el tope es de ${MAX_NAMES.toLocaleString("es-MX")} nombres.`
        : `${plural(added.length, "nombre agregado", "nombres agregados")}.`,
    );
  };

  const pasteFromClipboard = async () => {
    try {
      bring(parse(await navigator.clipboard.readText()));
    } catch {
      say("El navegador no dejó leer el portapapeles. Pega la lista directo en el cuadro de texto.");
      textRef.current?.focus();
    }
  };

  const dedupe = () => {
    const before = wheel.entries.length;
    const seen = new Set<string>();
    const kept = wheel.entries.filter((e) => {
      const k = key(e.label);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    if (kept.length === before) return say("No hay nombres repetidos.");
    updateEntries(() => kept);
    say(`${plural(before - kept.length, "repetido quitado", "repetidos quitados")}.`);
  };

  const mix = () => {
    if (wheel.entries.length < 2) return;
    let next = shuffle(wheel.entries);
    // Si hay más de un nombre distinto, que el orden cambie: que no parezca que no pasó nada.
    for (let i = 0; i < 5 && next.every((e, j) => e.label === wheel.entries[j].label); i++) next = shuffle(wheel.entries);
    updateEntries(() => next);
    say("Lista revuelta.");
  };

  const sortAZ = () => {
    updateEntries((entries) => [...entries].sort((a, b) => collator.compare(a.label, b.label)));
    say("Lista ordenada de la A a la Z.");
  };

  const setWeight = (id: number, weight: number) =>
    updateWheel({
      entries: dataRef.current.wheel.entries.map((e) => (e.id === id ? { ...e, weight: Math.min(MAX_WEIGHT, Math.max(1, weight)) } : e)),
    });

  const restoreAll = () => updateEntries((entries) => entries.map((e) => ({ ...e, removed: false })));

  const focusEditor = () => {
    setMode("texto");
    if (document.fullscreenElement) void document.exitFullscreen();
    requestAnimationFrame(() => {
      const el = textRef.current;
      if (!el) return;
      el.scrollIntoView({
        block: "center",
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
      el.focus({ preventScroll: true });
      if (starter) el.select();
    });
  };

  const onStart = useCallback(() => setSpinning(true), []);

  const onResult = useCallback(async (outcome: Outcome) => {
    const hash = await listHash(outcome.slices.map((s) => ({ label: s.label, weight: s.weight })));
    const timestamp = Date.now();
    const color = feria.casillas[outcome.slice.color % feria.casillas.length];
    const d = dataRef.current;
    const w = d.wheel;
    const winner = w.entries.find((e) => e.id === outcome.slice.id);
    if (!winner) return setSpinning(false);
    const place = w.removeWinner ? w.entries.filter((e) => e.removed).length + 1 : 1;
    const record: DrawRecord = {
      id: d.nextId,
      timestamp,
      seed: seedCode(outcome.seed).replaceAll("-", ""),
      hash,
      participants: outcome.slices.length,
      tickets: outcome.slices.reduce((n, s) => n + s.weight, 0),
      winnerId: winner.id,
      winnerLabel: winner.label,
      color,
      place,
      series: w.removeWinner,
      wheelName: w.name,
    };
    const entries = w.removeWinner ? w.entries.map((e) => (e.id === winner.id ? { ...e, removed: true } : e)) : w.entries;
    const remaining = w.removeWinner ? entries.filter((e) => !e.removed).length : null;
    if (w.removeWinner) setDraft(join(entries));
    commit({
      ...d,
      wheel: { ...w, entries },
      history: [record, ...d.history].slice(0, MAX_HISTORY),
      nextId: d.nextId + 1,
      draws: d.draws + 1,
    });
    if (d.sound) {
      play("gano");
      buzz([0, 30, 60, 40]);
    }
    setReveal({
      record,
      origin: wheelRef.current?.tip() ?? {
        x: innerWidth / 2,
        y: innerHeight / 2,
      },
      info: {
        key: record.id,
        label: record.winnerLabel,
        color,
        place: record.series ? record.place : null,
        participants: record.participants,
        tickets: record.tickets,
        timestamp,
        code: seedCode(outcome.seed),
        remaining,
        hint: d.draws < 3,
      },
    });
  }, []);

  const closeReveal = (then?: () => void) => {
    setReveal(null);
    setSpinning(false);
    wheelRef.current?.relax();
    if (then) requestAnimationFrame(then);
    else requestAnimationFrame(() => appRef.current?.querySelector<HTMLCanvasElement>(".tm-escenario canvas")?.focus({ preventScroll: true }));
  };

  const actaOf = (r: DrawRecord): Acta => ({
    wheelName: r.wheelName,
    label: r.winnerLabel,
    color: r.color,
    place: r.series ? r.place : null,
    participants: r.participants,
    tickets: r.tickets,
    timestamp: r.timestamp,
    code: seedCode(BigInt(`0x${r.seed}`)),
    hash: r.hash,
  });

  const share = async (r: DrawRecord) => {
    try {
      const how = await shareCard(actaOf(r));
      if (how === "downloaded") say("Imagen del sorteo descargada.");
    } catch (e) {
      say(e instanceof Error ? e.message : "No se pudo crear la imagen.");
    }
  };

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      say("Código copiado.");
    } catch {
      say(`No se pudo copiar. El código es ${code}.`);
    }
  };

  /** Repite un sorteo con la lista actual, pero solo si su huella es la misma que quedó en el acta. */
  const recheck = async (r: DrawRecord) => {
    const weights = active.map((e) => Math.max(1, e.weight));
    const current = await listHash(active.map((e, i) => ({ label: e.label, weight: weights[i] })));
    let result: Recheck;
    if (active.length === 0 || current !== r.hash) {
      result = {
        kind: "changed",
        hash: current,
        winnerLeft: wheel.entries.some((e) => e.id === r.winnerId && e.removed),
      };
    } else {
      const obtained = active[pick(BigInt(`0x${r.seed}`), weights).index];
      result = obtained.label === r.winnerLabel ? { kind: "ok", label: obtained.label } : { kind: "mismatch", label: obtained.label };
    }
    setChecks((c) => ({ ...c, [r.id]: result }));
  };

  const togglePresent = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await appRef.current?.requestFullscreen();
    } catch {
      say("Este navegador no dejó abrir la pantalla completa.");
    }
  };

  const title = active.length === 0 ? (wheel.entries.length === 0 ? "Aquí va tu lista" : "Ya salieron todos") : wheel.name;
  const description = `Ruleta con ${plural(active.length, "nombre", "nombres")}. Presiona Enter para girar.`;
  const visibleRows = wheel.entries.slice(0, LIST_ROWS);

  return (
    <>
      <div ref={appRef} className={`tm-app${presenting ? " is-presentando" : ""}`} id="ruleta">
        <section className="tm-mesa" aria-label="La ruleta">
          <div className="tm-mesa__cabeza">
            <h2 className={`tm-mesa__titulo${spinning ? " is-girando" : ""}`}>
              <span className="tm-mesa__nombre">{title}</span>
              {/* Aquí la rueda escribe, sin pasar por React, el nombre que va quedando bajo el puntero. */}
              <span ref={pointerOut} className="tm-mesa__puntero" aria-hidden="true" />
            </h2>
            <p className="tm-mesa__pista">
              {active.length === 0
                ? wheel.entries.length === 0
                  ? "Pega los nombres como los tengas: uno por línea, numerados o separados por comas."
                  : "Regresa a todos a la ruleta para volver a sortear."
                : spinning
                  ? "Girando…"
                  : "Gira con el dedo o toca la rueda"}
            </p>
          </div>

          <div className="tm-mesa__rueda" onPointerDownCapture={flushDraft} onKeyDownCapture={flushDraft}>
            <Rueda
              ref={wheelRef}
              slices={slices}
              enabled={!spinning && !reveal}
              sound={data.sound}
              description={description}
              pointerOut={pointerOut}
              onStart={onStart}
              onResult={onResult}
            />
          </div>

          <div className="tm-mesa__controles">
            <button type="button" className="tm-pastilla" onClick={focusEditor} disabled={spinning}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
              {plural(active.length, "nombre", "nombres")}
            </button>
            <button
              type="button"
              className="tm-pastilla"
              aria-pressed={wheel.removeWinner}
              disabled={spinning}
              onClick={() => updateWheel({ removeWinner: !wheel.removeWinner })}
            >
              Sacar al ganador
            </button>
            <button
              type="button"
              className="tm-burbuja"
              aria-pressed={data.sound}
              aria-label={data.sound ? "Sonido activado" : "Sonido desactivado"}
              onClick={() => commit({ ...dataRef.current, sound: !data.sound })}
            >
              {data.sound ? (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M11 5 6 9H2v6h4l5 4V5ZM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M11 5 6 9H2v6h4l5 4V5ZM22 9l-6 6M16 9l6 6" />
                </svg>
              )}
            </button>
            <button
              type="button"
              className="tm-burbuja tm-presentar"
              onClick={togglePresent}
              aria-label={presenting ? "Salir del modo presentación" : "Modo presentación"}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                {presenting ? (
                  <path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3" />
                ) : (
                  <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
                )}
              </svg>
            </button>
          </div>
          {out > 0 && (
            <p className="tm-mesa__fuera">
              {out === 1 ? "1 ya salió" : `${out.toLocaleString("es-MX")} ya salieron`}
              <button type="button" className="tm-liga" onClick={restoreAll} disabled={spinning}>
                Regresar a todos
              </button>
            </p>
          )}
          {active.length === 0 && wheel.entries.length === 0 ? (
            <button type="button" className="tm-boton tm-boton--acento" onClick={focusEditor}>
              Agregar nombres
            </button>
          ) : active.length === 0 ? (
            <button type="button" className="tm-boton tm-boton--acento" onClick={restoreAll}>
              Regresar a todos
            </button>
          ) : (
            <button
              type="button"
              className="tm-boton tm-boton--acento"
              onClick={() => {
                if (!pending.current) return wheelRef.current?.spin(0);
                flushDraft();
                setTimeout(() => wheelRef.current?.spin(0));
              }}
              disabled={spinning}
            >
              {spinning ? "Girando…" : "Girar"}
            </button>
          )}
        </section>

        <section className="tm-panel" aria-labelledby="tm-nombres-titulo">
          <fieldset className="tm-editor" disabled={spinning}>
            <legend className="tm-sr">Nombres de la ruleta</legend>
            <h2 id="tm-nombres-titulo" className="tm-panel__titulo">
              Nombres
            </h2>
            <label className="tm-campo">
              <span className="tm-sr">Nombre de la ruleta</span>
              <input
                className="tm-entrada tm-entrada--nombre"
                value={wheel.name}
                maxLength={60}
                onChange={(e) => updateWheel({ name: e.target.value })}
                onBlur={(e) => {
                  if (!e.target.value.trim()) updateWheel({ name: STARTER_NAME });
                }}
              />
            </label>
            <div className="tm-segmentos" role="tablist" aria-label="Cómo editar">
              {(["texto", "lista"] as const).map((m) => (
                <button key={m} type="button" role="tab" aria-selected={mode === m} aria-controls={`tm-editor-${m}`} onClick={() => setMode(m)}>
                  {m === "texto" ? "Texto" : "Lista y boletos"}
                </button>
              ))}
            </div>
            <div className="tm-acciones-rapidas">
              <button type="button" className="tm-pastilla" onClick={pasteFromClipboard}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="8" y="2" width="8" height="4" rx="1" />
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                </svg>
                Pegar
              </button>
              <button type="button" className="tm-pastilla" onClick={dedupe}>
                Quitar repetidos
              </button>
              <button type="button" className="tm-pastilla" onClick={mix}>
                Revolver
              </button>
              <button type="button" className="tm-pastilla" onClick={sortAZ}>
                Ordenar A-Z
              </button>
            </div>
            <p className="tm-panel__cuenta">
              {plural(wheel.entries.length, "nombre", "nombres")}
              {tickets > active.length && ` · ${plural(tickets, "boleto", "boletos")}`}
              {out > 0 && ` · ${out.toLocaleString("es-MX")} fuera`}
            </p>
            {mode === "texto" ? (
              <div id="tm-editor-texto" role="tabpanel" aria-label="Texto">
                <textarea
                  ref={textRef}
                  className="tm-entrada tm-texto"
                  value={draft}
                  spellCheck={false}
                  aria-label="Nombres, uno por línea"
                  placeholder={"Pega aquí tu lista:\nuno por línea, numerados\no separados por comas"}
                  onChange={(e) => onDraft(e.target.value)}
                />
              </div>
            ) : (
              <div id="tm-editor-lista" role="tabpanel" className="tm-lista">
                {wheel.entries.length === 0 && <p className="tm-lista__vacia">Todavía no hay nombres. Escríbelos o pégalos en Texto.</p>}
                <ul>
                  {visibleRows.map((e) => (
                    <li key={e.id} className={e.removed ? "is-fuera" : undefined}>
                      <span className="tm-lista__nombre">
                        {e.label}
                        {e.removed && <span className="tm-lista__salio"> · ya salió</span>}
                      </span>
                      <span className="tm-boletos" role="group" aria-label={`Boletos de ${e.label}`}>
                        <button
                          type="button"
                          onClick={() => setWeight(e.id, e.weight - 1)}
                          disabled={e.weight <= 1}
                          aria-label={`Un boleto menos para ${e.label}`}
                        >
                          −
                        </button>
                        <span aria-live="polite">{e.weight}</span>
                        <button
                          type="button"
                          onClick={() => setWeight(e.id, e.weight + 1)}
                          disabled={e.weight >= MAX_WEIGHT}
                          aria-label={`Un boleto más para ${e.label}`}
                        >
                          +
                        </button>
                      </span>
                      <button
                        type="button"
                        className="tm-lista__quitar"
                        aria-label={`Quitar a ${e.label}`}
                        onClick={() => updateEntries((entries) => entries.filter((x) => x.id !== e.id))}
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
                {wheel.entries.length > LIST_ROWS && (
                  <p className="tm-lista__vacia">Se muestran los primeros {LIST_ROWS}. Para el resto, usa Texto.</p>
                )}
              </div>
            )}
            <p className="tm-panel__nota">Tu lista y tus sorteos se guardan solo en este navegador.</p>
          </fieldset>
        </section>

        <p className="tm-aviso" role="status" aria-live="polite">
          {notice}
        </p>
      </div>

      <section className="tm-sorteos marco" id="sorteos" aria-labelledby="tm-sorteos-titulo">
        <div className="tm-sorteos__cabeza">
          <h2 id="tm-sorteos-titulo" className="tm-seccion__titulo">
            Sorteos
          </h2>
          {data.history.length > 0 && (
            <button
              type="button"
              className="tm-liga"
              onClick={() => {
                if (
                  confirm(
                    `¿Borrar ${plural(data.history.length, "acta", "actas")} de este navegador? Tu ruleta se queda como está. No se puede deshacer.`,
                  )
                ) {
                  commit({ ...dataRef.current, history: [] });
                  setChecks({});
                }
              }}
            >
              Borrar todos
            </button>
          )}
        </div>
        {data.history.length === 0 ? (
          <div className="tm-tarjeta tm-sorteos__vacio">
            <p className="tm-tarjeta__titulo">Aún no hay sorteos</p>
            <p>Cada sorteo que termina queda aquí con su fecha, su hora y su código. Mientras la lista no cambie, puedes volver a correrlo.</p>
          </div>
        ) : (
          <ol className="tm-sorteos__lista">
            {data.history.map((r) => {
              const expanded = open === r.id;
              const check = checks[r.id];
              const code = seedCode(BigInt(`0x${r.seed}`));
              return (
                <li key={r.id} className="tm-tarjeta tm-acta">
                  <button
                    type="button"
                    className="tm-acta__resumen"
                    aria-expanded={expanded}
                    aria-controls={`tm-acta-${r.id}`}
                    onClick={() => setOpen(expanded ? null : r.id)}
                  >
                    <span className="tm-acta__punto" style={{ background: r.color }} aria-hidden="true" />
                    <span className="tm-acta__ganador">{r.winnerLabel}</span>
                    <span className="tm-acta__meta">
                      {fechaHora(r.timestamp)} · {r.wheelName}
                      {r.series && ` · ${r.place}.º lugar`}
                    </span>
                    <span className="tm-acta__meta">{entre(r.participants, r.tickets)}</span>
                    <span className="tm-sr">{expanded ? "Cerrar el acta" : "Ver el acta"}</span>
                  </button>
                  {expanded && (
                    <div id={`tm-acta-${r.id}`} className="tm-acta__cuerpo">
                      <p className="tm-etiqueta">Acta del sorteo</p>
                      <dl className="tm-acta__datos">
                        <div>
                          <dt>Fecha</dt>
                          <dd>
                            {new Intl.DateTimeFormat("es-MX", {
                              dateStyle: "long",
                            }).format(r.timestamp)}
                          </dd>
                        </div>
                        <div>
                          <dt>Hora</dt>
                          <dd>
                            {new Intl.DateTimeFormat("es-MX", {
                              timeStyle: "medium",
                            }).format(r.timestamp)}
                          </dd>
                        </div>
                        <div>
                          <dt>Ruleta</dt>
                          <dd>{r.wheelName}</dd>
                        </div>
                        <div>
                          <dt>Participantes</dt>
                          <dd>{r.participants.toLocaleString("es-MX")}</dd>
                        </div>
                        {r.tickets !== r.participants && (
                          <div>
                            <dt>Boletos</dt>
                            <dd>{r.tickets.toLocaleString("es-MX")}</dd>
                          </div>
                        )}
                        {r.series && (
                          <div>
                            <dt>Lugar en la serie</dt>
                            <dd>{r.place}.º</dd>
                          </div>
                        )}
                        <div>
                          <dt>Huella de la lista</dt>
                          <dd className="tm-mono">{r.hash}</dd>
                        </div>
                      </dl>
                      <button type="button" className="tm-codigo tm-codigo--acta" onClick={() => copy(code)}>
                        <span className="tm-codigo__etiqueta">Código del sorteo</span>
                        <span className="tm-codigo__valor">{code}</span>
                        <span className="tm-sr">. Toca para copiarlo</span>
                      </button>
                      {check && (
                        <div className={`tm-veredicto tm-veredicto--${check.kind}`} role="status">
                          {check.kind === "ok" && (
                            <>
                              <p className="tm-veredicto__titulo">Comprobado</p>
                              <p>
                                Volvimos a correr el sorteo con su código y la lista de «{wheel.name}», que sigue igual. Cayó otra vez en{" "}
                                {check.label}.
                              </p>
                            </>
                          )}
                          {check.kind === "changed" && (
                            <>
                              <p className="tm-veredicto__titulo">No se puede repetir aquí</p>
                              <p>
                                {check.winnerLeft
                                  ? `${r.winnerLabel} ya salió de la ruleta, así que la lista no es la misma que en este sorteo.`
                                  : `La lista de la ruleta ya no es la misma que en este sorteo: su huella ahora es ${check.hash}.`}{" "}
                                El código sigue identificando el sorteo original, pero sin la lista de ese momento no podemos volver a correrlo.
                              </p>
                            </>
                          )}
                          {check.kind === "mismatch" && (
                            <>
                              <p className="tm-veredicto__titulo">No coincide</p>
                              <p>
                                La lista tiene la misma huella, pero al repetir el sorteo salió {check.label} y no {r.winnerLabel}. No podemos dar
                                este sorteo por comprobado.
                              </p>
                            </>
                          )}
                        </div>
                      )}
                      <div className="tm-acta__acciones">
                        <button type="button" className="tm-boton tm-boton--acento tm-boton--chico" onClick={() => recheck(r)} disabled={spinning}>
                          Comprobar
                        </button>
                        <button type="button" className="tm-boton tm-boton--suave tm-boton--chico" onClick={() => share(r)}>
                          Compartir imagen
                        </button>
                        <button
                          type="button"
                          className="tm-burbuja"
                          aria-label={`Borrar el sorteo que ganó ${r.winnerLabel}`}
                          onClick={() => {
                            if (confirm(`¿Borrar el acta del sorteo que ganó ${r.winnerLabel}? Sin ella ya no se podrá comprobar.`)) {
                              commit({
                                ...dataRef.current,
                                history: dataRef.current.history.filter((x) => x.id !== r.id),
                              });
                            }
                          }}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <Comprobador entries={active} wheelName={wheel.name} />

      {reveal && (
        <Resultado
          info={reveal.info}
          origin={reveal.origin}
          onClose={() => closeReveal()}
          onCopy={() => copy(reveal.info.code)}
          onShare={() => share(reveal.record)}
          onOwnNames={starter ? () => closeReveal(focusEditor) : null}
          onAgain={
            reveal.info.remaining === 0
              ? null
              : () =>
                  closeReveal(() => {
                    // El giro siguiente espera a que la rueda vuelva de su acercamiento.
                    setTimeout(() => wheelRef.current?.spin(0), 120);
                  })
          }
        />
      )}
    </>
  );
}

/**
 * Comprueba un código con una lista, venga de la app o de esta página. Con el mismo código y la misma
 * lista (nombres, boletos y orden) sale el mismo ganador; la huella dice si la lista es la misma del acta.
 */
function Comprobador({ entries, wheelName }: { entries: Entry[]; wheelName: string }) {
  const [code, setCode] = useState("");
  const [source, setSource] = useState<"pegar" | "ruleta">("pegar");
  const [text, setText] = useState("");
  const [expected, setExpected] = useState("");
  const [result, setResult] = useState<null | {
    label: string;
    hash: string;
    count: number;
    tickets: number;
    match: boolean | null;
  }>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const param = new URLSearchParams(location.search).get("codigo");
    if (param && parseSeedCode(param) !== null) setCode(seedCode(parseSeedCode(param)!));
  }, []);

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    const seed = parseSeedCode(code);
    if (seed === null) return setError("El código son 16 letras y números, como D8BD-1DDF-39A4-3B72.");
    const list =
      source === "ruleta"
        ? entries.map((x) => ({
            label: x.label,
            weight: Math.max(1, x.weight),
          }))
        : parse(text).map((label) => ({ label, weight: 1 }));
    if (list.length === 0)
      return setError(source === "ruleta" ? "Tu ruleta no tiene a nadie participando." : "Pega la lista del sorteo, en el mismo orden.");
    setError("");
    const hash = await listHash(list);
    const winner =
      list[
        pick(
          seed,
          list.map((x) => x.weight),
        ).index
      ];
    const clean = expected.replace(/[^0-9a-f]/gi, "").toUpperCase();
    setResult({
      label: winner.label,
      hash,
      count: list.length,
      tickets: list.reduce((n, x) => n + x.weight, 0),
      match: clean ? clean === hash : null,
    });
  };

  return (
    <section className="tm-comprobar marco" id="comprobar" aria-labelledby="tm-comprobar-titulo">
      <div className="tm-comprobar__texto">
        <h2 id="tm-comprobar-titulo" className="tm-seccion__titulo">
          Comprueba un sorteo
        </h2>
        <p>
          ¿Te mandaron un sorteo de Tin Marín? Pon su código y la lista con la que se hizo. Con el mismo código y la misma lista sale siempre el mismo
          ganador, se haya hecho en el teléfono o aquí.
        </p>
        <p>
          La huella dice si la lista es la misma: si coincide con la del acta o del video, es la misma lista, con los mismos nombres en el mismo
          orden.
        </p>
      </div>
      <form className="tm-tarjeta tm-comprobar__forma" onSubmit={run} noValidate>
        <label className="tm-campo">
          <span className="tm-campo__etiqueta">Código del sorteo</span>
          <input
            className="tm-entrada tm-mono"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="D8BD-1DDF-39A4-3B72"
            autoComplete="off"
            spellCheck={false}
            inputMode="text"
            aria-invalid={!!error && parseSeedCode(code) === null}
          />
        </label>
        <div className="tm-segmentos" role="radiogroup" aria-label="De dónde sale la lista">
          <button type="button" role="radio" aria-checked={source === "pegar"} onClick={() => setSource("pegar")}>
            Pegar la lista
          </button>
          <button type="button" role="radio" aria-checked={source === "ruleta"} onClick={() => setSource("ruleta")}>
            La de mi ruleta
          </button>
        </div>
        {source === "pegar" ? (
          <label className="tm-campo">
            <span className="tm-campo__etiqueta">Lista del sorteo, en el mismo orden</span>
            <textarea className="tm-entrada tm-texto tm-texto--corto" value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} />
            <span className="tm-campo__ayuda">
              Pegada, cada nombre cuenta con un boleto. Si el sorteo tenía boletos, ármalos en tu ruleta y usa «La de mi ruleta».
            </span>
          </label>
        ) : (
          <p className="tm-campo__ayuda">
            Se usa «{wheelName}» tal como está arriba: {entries.length.toLocaleString("es-MX")} {entries.length === 1 ? "nombre" : "nombres"}, con sus
            boletos y en su orden. Los que ya salieron no cuentan.
          </p>
        )}
        <label className="tm-campo">
          <span className="tm-campo__etiqueta">Huella del acta (opcional)</span>
          <input
            className="tm-entrada tm-mono"
            value={expected}
            onChange={(e) => setExpected(e.target.value)}
            placeholder="968D1EA8A00F"
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        {error && (
          <p className="tm-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="tm-boton tm-boton--acento">
          Comprobar
        </button>
        {result && (
          <div className={`tm-veredicto tm-veredicto--${result.match === false ? "mismatch" : "ok"}`} role="status">
            <p className="tm-veredicto__titulo">
              {result.match === false ? "La lista no es la del acta" : result.match ? "Comprobado" : `Gana ${result.label}`}
            </p>
            {result.match === false ? (
              <p>
                Con esta lista la huella es <span className="tm-mono">{result.hash}</span> y no la del acta. Falta, sobra o cambió de lugar algún
                nombre o boleto, así que este resultado no dice nada del sorteo original.
              </p>
            ) : (
              <p>
                Con este código y esta lista ({entre(result.count, result.tickets)}) gana {result.label}.{" "}
                {result.match
                  ? "La huella coincide con la del acta: es la misma lista."
                  : `La huella de esta lista es ${result.hash}: compárala con la del acta o del video.`}
              </p>
            )}
          </div>
        )}
      </form>
    </section>
  );
}

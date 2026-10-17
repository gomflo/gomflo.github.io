// El cantador de Frijolito en el navegador. La baraja entera se decide al barajar (lib/frijolito/baraja.ts):
// cantar solo avanza al siguiente lugar de un orden que ya existe, así que ni el ritmo, ni las pausas, ni
// los toques cambian qué carta sigue. La partida y los ajustes se guardan en localStorage ("frijolito"):
// si se recarga la página, sigue en la misma carta. La mesa (toda la página) toma la tinta de la carta.
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ArrowRight, Pause, Play, Shuffle, Undo2 } from "lucide-react";
import Cara from "./Cara";
import { cartas, imagen, TINTAS } from "@/data/frijolito-cartas";
import { BARAJA, nuevaSemilla, orden, semillaATexto, textoASemilla } from "@/lib/frijolito/baraja";

type Modo = "nombre" | "verso";
type Ajustes = { voz: boolean; modo: Modo; arranque: boolean; pausa: number };
type Juego = { semilla: bigint; cantadas: number };

const CLAVE = "frijolito";
const PAUSAS = [2, 3, 4, 6, 8];
const AJUSTES: Ajustes = { voz: true, modo: "verso", arranque: true, pausa: 4 };
const ARRANQUE = "¡Corre y se va corriendo con…!";
const MESA_INICIAL = TINTAS.anil;

function leer(): { juego: Juego | null; ajustes: Ajustes } {
  try {
    const d = JSON.parse(localStorage.getItem(CLAVE) ?? "null");
    const semilla = textoASemilla(d?.semilla);
    const cantadas = Number.isInteger(d?.cantadas) ? Math.min(Math.max(d.cantadas, 0), BARAJA) : 0;
    const a = d?.ajustes ?? {};
    return {
      juego: semilla === null ? null : { semilla, cantadas },
      ajustes: {
        voz: typeof a.voz === "boolean" ? a.voz : AJUSTES.voz,
        modo: a.modo === "nombre" ? "nombre" : "verso",
        arranque: typeof a.arranque === "boolean" ? a.arranque : AJUSTES.arranque,
        pausa: PAUSAS.includes(a.pausa) ? a.pausa : AJUSTES.pausa,
      },
    };
  } catch {
    return { juego: null, ajustes: AJUSTES };
  }
}

/** La voz en español del navegador: es-MX, luego es-US, luego cualquier español. */
function vozEnEspanol(voces: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const lang = (v: SpeechSynthesisVoice) => v.lang.replace("_", "-").toLowerCase();
  // macOS trae voces de juguete (Grandma, Rocko…) que no sirven para cantar: van al final.
  const juguete = /^(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Eddy|Flo|Good News|Grandma|Grandpa|Jester|Junior|Organ|Ralph|Reed|Rocko|Sandy|Shelley|Superstar|Trinoids|Whisper|Wobble|Zarvox)\b/;
  const mejor = (v: SpeechSynthesisVoice[]) =>
    v.find((x) => x.localService && !juguete.test(x.name)) ?? v.find((x) => !juguete.test(x.name)) ?? v[0];
  for (const quiere of ["es-mx", "es-us", "es-419"]) {
    const v = voces.filter((x) => lang(x) === quiere);
    if (v.length) return mejor(v);
  }
  const es = voces.filter((x) => lang(x).startsWith("es"));
  return es.length ? mejor(es) : null;
}

/** El color de la mesa como lo pinta la página (--fondo): un 15 % más hondo. */
function hondo(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v * 0.85));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

type EstadoVoz = "buscando" | "lista" | "sin-espanol" | "sin-soporte";

export default function Cantador({ id = "cantador" }: { id?: string }) {
  const [juego, setJuego] = useState<Juego | null>(null);
  const [ajustes, setAjustes] = useState<Ajustes>(AJUSTES);
  const [solo, setSolo] = useState(false);
  const [hablando, setHablando] = useState(false);
  const [estadoVoz, setEstadoVoz] = useState<EstadoVoz>("buscando");
  const [aviso, setAviso] = useState("");
  const voz = useRef<SpeechSynthesisVoice | null>(null);
  const turnoVoz = useRef(0);
  const listo = useRef(false);

  // Arranque: la partida guardada o una baraja nueva, ya revuelta completa.
  useEffect(() => {
    const guardado = leer();
    setAjustes(guardado.ajustes);
    setJuego(guardado.juego ?? { semilla: nuevaSemilla(), cantadas: 0 });
    listo.current = true;
  }, []);

  useEffect(() => {
    if (!listo.current || !juego) return;
    try {
      localStorage.setItem(CLAVE, JSON.stringify({ semilla: semillaATexto(juego.semilla), cantadas: juego.cantadas, ajustes }));
    } catch {
      // Sin almacenamiento (modo privado estricto) se juega igual; solo no se guarda.
    }
  }, [juego, ajustes]);

  // Las voces llegan tarde en algunos navegadores: se esperan un momento antes de decir que no hay.
  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      setEstadoVoz("sin-soporte");
      return;
    }
    const elegir = () => {
      const v = vozEnEspanol(speechSynthesis.getVoices());
      voz.current = v;
      if (v) setEstadoVoz("lista");
      return v;
    };
    if (elegir()) return;
    speechSynthesis.addEventListener("voiceschanged", elegir);
    const t = setTimeout(() => {
      if (!elegir()) setEstadoVoz("sin-espanol");
    }, 2500);
    return () => {
      speechSynthesis.removeEventListener("voiceschanged", elegir);
      clearTimeout(t);
    };
  }, []);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const ord = useMemo(() => (juego ? orden(juego.semilla) : []), [juego?.semilla]);
  const cantadas = juego?.cantadas ?? 0;
  const actual = cantadas > 0 ? cartas[ord[cantadas - 1] - 1] : null;
  const anterior = cantadas > 1 ? ord[cantadas - 2] : null;
  const siguiente = juego && cantadas < BARAJA ? ord[cantadas] : null;
  const terminada = cantadas >= BARAJA;

  // La mesa entera viste la tinta de la carta en turno.
  useEffect(() => {
    const color = actual ? TINTAS[actual.tono] : MESA_INICIAL;
    document.documentElement.style.setProperty("--mesa", color);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", hondo(color));
  }, [actual?.n]);

  // La siguiente ya está decidida: se adelanta su ilustración para que llegue sin espera.
  useEffect(() => {
    if (siguiente) new Image().src = imagen(cartas[siguiente - 1], true);
  }, [siguiente]);

  const callar = useCallback(() => {
    turnoVoz.current++;
    window.speechSynthesis?.cancel();
    setHablando(false);
  }, []);

  const decir = useCallback(
    (texto: string) => {
      const v = voz.current;
      if (!ajustes.voz || !v) return;
      const turno = ++turnoVoz.current;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(texto);
      u.voice = v;
      u.lang = v.lang;
      u.rate = 0.95;
      // Algunos navegadores no avisan cuando terminan: un tope por si el fin nunca llega.
      const tope = setTimeout(fin, 2500 + texto.length * 90);
      function fin() {
        clearTimeout(tope);
        if (turno === turnoVoz.current) setHablando(false);
      }
      u.onend = fin;
      u.onerror = fin;
      setHablando(true);
      speechSynthesis.speak(u);
    },
    [ajustes.voz],
  );

  const cantar = useCallback(() => {
    if (!juego || juego.cantadas >= BARAJA) return;
    const n = ord[juego.cantadas];
    const c = cartas[n - 1];
    const primera = juego.cantadas === 0;
    setJuego({ ...juego, cantadas: juego.cantadas + 1 });
    setAviso("");
    const cuerpo = ajustes.modo === "verso" ? `${c.nombre}. ${c.verso}` : c.nombre;
    decir(primera && ajustes.arranque ? `${ARRANQUE} ${cuerpo}` : cuerpo);
  }, [juego, ord, ajustes, decir]);

  const cantarRef = useRef(cantar);
  cantarRef.current = cantar;

  // Canta solo: cuando la voz termina, espera la pausa elegida y canta la siguiente.
  useEffect(() => {
    if (!solo || hablando || terminada || cantadas === 0) return;
    const t = setTimeout(() => cantarRef.current(), ajustes.pausa * 1000);
    return () => clearTimeout(t);
  }, [solo, hablando, terminada, cantadas, ajustes.pausa]);

  useEffect(() => {
    if (terminada) setSolo(false);
  }, [terminada]);

  const alternarSolo = () => {
    if (solo) {
      setSolo(false);
      return;
    }
    setSolo(true);
    if (cantadas === 0) cantar();
  };

  const regresar = () => {
    if (!juego || cantadas === 0 || !actual) return;
    callar();
    setSolo(false);
    setJuego({ ...juego, cantadas: cantadas - 1 });
    setAviso(`${actual.nombre} regresó a la baraja`);
  };

  const barajar = () => {
    if (cantadas > 0 && !terminada && !window.confirm("¿Barajar de nuevo? Se revuelven las 54 cartas y empieza otra partida.")) return;
    callar();
    setSolo(false);
    setJuego({ semilla: nuevaSemilla(), cantadas: 0 });
    setAviso("Baraja nueva: las 54 cartas, revueltas");
  };

  const cambiar = <K extends keyof Ajustes>(k: K, v: Ajustes[K]) => {
    if (k === "voz" && !v) callar();
    setAjustes((a) => ({ ...a, [k]: v }));
  };

  const sinVoz = estadoVoz === "sin-espanol" || estadoVoz === "sin-soporte";
  const renglon = aviso || (solo && !terminada ? `Canta solo · una carta cada ${ajustes.pausa} s` : "");
  const cantadasLista = ord.slice(0, cantadas).reverse();

  return (
    <section id={id} className="fj-cantador fj-marco" aria-label="Cantador de lotería">
      <div className="fj-mesa">
        <div className="fj-mesa__carta">
          {cantadas > 0 && (
            <div className="fj-mesa__debajo" aria-hidden="true">
              {anterior ? <Cara n={anterior} placa={false} grande decorativa /> : <div className="fj-reverso" />}
            </div>
          )}
          <div className="fj-mesa__arriba">
            {actual ? (
              <div key={`${actual.n}-${cantadas}`} className="fj-llega">
                <Cara n={actual.n} placa={false} grande />
              </div>
            ) : (
              <div className="fj-reverso" role="img" aria-label={terminada ? "Se acabó la baraja" : "El reverso de la baraja, lista para cantar"} />
            )}
          </div>
        </div>

        <div className="fj-mesa__info">
          <p className="fj-contador" aria-label={`${cantadas} de ${BARAJA} cartas cantadas`}>
            {cantadas} de {BARAJA}
          </p>
          <p className="fj-rotulo fj-renglon">{renglon}</p>
          <div aria-live="polite" aria-atomic="true">
            {actual ? (
              <div key={actual.n}>
                <h2 className="fj-nombre fj-sube">
                  <span className="fj-sr">Carta {actual.n}: </span>
                  {actual.nombre}
                </h2>
                <p className="fj-verso fj-sube" style={{ marginTop: "0.6rem" }}>
                  {actual.verso}
                </p>
              </div>
            ) : (
              <div>
                <h2 className="fj-nombre">{terminada ? "Se acabó la baraja" : "Baraja lista"}</h2>
                <p className="fj-verso" style={{ marginTop: "0.6rem", fontStyle: "normal", fontFamily: "var(--texto)" }}>
                  Reparte las tablas y canta la primera carta.
                </p>
              </div>
            )}
          </div>

          <div className="fj-controles">
            {terminada ? (
              <button type="button" className="fj-boton" onClick={barajar}>
                <Shuffle aria-hidden="true" /> Barajar de nuevo
              </button>
            ) : (
              <button type="button" className="fj-boton" onClick={cantar} disabled={!juego}>
                {cantadas === 0 ? "Cantar la primera" : "Cantar la siguiente"}
                <ArrowRight aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              className="fj-redondo"
              aria-pressed={solo}
              aria-label={solo ? "Pausar: dejar de cantar solo" : `Que cante solo, una carta cada ${ajustes.pausa} segundos`}
              title={solo ? "Pausar" : "Que cante solo"}
              onClick={alternarSolo}
              disabled={!juego || terminada}
            >
              {solo ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
              {solo && !hablando && !terminada && cantadas > 0 && (
                <svg key={`${cantadas}-${ajustes.pausa}`} className="fj-anillo" viewBox="0 0 36 36" aria-hidden="true" style={{ "--pausa": `${ajustes.pausa}s` } as CSSProperties}>
                  <circle cx="18" cy="18" r="16" pathLength={100} />
                </svg>
              )}
            </button>
          </div>

          <div className="fj-secundarios">
            <button type="button" className="fj-boton fj-boton--suave fj-boton--chico" onClick={regresar} disabled={cantadas === 0}>
              <Undo2 aria-hidden="true" /> Regresar la última
            </button>
            {!terminada && (
              <button type="button" className="fj-boton fj-boton--suave fj-boton--chico" onClick={barajar} disabled={!juego}>
                <Shuffle aria-hidden="true" /> Barajar de nuevo
              </button>
            )}
          </div>

          {sinVoz && (
            <p className="fj-aviso" role="status">
              {estadoVoz === "sin-soporte"
                ? "Este navegador no puede hablar: las cartas se ven, pero no se oyen."
                : "Este navegador no tiene una voz en español: las cartas se ven, pero no se oyen. Puedes instalar una voz en español en los ajustes de idioma o de accesibilidad de tu equipo, y volver a abrir la página."}
            </p>
          )}

          <details className="fj-ajustes">
            <summary>Cómo se canta</summary>
            <div className="fj-ajustes__cuerpo">
              <label className="fj-casilla-check">
                <input type="checkbox" checked={ajustes.voz} onChange={(e) => cambiar("voz", e.target.checked)} disabled={sinVoz} />
                Cantar en voz alta
              </label>
              <fieldset disabled={sinVoz || !ajustes.voz}>
                <legend className="fj-rotulo">Se canta</legend>
                <div className="fj-pildoras">
                  {(
                    [
                      ["nombre", "El nombre"],
                      ["verso", "Nombre y verso"],
                    ] as const
                  ).map(([v, t]) => (
                    <label key={v} className="fj-pildora">
                      <input type="radio" name={`${id}-modo`} value={v} checked={ajustes.modo === v} onChange={() => cambiar("modo", v)} />
                      <span>{t}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="fj-casilla-check">
                <input type="checkbox" checked={ajustes.arranque} onChange={(e) => cambiar("arranque", e.target.checked)} disabled={sinVoz || !ajustes.voz} />
                Arranque tradicional: «{ARRANQUE}»
              </label>
              <fieldset>
                <legend className="fj-rotulo">Pausa al cantar solo</legend>
                <div className="fj-pildoras">
                  {PAUSAS.map((p) => (
                    <label key={p} className="fj-pildora">
                      <input type="radio" name={`${id}-pausa`} value={p} checked={ajustes.pausa === p} onChange={() => cambiar("pausa", p)} />
                      <span>{p} s</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          </details>
        </div>
      </div>

      <div className="fj-cantadas">
        <div className="fj-cantadas__cabeza">
          <h2 className="fj-rotulo">Cantadas{cantadas > 0 ? `, de la última a la primera` : ""}</h2>
          <a className="fj-enlace" href="/frijolito/cartas-de-la-loteria/" style={{ fontSize: "0.95rem" }}>
            Las 54 cartas
          </a>
        </div>
        {cantadas === 0 ? (
          <p className="fj-fila__vacia">Aquí se van quedando las cartas que salen, para revisar la tabla de quien grite ¡Lotería!</p>
        ) : (
          <ol className="fj-fila" aria-label={`${cantadas} cartas cantadas, de la última a la primera`}>
            {cantadasLista.map((n) => (
              <li key={n}>
                <Cara n={n} lazy />
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

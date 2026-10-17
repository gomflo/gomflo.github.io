// Tablas de lotería para imprimir. Las tablas salen de una sola semilla (lib/frijolito/baraja.ts, igual que
// Boards.batch de la app) y ninguna repite el conjunto de cartas de otra. Se imprimen con window.print():
// una tabla por hoja carta (@media print en styles/frijolito.css). Las 54 cartas para recortar se montan
// solo al pedirlas, y antes de imprimir se espera a que todas las ilustraciones estén listas.
import { useEffect, useMemo, useRef, useState } from "react";
import { Printer, Scissors, Shuffle } from "lucide-react";
import Cara from "./Cara";
import { nuevaSemilla, tablas as hacerTablas, textoASemilla } from "@/lib/frijolito/baraja";

const MIN = 1;
const MAX = 12;
const PIE = "Hecho con Frijolito · gomflo.dev/frijolito";
const TODAS = Array.from({ length: 54 }, (_, i) => i + 1);

async function listas(raiz: HTMLElement | null) {
  if (!raiz) return;
  const imgs = [...raiz.querySelectorAll("img")];
  await Promise.all(imgs.map((img) => (img.complete ? Promise.resolve() : img.decode().catch(() => undefined))));
}

export default function Tablas({ semillaInicial, inicial = 4 }: { semillaInicial: string; inicial?: number }) {
  const [semilla, setSemilla] = useState<bigint>(() => textoASemilla(semillaInicial) ?? 1n);
  const [cuantas, setCuantas] = useState(inicial);
  const [recortar, setRecortar] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [estado, setEstado] = useState("");
  const raiz = useRef<HTMLDivElement>(null);

  // En el navegador, cada visita trae tablas nuevas. Sin JavaScript quedan las del build, que también se imprimen.
  useEffect(() => setSemilla(nuevaSemilla()), []);

  useEffect(() => {
    const limpiar = () => delete document.documentElement.dataset.imprime;
    window.addEventListener("afterprint", limpiar);
    return () => window.removeEventListener("afterprint", limpiar);
  }, []);

  const tablas = useMemo(() => hacerTablas(semilla, cuantas), [semilla, cuantas]);

  const imprimir = async (modo: "tablas" | "cartas") => {
    setOcupado(true);
    if (modo === "cartas") setRecortar(true);
    document.documentElement.dataset.imprime = modo;
    // Un cuadro para que React monte las cartas, y luego que lleguen sus ilustraciones.
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await listas(raiz.current?.querySelector(modo === "cartas" ? ".fj-recortar" : ".fj-tablas") as HTMLElement | null);
    setOcupado(false);
    window.print();
  };

  const nuevas = () => {
    setSemilla(nuevaSemilla());
    setEstado(`${cuantas} ${cuantas === 1 ? "tabla nueva" : "tablas nuevas"}, distintas entre sí`);
  };

  const cambiar = (n: number) => {
    const v = Math.min(MAX, Math.max(MIN, n));
    setCuantas(v);
    setEstado(`${v} ${v === 1 ? "tabla" : "tablas"}`);
  };

  const hojas: number[][] = [];
  for (let i = 0; i < TODAS.length; i += 12) hojas.push(TODAS.slice(i, i + 12));

  return (
    <div ref={raiz} className="fj-generador" id="generador">
      <div className="fj-generador__controles fj-solo-pantalla">
        <div className="fj-cuantas">
          <span className="fj-cuantas__texto" id="cuantas-texto" style={{ fontWeight: 600 }}>
            ¿Cuántas tablas?
          </span>
          <button type="button" className="fj-redondo" onClick={() => cambiar(cuantas - 1)} disabled={cuantas <= MIN} aria-label="Una tabla menos">
            −
          </button>
          <output aria-labelledby="cuantas-texto">{cuantas}</output>
          <button type="button" className="fj-redondo" onClick={() => cambiar(cuantas + 1)} disabled={cuantas >= MAX} aria-label="Una tabla más">
            +
          </button>
        </div>
        <button type="button" className="fj-boton fj-boton--suave fj-boton--chico" onClick={nuevas}>
          <Shuffle aria-hidden="true" /> Otras tablas
        </button>
        <button type="button" className="fj-boton fj-boton--chico" onClick={() => imprimir("tablas")} disabled={ocupado}>
          <Printer aria-hidden="true" /> Imprimir {cuantas === 1 ? "la tabla" : `las ${cuantas} tablas`}
        </button>
        <button type="button" className="fj-boton fj-boton--suave fj-boton--chico" onClick={() => imprimir("cartas")} disabled={ocupado}>
          <Scissors aria-hidden="true" /> Imprimir las 54 cartas para recortar
        </button>
        <p className="fj-sr" role="status" aria-live="polite">
          {estado}
        </p>
      </div>

      <ol className="fj-tablas" aria-label="Tablas para imprimir">
        {tablas.map((t, i) => (
          <li key={t.join("-")} className="fj-tabla">
            <h2 className="fj-tabla__titulo">
              Tabla {i + 1} <small>Lotería mexicana</small>
            </h2>
            <ol className="fj-tabla__rejilla" aria-label={`Tabla ${i + 1}`}>
              {t.map((n) => (
                <li key={n}>
                  <Cara n={n} />
                </li>
              ))}
            </ol>
            <p className="fj-tabla__pie">{PIE}</p>
          </li>
        ))}
      </ol>

      {recortar && (
        <div className="fj-recortar" aria-hidden="true">
          {hojas.map((hoja, i) => (
            <div key={i} className="fj-recortar__hoja">
              {hoja.map((n) => (
                <Cara key={n} n={n} decorativa />
              ))}
              <p className="fj-recortar__pie">
                Cartas {hoja[0]} a {hoja[hoja.length - 1]} · {PIE}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

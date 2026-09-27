import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { LIMITES, analizarTexto, formatearDuracion } from "@/lib/contar";
import { labelClass, textareaClass } from "./tool-kit";

type Focus = "characters" | "words";

const Stat = ({ label, value, big }: { label: string; value: string; big?: boolean }) => (
  <div className={cn("grid content-start gap-1 rounded-2xl px-4 py-3", big ? "bg-card border border-border shadow-xs" : "bg-muted/60")}>
    <dt className="text-muted-foreground text-sm font-semibold">{label}</dt>
    <dd className={cn("m-0 font-bold tabular-nums", big ? "text-3xl sm:text-4xl" : "text-xl")}>{value}</dd>
  </div>
);

/**
 * Contador de caracteres y palabras. `focus` decide qué cifras van primero:
 * la página de caracteres muestra los límites por plataforma; la de palabras,
 * el tiempo de lectura.
 */
const CharacterCounter = ({ focus = "characters" }: { focus?: Focus }) => {
  const [input, setInput] = useState("");
  const s = useMemo(() => analizarTexto(input), [input]);
  const n = (value: number) => value.toLocaleString("es-MX");

  const primary =
    focus === "characters"
      ? [
          { label: "Caracteres", value: n(s.caracteres) },
          { label: "Sin espacios", value: n(s.sinEspacios) },
        ]
      : [
          { label: "Palabras", value: n(s.palabras) },
          { label: "Tiempo de lectura", value: formatearDuracion(s.segundosLectura) },
        ];

  const secondary =
    focus === "characters"
      ? [
          { label: "Palabras", value: n(s.palabras) },
          { label: "Líneas", value: n(s.lineas) },
          { label: "Párrafos", value: n(s.parrafos) },
          { label: "Lectura", value: formatearDuracion(s.segundosLectura) },
        ]
      : [
          { label: "Caracteres", value: n(s.caracteres) },
          { label: "Sin espacios", value: n(s.sinEspacios) },
          { label: "Párrafos", value: n(s.parrafos) },
          { label: "En voz alta", value: formatearDuracion(s.segundosVoz) },
        ];

  return (
    <div className="tool-view grid gap-5" role="region" aria-label={focus === "characters" ? "Contador de caracteres" : "Contador de palabras"}>
      <section data-reveal className="grid gap-3">
        <label htmlFor="counter-input" className={labelClass}>
          Texto
        </label>
        <Textarea
          id="counter-input"
          rows={8}
          spellCheck
          autoComplete="off"
          placeholder="Escribe o pega aquí tu texto…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={textareaClass}
        />
      </section>

      <dl data-reveal style={{ animationDelay: "40ms" }} className="m-0 grid gap-3" aria-live="polite">
        <div className="grid grid-cols-2 gap-3">
          {primary.map((stat) => (
            <Stat key={stat.label} {...stat} big />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {secondary.map((stat) => (
            <Stat key={stat.label} {...stat} />
          ))}
        </div>
      </dl>

      {focus === "characters" && (
        <section data-reveal style={{ animationDelay: "80ms" }} className="grid gap-3" aria-labelledby="counter-limits">
          <h3 id="counter-limits" className="text-lg font-bold">
            Límites de caracteres por plataforma
          </h3>
          <ul role="list" className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2 sm:gap-x-6">
            {LIMITES.map((limite) => {
              const usado = s.caracteres / limite.max;
              const excedido = s.caracteres > limite.max;
              return (
                <li key={limite.nombre} className="grid gap-1.5 py-1">
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-semibold">{limite.nombre}</span>
                    <span className={cn("tabular-nums", excedido ? "text-destructive font-semibold" : "text-muted-foreground")}>
                      {excedido
                        ? `${n(s.caracteres - limite.max)} de más`
                        : `${n(limite.max - s.caracteres)} de ${n(limite.max)} libres`}
                    </span>
                  </div>
                  <div
                    className="bg-muted h-1.5 overflow-hidden rounded-full"
                    role="meter"
                    aria-label={`${limite.nombre}: ${n(s.caracteres)} de ${n(limite.max)} caracteres`}
                    aria-valuemin={0}
                    aria-valuemax={limite.max}
                    aria-valuenow={Math.min(s.caracteres, limite.max)}
                  >
                    <div
                      className={cn("h-full rounded-full transition-[width] duration-200", excedido ? "bg-destructive" : usado > 0.9 ? "bg-yolk" : "bg-primary")}
                      style={{ width: `${Math.min(usado, 1) * 100}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
};

export default CharacterCounter;

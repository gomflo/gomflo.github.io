import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { aFecha, aIso, contarDias, feriadosDe, sumarHabiles } from "@/lib/dias-habiles";
import { Checkbox, InlineError, ResultRow, inputClass, labelClass } from "./tool-kit";

const fullDate = (d: Date) =>
  d.toLocaleDateString("es-MX", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long", year: "numeric" });

const shortDate = (iso: string) =>
  aFecha(iso)!.toLocaleDateString("es-MX", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" });

/** Hoy en la zona del navegador, como "AAAA-MM-DD". */
const todayIso = () => {
  const now = new Date();
  return aIso(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
};

const plural = (n: number, one: string, many: string) => `${n.toLocaleString("es-MX")} ${Math.abs(n) === 1 ? one : many}`;

const BusinessDays = () => {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [addFrom, setAddFrom] = useState("");
  const [addDays, setAddDays] = useState("15");
  const [bancario, setBancario] = useState(false);
  const [incluirInicio, setIncluirInicio] = useState(false);

  // Las fechas por omisión dependen del reloj del visitante, no del build.
  useEffect(() => {
    const today = todayIso();
    const inAMonth = new Date(aFecha(today)!.getTime() + 30 * 86_400_000);
    setStart(today);
    setEnd(aIso(inAMonth));
    setAddFrom(today);
  }, []);

  const range = useMemo(() => {
    const a = aFecha(start);
    const b = aFecha(end);
    if (!a || !b) return null;
    try {
      return { data: contarDias(a, b, { bancario, incluirInicio }), error: "" };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : "No se pudo calcular el periodo." };
    }
  }, [start, end, bancario, incluirInicio]);

  const deadline = useMemo(() => {
    const from = aFecha(addFrom);
    const n = Number(addDays);
    if (!from || !addDays.trim() || !Number.isInteger(n)) return null;
    try {
      return { date: sumarHabiles(from, n, bancario), error: "" };
    } catch (e) {
      return { date: null, error: e instanceof Error ? e.message : "No se pudo calcular la fecha." };
    }
  }, [addFrom, addDays, bancario]);

  const year = (aFecha(start) ?? new Date()).getUTCFullYear();
  const holidays = useMemo(() => feriadosDe(year, true), [year]);

  return (
    <div className="tool-view grid gap-6" role="region" aria-label="Calculadora de días hábiles">
      <div data-reveal>
        <Checkbox
          label="Usar el calendario bancario"
          hint="suma Semana Santa, 2 nov y 12 dic"
          checked={bancario}
          onChange={setBancario}
        />
      </div>

      <section data-reveal style={{ animationDelay: "40ms" }} className="grid gap-3" aria-labelledby="days-between">
        <h3 id="days-between" className="text-lg font-bold">
          Días entre dos fechas
        </h3>
        <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
          <div className="grid gap-2">
            <label htmlFor="days-start" className={labelClass}>
              Desde
            </label>
            <input id="days-start" type="date" value={start} onChange={(e) => setStart(e.target.value)} className={cn(inputClass, "w-auto")} />
          </div>
          <div className="grid gap-2">
            <label htmlFor="days-end" className={labelClass}>
              Hasta
            </label>
            <input id="days-end" type="date" value={end} onChange={(e) => setEnd(e.target.value)} className={cn(inputClass, "w-auto")} />
          </div>
          <Checkbox label="Contar el día de inicio" checked={incluirInicio} onChange={setIncluirInicio} />
        </div>
        {range?.error && <InlineError>{range.error}</InlineError>}
        {range?.data && (
          <Card className="gap-4 py-5" aria-live="polite">
            <CardContent className="grid gap-4">
              <div className="flex flex-wrap gap-x-10 gap-y-3">
                <div className="grid">
                  <span className={labelClass}>Días hábiles</span>
                  <span className="text-4xl font-bold tabular-nums">{range.data.habiles.toLocaleString("es-MX")}</span>
                </div>
                <div className="grid">
                  <span className={labelClass}>Días naturales</span>
                  <span className="text-muted-foreground text-4xl font-bold tabular-nums">
                    {range.data.naturales.toLocaleString("es-MX")}
                  </span>
                </div>
              </div>
              <div className="grid gap-1">
                <ResultRow label="Fines de semana" value={plural(range.data.finesDeSemana, "día", "días")} />
                <ResultRow
                  label="Días feriados"
                  value={
                    range.data.feriados.length
                      ? range.data.feriados.map((f) => `${f.nombre} (${shortDate(f.fecha)})`).join(", ")
                      : "Ninguno entre semana"
                  }
                />
                <ResultRow label="Semanas" value={(Math.abs(range.data.naturales) / 7).toLocaleString("es-MX", { maximumFractionDigits: 1 })} />
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      <section data-reveal style={{ animationDelay: "80ms" }} className="grid gap-3" aria-labelledby="days-add">
        <h3 id="days-add" className="text-lg font-bold">
          ¿Cuándo vence un plazo?
        </h3>
        <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
          <div className="grid gap-2">
            <label htmlFor="add-from" className={labelClass}>
              Fecha de inicio
            </label>
            <input id="add-from" type="date" value={addFrom} onChange={(e) => setAddFrom(e.target.value)} className={cn(inputClass, "w-auto")} />
          </div>
          <div className="grid gap-2">
            <label htmlFor="add-days" className={labelClass}>
              Días hábiles
            </label>
            <input
              id="add-days"
              type="number"
              inputMode="numeric"
              step={1}
              value={addDays}
              onChange={(e) => setAddDays(e.target.value)}
              className={cn(inputClass, "w-28 tabular-nums")}
            />
          </div>
        </div>
        {deadline?.error && <InlineError>{deadline.error}</InlineError>}
        {deadline?.date && (
          <div aria-live="polite">
            <ResultRow
              label="Vence el"
              hint="contando desde el día siguiente"
              value={fullDate(deadline.date)}
              highlight
            />
          </div>
        )}
      </section>

      <section data-reveal style={{ animationDelay: "120ms" }} className="grid gap-3" aria-labelledby="holidays">
        <h3 id="holidays" className="text-lg font-bold">
          Días feriados {year} en México
        </h3>
        <ul role="list" className="m-0 grid list-none gap-0 p-0 sm:grid-cols-2 sm:gap-x-6">
          {holidays.map((f) => (
            <li key={f.fecha} className="flex items-baseline justify-between gap-3 border-b border-dashed border-border py-2 text-sm">
              <span>
                {f.nombre}
                {f.bancario && <span className="text-muted-foreground ml-1.5 text-xs">bancario</span>}
              </span>
              <span className="text-muted-foreground shrink-0 tabular-nums">{shortDate(f.fecha)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default BusinessDays;

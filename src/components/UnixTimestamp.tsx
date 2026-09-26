import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Checkbox, CopyButton, InlineError, ResultRow, inputClass, labelClass } from "./tool-kit";

type Unit = "s" | "ms" | "µs" | "ns";

const UNIT_LABEL: Record<Unit, string> = {
  s: "segundos",
  ms: "milisegundos",
  "µs": "microsegundos",
  ns: "nanosegundos",
};

/** Deduce la unidad por la cantidad de dígitos (10 → s, 13 → ms, 16 → µs, 19 → ns). */
const readTimestamp = (input: string): { date: Date; unit: Unit } | null => {
  const clean = input.trim().replace(/[\s_,]/g, "");
  if (!/^-?\d+(\.\d+)?$/.test(clean)) return null;
  const digits = clean.replace(/^-/, "").split(".")[0].length;
  const value = Number(clean);
  const unit: Unit = digits <= 11 ? "s" : digits <= 14 ? "ms" : digits <= 17 ? "µs" : "ns";
  const ms = { s: value * 1000, ms: value, "µs": value / 1000, ns: value / 1e6 }[unit];
  const date = new Date(ms);
  return Number.isNaN(date.getTime()) ? null : { date, unit };
};

const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

const relative = (date: Date, now: number) => {
  const diff = (date.getTime() - now) / 1000;
  const abs = Math.abs(diff);
  const steps: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "second"],
    [3600, "minute"],
    [86400, "hour"],
    [86400 * 30, "day"],
    [86400 * 365, "month"],
    [Infinity, "year"],
  ];
  const divisors: Record<string, number> = { second: 1, minute: 60, hour: 3600, day: 86400, month: 86400 * 30, year: 86400 * 365 };
  const [, unit] = steps.find(([limit]) => abs < limit)!;
  return rtf.format(Math.round(diff / divisors[unit]), unit);
};

const pad = (n: number) => String(n).padStart(2, "0");

/** Valor para <input type="datetime-local"> en hora local o UTC. */
const toDateTimeLocal = (date: Date, utc: boolean) => {
  const get = utc
    ? [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()]
    : [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
  const [y, mo, d, h, mi, s] = get;
  return `${y}-${pad(mo)}-${pad(d)}T${pad(h)}:${pad(mi)}:${pad(s)}`;
};

const fromDateTimeLocal = (value: string, utc: boolean): Date | null => {
  if (!value) return null;
  const date = new Date(utc ? `${value}Z` : value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const UnixTimestamp = () => {
  const [now, setNow] = useState<number | null>(null);
  const [tsInput, setTsInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [utc, setUtc] = useState(false);

  useEffect(() => {
    const start = Date.now();
    setNow(start);
    setTsInput(String(Math.floor(start / 1000)));
    setDateInput(toDateTimeLocal(new Date(start), false));
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const parsed = useMemo(() => readTimestamp(tsInput), [tsInput]);
  const fromDate = useMemo(() => fromDateTimeLocal(dateInput, utc), [dateInput, utc]);
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const nowSeconds = now === null ? "" : String(Math.floor(now / 1000));

  return (
    <div className="tool-view grid gap-6" role="region" aria-label="Conversor de timestamp Unix">
      <Card data-reveal className="gap-3 py-5">
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div className="grid gap-1">
            <span className={labelClass}>Timestamp actual</span>
            <span className="font-code text-2xl font-medium tabular-nums sm:text-3xl" aria-live="off">
              {nowSeconds || "…"}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyButton value={nowSeconds} label="Segundos" what="el timestamp en segundos" />
            <CopyButton value={now === null ? "" : String(now)} label="Milisegundos" what="el timestamp en milisegundos" />
          </div>
        </CardContent>
      </Card>

      <section data-reveal style={{ animationDelay: "40ms" }} className="grid gap-3" aria-labelledby="ts-to-date">
        <h3 id="ts-to-date" className="text-lg font-bold">
          Timestamp a fecha
        </h3>
        <label htmlFor="ts-input" className={labelClass}>
          Timestamp en segundos, milisegundos, µs o ns
        </label>
        <input
          id="ts-input"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          value={tsInput}
          onChange={(e) => setTsInput(e.target.value)}
          aria-invalid={Boolean(tsInput && !parsed)}
          placeholder="1700000000"
          className={cn(inputClass, "text-base")}
        />
        {tsInput && !parsed && <InlineError>Escribe solo dígitos, por ejemplo 1700000000.</InlineError>}
        {parsed && (
          <div className="grid gap-1" aria-live="polite">
            <ResultRow label="Unidad" value={UNIT_LABEL[parsed.unit]} />
            <ResultRow
              label="Hora local"
              hint={<span className="text-xs">{zone}</span>}
              value={parsed.date.toLocaleString("es-MX", { dateStyle: "full", timeStyle: "long" })}
            />
            <ResultRow label="UTC" value={parsed.date.toUTCString()} />
            <ResultRow label="ISO 8601" value={parsed.date.toISOString()} />
            {now !== null && <ResultRow label="Relativo" value={relative(parsed.date, now)} />}
          </div>
        )}
      </section>

      <section data-reveal style={{ animationDelay: "80ms" }} className="grid gap-3" aria-labelledby="date-to-ts">
        <h3 id="date-to-ts" className="text-lg font-bold">
          Fecha a timestamp
        </h3>
        <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
          <div className="grid gap-2">
            <label htmlFor="date-input" className={labelClass}>
              Fecha y hora
            </label>
            <input
              id="date-input"
              type="datetime-local"
              step={1}
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className={cn(inputClass, "w-auto")}
            />
          </div>
          <Checkbox label="Interpretar como UTC" checked={utc} onChange={setUtc} />
        </div>
        {fromDate && (
          <div className="grid gap-1" aria-live="polite">
            <ResultRow label="Segundos" value={String(Math.floor(fromDate.getTime() / 1000))} />
            <ResultRow label="Milisegundos" value={String(fromDate.getTime())} />
            <ResultRow label="ISO 8601" value={fromDate.toISOString()} />
          </div>
        )}
      </section>
    </div>
  );
};

export default UnixTimestamp;

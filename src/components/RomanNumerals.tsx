import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MAX_ROMANO, aRomano, deRomano, desglose } from "@/lib/romanos";
import { CopyButton, InlineError, inputClass, labelClass } from "./tool-kit";

const EXAMPLES = ["2026", "1994", "XIV", "MCMLXXXIV"];

const SIMBOLOS: [string, number][] = [
  ["I", 1],
  ["V", 5],
  ["X", 10],
  ["L", 50],
  ["C", 100],
  ["D", 500],
  ["M", 1000],
];

const DEL_1_AL_100 = Array.from({ length: 100 }, (_, i) => [i + 1, aRomano(i + 1)] as const);

type Result = { romano: string; numero: number; direction: "toRoman" | "toNumber" } | { error: string } | null;

const convert = (input: string): Result => {
  const value = input.trim();
  if (!value) return null;
  if (/^[\d\s,.]+$/.test(value)) {
    const n = Number(value.replace(/[\s,.]/g, ""));
    if (n < 1 || n > MAX_ROMANO) {
      return { error: `Los números romanos van del 1 al ${MAX_ROMANO.toLocaleString("es-MX")}. No existe el cero.` };
    }
    return { romano: aRomano(n), numero: n, direction: "toRoman" };
  }
  try {
    const numero = deRomano(value);
    return { romano: aRomano(numero), numero, direction: "toNumber" };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo leer el número romano." };
  }
};

const RomanNumerals = () => {
  const [input, setInput] = useState("2026");
  const result = useMemo(() => convert(input), [input]);
  const ok = result && !("error" in result) ? result : null;
  const output = ok ? (ok.direction === "toRoman" ? ok.romano : String(ok.numero)) : "";

  return (
    <div className="tool-view grid gap-5" role="region" aria-label="Convertir números romanos">
      <section data-reveal className="grid gap-3">
        <label htmlFor="roman-input" className={labelClass}>
          Número arábigo o romano
        </label>
        <input
          id="roman-input"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-invalid={Boolean(result && "error" in result)}
          aria-describedby="roman-examples"
          placeholder="1994 o MCMXCIV"
          className={cn(inputClass, "text-lg")}
        />
        <div id="roman-examples" className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Ejemplos:</span>
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setInput(example)}
              className="font-code hover:bg-accent focus-visible:ring-ring/50 min-h-9 cursor-pointer rounded-full border border-input bg-card px-3 text-xs transition-colors outline-none focus-visible:ring-[3px]"
            >
              {example}
            </button>
          ))}
        </div>
        {result && "error" in result && <InlineError>{result.error}</InlineError>}
      </section>

      {ok && (
        <Card data-reveal style={{ animationDelay: "40ms" }} aria-live="polite">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-muted-foreground text-sm font-semibold">
              {ok.direction === "toRoman" ? `${ok.numero.toLocaleString("es-MX")} en romano` : `${ok.romano} en arábigo`}
            </CardTitle>
            <CopyButton value={output} what="el resultado" variant="default" />
          </CardHeader>
          <CardContent className="grid gap-4">
            <p className="font-code m-0 text-4xl font-medium tracking-wide break-all sm:text-5xl">{output}</p>
            <ol className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0 text-sm" aria-label="Desglose">
              {desglose(ok.numero).map((parte, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-muted-foreground" aria-hidden>+</span>}
                  <span className="bg-muted inline-flex items-baseline gap-1.5 rounded-lg px-2 py-1">
                    <span className="font-code font-semibold">{parte.simbolo}</span>
                    <span className="text-muted-foreground tabular-nums">{parte.valor.toLocaleString("es-MX")}</span>
                  </span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      <section data-reveal style={{ animationDelay: "80ms" }} className="grid gap-3" aria-labelledby="roman-symbols">
        <h3 id="roman-symbols" className="text-lg font-bold">
          Los siete símbolos
        </h3>
        <dl className="m-0 grid grid-cols-4 gap-2 sm:grid-cols-7">
          {SIMBOLOS.map(([simbolo, valor]) => (
            <div key={simbolo} className="bg-muted/60 grid justify-items-center rounded-xl px-2 py-3">
              <dt className="font-code text-xl font-semibold">{simbolo}</dt>
              <dd className="text-muted-foreground m-0 text-sm tabular-nums">{valor.toLocaleString("es-MX")}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section data-reveal style={{ animationDelay: "120ms" }} className="grid gap-3" aria-labelledby="roman-table">
        <h3 id="roman-table" className="text-lg font-bold">
          Números romanos del 1 al 100
        </h3>
        <ul role="list" className="m-0 grid list-none grid-cols-2 gap-x-4 p-0 text-sm sm:grid-cols-4 md:grid-cols-5">
          {DEL_1_AL_100.map(([n, romano]) => (
            <li key={n} className="flex items-baseline justify-between gap-2 border-b border-dashed border-border py-1.5">
              <span className="text-muted-foreground tabular-nums">{n}</span>
              <span className="font-code">{romano}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default RomanNumerals;

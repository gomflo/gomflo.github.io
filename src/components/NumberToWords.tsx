import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  MAX_ENTERO,
  MONEDAS,
  aLetrasMoneda,
  aLetrasNumero,
  leerNumero,
  type Moneda,
} from "@/lib/numeros-letras";
import { Checkbox, CopyButton, InlineError, Segmented, inputClass, labelClass } from "./tool-kit";

type Mode = "money" | "number";

const EXAMPLES = ["1,500.00", "21", "1234.56", "1000000"];

const NumberToWords = () => {
  const [input, setInput] = useState("1234.56");
  const [mode, setMode] = useState<Mode>("money");
  const [currency, setCurrency] = useState<Moneda>("MXN");
  const [uppercase, setUppercase] = useState(true);

  const result = useMemo(() => {
    if (!input.trim()) return { text: "", error: "" };
    const numero = leerNumero(input);
    if (!numero) return { text: "", error: "Escribe una cantidad como 1234.56 o 1,234.56." };
    if (numero.entero > MAX_ENTERO) return { text: "", error: "La cantidad máxima es 999 billones." };
    const text = mode === "money" ? aLetrasMoneda(numero, currency) : aLetrasNumero(numero);
    return { text: uppercase ? text.toLocaleUpperCase("es") : text, error: "" };
  }, [input, mode, currency, uppercase]);

  const formatted = useMemo(() => {
    const numero = leerNumero(input);
    if (!numero || numero.entero > MAX_ENTERO) return "";
    const value = Number(`${numero.negativo ? "-" : ""}${numero.entero}.${numero.decimales || "0"}`);
    return mode === "money"
      ? new Intl.NumberFormat("es-MX", { style: "currency", currency, currencyDisplay: "code" }).format(value)
      : new Intl.NumberFormat("es-MX", { maximumFractionDigits: 20 }).format(value);
  }, [input, mode, currency]);

  return (
    <div className="tool-view grid gap-5" role="region" aria-label="Convertir números a letras">
      <section data-reveal className="grid gap-3">
        <label htmlFor="ntw-input" className={labelClass}>
          Cantidad
        </label>
        <input
          id="ntw-input"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-invalid={Boolean(result.error)}
          aria-describedby="ntw-examples"
          className={cn(inputClass, "text-lg")}
        />
        <div id="ntw-examples" className="flex flex-wrap items-center gap-2 text-sm">
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
        {result.error && <InlineError>{result.error}</InlineError>}
      </section>

      <div data-reveal style={{ animationDelay: "40ms" }} className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Segmented
          label="Formato"
          value={mode}
          onChange={setMode}
          options={[
            { value: "money", label: "Moneda" },
            { value: "number", label: "Número" },
          ]}
        />
        {mode === "money" && (
          <Segmented
            label="Moneda"
            value={currency}
            onChange={setCurrency}
            options={(Object.keys(MONEDAS) as Moneda[]).map((code) => ({ value: code, label: code }))}
          />
        )}
        <Checkbox label="Mayúsculas" checked={uppercase} onChange={setUppercase} />
      </div>

      {result.text && (
        <Card data-reveal style={{ animationDelay: "80ms" }} aria-live="polite">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-muted-foreground font-code text-sm font-normal tabular-nums">{formatted}</CardTitle>
            <CopyButton value={result.text} what="la cantidad con letra" variant="default" />
          </CardHeader>
          <CardContent>
            <p className="m-0 text-xl leading-snug font-semibold text-pretty sm:text-2xl">{result.text}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NumberToWords;

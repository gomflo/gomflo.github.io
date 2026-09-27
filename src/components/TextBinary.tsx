import { useMemo, useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { BASES, codificar, decodificar, type Base } from "@/lib/binario";
import { CopyButton, InlineError, Segmented, labelClass, textareaClass } from "./tool-kit";

type Direction = "encode" | "decode";

const PLACEHOLDER: Record<Base, string> = {
  bin: "01001000 01101111 01101100 01100001",
  hex: "48 6f 6c 61",
  oct: "110 157 154 141",
  dec: "72 111 108 97",
};

const ABECEDARIO = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const TextBinary = () => {
  const [input, setInput] = useState("Hola");
  const [direction, setDirection] = useState<Direction>("encode");
  const [base, setBase] = useState<Base>("bin");

  const result = useMemo(() => {
    if (!input) return { output: "", error: "" };
    if (direction === "encode") return { output: codificar(input, base), error: "" };
    try {
      return { output: decodificar(input, base), error: "" };
    } catch (e) {
      return { output: "", error: e instanceof Error ? e.message : "No se pudo convertir." };
    }
  }, [input, direction, base]);

  const swap = () => {
    if (!result.output) return;
    setInput(result.output);
    setDirection((d) => (d === "encode" ? "decode" : "encode"));
  };

  const baseName = BASES[base].nombre.toLowerCase();
  const bytes = direction === "encode" ? new TextEncoder().encode(input).length : 0;

  return (
    <div className="tool-view grid gap-5" role="region" aria-label="Traductor de texto a binario">
      <div data-reveal className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Segmented
          label="Acción"
          value={direction}
          onChange={setDirection}
          options={[
            { value: "encode", label: `Texto a ${baseName}` },
            { value: "decode", label: `${BASES[base].nombre} a texto` },
          ]}
        />
        <Segmented
          label="Sistema"
          value={base}
          onChange={setBase}
          options={(Object.keys(BASES) as Base[]).map((b) => ({ value: b, label: BASES[b].nombre }))}
        />
      </div>

      <section data-reveal style={{ animationDelay: "40ms" }} className="grid gap-3">
        <label htmlFor="bin-input" className={labelClass}>
          {direction === "encode" ? "Texto" : BASES[base].nombre}
        </label>
        <Textarea
          id="bin-input"
          rows={5}
          spellCheck={direction === "encode"}
          placeholder={direction === "encode" ? "Hola, ¿qué tal?" : PLACEHOLDER[base]}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-invalid={Boolean(result.error)}
          className={textareaClass}
        />
        {result.error && <InlineError>{result.error}</InlineError>}
      </section>

      {result.output && (
        <Card data-reveal style={{ animationDelay: "80ms" }} aria-live="polite">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base font-semibold">
              {direction === "encode" ? BASES[base].nombre : "Texto"}
              {direction === "encode" && (
                <span className="text-muted-foreground ml-2 text-sm font-normal tabular-nums">
                  {bytes.toLocaleString("es-MX")} {bytes === 1 ? "byte" : "bytes"}
                </span>
              )}
            </CardTitle>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={swap} className="min-h-[44px] cursor-pointer">
                <ArrowUpDown aria-hidden />
                Usar como entrada
              </Button>
              <CopyButton value={result.output} what="el resultado" />
            </div>
          </CardHeader>
          <CardContent>
            <pre className="font-code m-0 max-h-96 overflow-auto text-sm leading-relaxed whitespace-pre-wrap break-words">
              {result.output}
            </pre>
          </CardContent>
        </Card>
      )}

      <section data-reveal style={{ animationDelay: "120ms" }} className="grid gap-3" aria-labelledby="bin-alphabet">
        <h3 id="bin-alphabet" className="text-lg font-bold">
          Abecedario en binario
        </h3>
        <p className="text-muted-foreground m-0 text-sm text-pretty">
          Cada letra es un byte de 8 bits. Las minúsculas son iguales a las mayúsculas, pero con el tercer bit
          encendido: A es <code className="font-code">01000001</code> y a es <code className="font-code">01100001</code>.
        </p>
        <dl className="m-0 grid grid-cols-2 gap-x-4 sm:grid-cols-3 md:grid-cols-4">
          {ABECEDARIO.map((letra) => (
            <div key={letra} className="flex items-baseline justify-between gap-3 border-b border-dashed border-border py-1.5">
              <dt className="font-semibold">{letra}</dt>
              <dd className="font-code m-0 text-sm">{codificar(letra, "bin")}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
};

export default TextBinary;

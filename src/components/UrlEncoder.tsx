import { useMemo, useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton, InlineError, ResultRow, Segmented, labelClass, textareaClass } from "./tool-kit";

type Direction = "encode" | "decode";
type Scope = "component" | "full";

const transform = (text: string, direction: Direction, scope: Scope): string => {
  if (direction === "encode") {
    return scope === "component" ? encodeURIComponent(text) : encodeURI(text);
  }
  // En formularios el espacio viaja como "+".
  const withSpaces = text.replace(/\+/g, " ");
  return scope === "component" ? decodeURIComponent(withSpaces) : decodeURI(withSpaces);
};

const safeDecode = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

const parseUrl = (text: string): URL | null => {
  const trimmed = text.trim();
  if (!/^[a-z][a-z\d+.-]*:\/\//i.test(trimmed)) return null;
  try {
    return new URL(trimmed);
  } catch {
    return null;
  }
};

const UrlEncoder = () => {
  const [input, setInput] = useState("");
  const [direction, setDirection] = useState<Direction>("encode");
  const [scope, setScope] = useState<Scope>("component");

  const result = useMemo(() => {
    if (!input) return { output: "", error: "" };
    try {
      return { output: transform(input, direction, scope), error: "" };
    } catch {
      return {
        output: "",
        error: "El texto tiene una secuencia % incompleta o inválida. Revisa que cada % vaya seguido de dos dígitos hexadecimales.",
      };
    }
  }, [input, direction, scope]);

  const url = useMemo(() => parseUrl(direction === "decode" ? result.output || input : input), [direction, input, result.output]);
  const params = url ? Array.from(url.searchParams.entries()) : [];

  const swap = () => {
    if (!result.output) return;
    setInput(result.output);
    setDirection((d) => (d === "encode" ? "decode" : "encode"));
  };

  return (
    <div className="tool-view grid gap-5" role="region" aria-label="Codificar y decodificar URL">
      <div data-reveal className="flex flex-wrap gap-3">
        <Segmented
          label="Acción"
          value={direction}
          onChange={setDirection}
          options={[
            { value: "encode", label: "Codificar" },
            { value: "decode", label: "Decodificar" },
          ]}
        />
        <Segmented
          label="Alcance"
          value={scope}
          onChange={setScope}
          options={[
            { value: "component", label: "Parámetro" },
            { value: "full", label: "URL completa" },
          ]}
        />
      </div>

      <section data-reveal style={{ animationDelay: "40ms" }} className="grid gap-3">
        <label htmlFor="url-input" className={labelClass}>
          {direction === "encode" ? "Texto o URL a codificar" : "Texto codificado"}
        </label>
        <Textarea
          id="url-input"
          rows={5}
          spellCheck={false}
          placeholder={direction === "encode" ? "https://ejemplo.com/buscar?q=café con leche" : "caf%C3%A9%20con%20leche"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-invalid={Boolean(result.error)}
          className={textareaClass}
        />
        <p className="text-muted-foreground text-sm">
          {scope === "component"
            ? "Parámetro codifica también / ? & = #, como encodeURIComponent."
            : "URL completa conserva / ? & = #, como encodeURI."}
        </p>
        {result.error && <InlineError>{result.error}</InlineError>}
      </section>

      {result.output && (
        <Card data-reveal style={{ animationDelay: "80ms" }} aria-live="polite">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base font-semibold">
              {direction === "encode" ? "Texto codificado" : "Texto decodificado"}
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
            <pre className="font-code m-0 text-sm whitespace-pre-wrap break-all">{result.output}</pre>
          </CardContent>
        </Card>
      )}

      {url && (
        <section data-reveal style={{ animationDelay: "120ms" }} className="grid gap-3" aria-labelledby="url-parts-heading">
          <h3 id="url-parts-heading" className="text-lg font-bold">
            Partes de la URL
          </h3>
          <div className="grid gap-1">
            <ResultRow label="Protocolo" value={url.protocol.replace(":", "")} />
            <ResultRow label="Dominio" value={url.hostname} />
            {url.port && <ResultRow label="Puerto" value={url.port} />}
            <ResultRow label="Ruta" value={safeDecode(url.pathname)} />
            {url.hash && <ResultRow label="Fragmento" value={safeDecode(url.hash.slice(1))} />}
          </div>
          {params.length > 0 && (
            <>
              <h4 className={labelClass}>Parámetros ({params.length})</h4>
              <div className="grid gap-1">
                {params.map(([key, value], i) => (
                  <ResultRow key={`${key}-${i}`} label={key} value={value} />
                ))}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
};

export default UrlEncoder;

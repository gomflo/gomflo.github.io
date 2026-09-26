import { useMemo, useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox, CopyButton, InlineError, Segmented, labelClass, textareaClass } from "./tool-kit";

type Direction = "encode" | "decode";

const encode = (text: string, urlSafe: boolean) => {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  const b64 = btoa(binary);
  return urlSafe ? b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : b64;
};

const decode = (input: string) => {
  let b64 = input.trim().replace(/\s/g, "");
  if (b64.startsWith("data:")) b64 = b64.slice(b64.indexOf(",") + 1);
  b64 = b64.replace(/-/g, "+").replace(/_/g, "/");
  b64 += "=".repeat((4 - (b64.length % 4)) % 4);
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(b64)) throw new Error("invalid");
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
};

const Base64Text = () => {
  const [input, setInput] = useState("");
  const [direction, setDirection] = useState<Direction>("encode");
  const [urlSafe, setUrlSafe] = useState(false);

  const result = useMemo(() => {
    if (!input) return { output: "", error: "" };
    if (direction === "encode") return { output: encode(input, urlSafe), error: "" };
    try {
      return { output: decode(input), error: "" };
    } catch {
      return {
        output: "",
        error: "No es Base64 válido o no contiene texto UTF-8. Si es una imagen o un PDF, usa Base64 ↔ Archivo.",
      };
    }
  }, [input, direction, urlSafe]);

  const swap = () => {
    if (!result.output) return;
    setInput(result.output);
    setDirection((d) => (d === "encode" ? "decode" : "encode"));
  };

  return (
    <div className="tool-view grid gap-5" role="region" aria-label="Codificar y decodificar Base64">
      <div data-reveal className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <Segmented
          label="Acción"
          value={direction}
          onChange={setDirection}
          options={[
            { value: "encode", label: "Texto a Base64" },
            { value: "decode", label: "Base64 a texto" },
          ]}
        />
        {direction === "encode" && (
          <Checkbox label="Seguro para URL" hint="- _ sin =" checked={urlSafe} onChange={setUrlSafe} />
        )}
      </div>

      <section data-reveal style={{ animationDelay: "40ms" }} className="grid gap-3">
        <label htmlFor="b64-input" className={labelClass}>
          {direction === "encode" ? "Texto" : "Base64"}
        </label>
        <Textarea
          id="b64-input"
          rows={6}
          spellCheck={direction === "encode"}
          placeholder={direction === "encode" ? "Hola, ¿cómo estás? 👋" : "SG9sYSwgwr9jw7NtbyBlc3TDoXM/IPCfkYs="}
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
              {direction === "encode" ? "Base64" : "Texto"}
              <span className="text-muted-foreground ml-2 text-sm font-normal tabular-nums">
                {result.output.length.toLocaleString("es-MX")} caracteres
              </span>
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
            <pre className="font-code m-0 max-h-96 overflow-auto text-sm whitespace-pre-wrap break-all">{result.output}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Base64Text;

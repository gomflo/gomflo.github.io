import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const base64UrlDecode = (str: string): string => {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

type DecodedResult = {
  header: string;
  payload: string;
} | null;

const JwtDecoder = () => {
  const [input, setInput] = useState("");
  const [decoded, setDecoded] = useState<DecodedResult>(null);
  const [isCopyingHeader, setIsCopyingHeader] = useState(false);
  const [isCopyingPayload, setIsCopyingPayload] = useState(false);

  const handleDecode = () => {
    const trimmed = input.trim();
    if (!trimmed) {
      setDecoded(null);
      return;
    }
    try {
      const parts = trimmed.split(".");
      if (parts.length !== 3) {
        toast.error("JWT inválido: debe tener 3 partes separadas por puntos");
        setDecoded(null);
        return;
      }
      const [headerB64, payloadB64] = parts;
      const headerStr = base64UrlDecode(headerB64);
      const payloadStr = base64UrlDecode(payloadB64);
      const headerParsed = JSON.parse(headerStr);
      const payloadParsed = JSON.parse(payloadStr);
      setDecoded({
        header: JSON.stringify(headerParsed, null, 2),
        payload: JSON.stringify(payloadParsed, null, 2),
      });
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      toast.error(`Error al decodificar JWT: ${err.message}`);
      setDecoded(null);
    }
  };

  const handleCopyHeader = async () => {
    if (!decoded) return;
    setIsCopyingHeader(true);
    try {
      await navigator.clipboard.writeText(decoded.header);
      toast.success("Header copiado al portapapeles");
    } catch {
      toast.error("No se pudo copiar al portapapeles");
    } finally {
      setIsCopyingHeader(false);
    }
  };

  const handleCopyPayload = async () => {
    if (!decoded) return;
    setIsCopyingPayload(true);
    try {
      await navigator.clipboard.writeText(decoded.payload);
      toast.success("Payload copiado al portapapeles");
    } catch {
      toast.error("No se pudo copiar al portapapeles");
    } finally {
      setIsCopyingPayload(false);
    }
  };

  return (
    <div
      className="jwt-decoder grid gap-8"
      role="region"
      aria-label="Decodificador JWT"
    >
      <section
        className="grid gap-3"
        data-reveal
        style={{ animationDelay: "0ms" }}
      >
        <label
          htmlFor="jwt-input"
          className="text-muted-foreground font-display text-xs font-medium uppercase tracking-wider"
        >
          JWT
        </label>
        <Textarea
          id="jwt-input"
          name="jwt-input"
          placeholder="Pega aquí tu JWT (header.payload.firma)…"
          rows={6}
          spellCheck={false}
          autoComplete="off"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="JWT de entrada"
          className="font-code min-w-0 resize-y text-sm transition-[border-color,box-shadow] duration-200 focus-visible:ring-(--json-result-accent)/25"
        />
      </section>

      <div
        className="flex flex-wrap items-center gap-2"
        data-reveal
        role="group"
        aria-label="Acciones"
        style={{ animationDelay: "80ms" }}
      >
        <Button
          variant="outline"
          onClick={handleDecode}
          aria-label="Decodificar JWT"
          className="min-h-[44px] cursor-pointer hover:border-(--json-result-accent)/50 hover:bg-(--json-result-accent)/5"
        >
          Decodificar
        </Button>
      </div>

      {decoded && (
        <div className="grid gap-6" aria-live="polite">
          <Card
            data-reveal
            style={{ animationDelay: "120ms" }}
            className="transition-shadow duration-200 focus-within:ring-2 focus-within:ring-(--json-result-accent)/20 focus-within:ring-offset-2"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle id="jwt-header-label" className="text-base font-medium">
                Header
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyHeader}
                disabled={isCopyingHeader}
                aria-label={isCopyingHeader ? "Copiando…" : "Copiar header al portapapeles"}
                className="min-h-[44px] min-w-[44px] cursor-pointer disabled:opacity-50"
              >
                {isCopyingHeader ? "Copiando…" : "Copiar"}
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="m-0 overflow-auto">
                <code className="font-code text-sm whitespace-pre-wrap wrap-break-word">
                  {decoded.header}
                </code>
              </pre>
            </CardContent>
          </Card>

          <Card
            data-reveal
            style={{ animationDelay: "160ms" }}
            className="transition-shadow duration-200 focus-within:ring-2 focus-within:ring-(--json-result-accent)/20 focus-within:ring-offset-2"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle id="jwt-payload-label" className="text-base font-medium">
                Payload
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyPayload}
                disabled={isCopyingPayload}
                aria-label={isCopyingPayload ? "Copiando…" : "Copiar payload al portapapeles"}
                className="min-h-[44px] min-w-[44px] cursor-pointer disabled:opacity-50"
              >
                {isCopyingPayload ? "Copiando…" : "Copiar"}
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="m-0 overflow-auto">
                <code className="font-code text-sm whitespace-pre-wrap wrap-break-word">
                  {decoded.payload}
                </code>
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default JwtDecoder;

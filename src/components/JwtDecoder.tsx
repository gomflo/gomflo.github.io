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
    try {
      await navigator.clipboard.writeText(decoded.header);
      toast.success("Header copiado al portapapeles");
    } catch {
      toast.error("No se pudo copiar al portapapeles");
    }
  };

  const handleCopyPayload = async () => {
    if (!decoded) return;
    try {
      await navigator.clipboard.writeText(decoded.payload);
      toast.success("Payload copiado al portapapeles");
    } catch {
      toast.error("No se pudo copiar al portapapeles");
    }
  };

  return (
    <div className="space-y-4">
      <Textarea
        id="jwt-input"
        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
        rows={6}
        spellCheck={false}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        aria-label="JWT de entrada"
        className="font-code text-sm"
      />

      <div className="flex gap-2" role="group" aria-label="Acciones">
        <Button
          variant="outline"
          onClick={handleDecode}
          aria-label="Decodificar JWT"
        >
          Decodificar
        </Button>
      </div>

      {decoded && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Header</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyHeader}
                aria-label="Copiar header al portapapeles"
              >
                Copiar
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="m-0 overflow-auto">
                <code className="font-code text-sm whitespace-pre-wrap break-all">
                  {decoded.header}
                </code>
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">Payload</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyPayload}
                aria-label="Copiar payload al portapapeles"
              >
                Copiar
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="m-0 overflow-auto">
                <code className="font-code text-sm whitespace-pre-wrap break-all">
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

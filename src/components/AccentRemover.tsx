import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const removeAccents = (str: string): string =>
  str.normalize("NFD").replace(/\p{Diacritic}/gu, "");

const AccentRemover = () => {
  const [input, setInput] = useState("");

  const output = useMemo(() => removeAccents(input), [input]);

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      toast.success("Texto copiado al portapapeles");
    } catch {
      toast.error("No se pudo copiar al portapapeles");
    }
  };

  return (
    <div className="space-y-4">
      <Textarea
        id="accent-remover-input"
        placeholder="Escribe o pega aquí el texto con acentos..."
        rows={6}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        aria-label="Texto de entrada con acentos"
        className="font-code text-sm"
      />

      {output ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">
              Texto sin acentos
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              aria-label="Copiar texto sin acentos al portapapeles"
            >
              Copiar
            </Button>
          </CardHeader>
          <CardContent>
            <pre className="m-0 overflow-auto">
              <code className="font-code text-sm whitespace-pre-wrap break-all">
                {output}
              </code>
            </pre>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default AccentRemover;

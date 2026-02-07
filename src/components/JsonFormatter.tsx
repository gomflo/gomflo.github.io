import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const JsonFormatter = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const handleFormat = () => {
    const trimmed = input.trim();
    if (!trimmed) {
      setOutput("");
      return;
    }
    try {
      const parsed = JSON.parse(trimmed);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      toast.error(`JSON inválido: ${err.message}`);
      setOutput("");
    }
  };

  const handleMinify = () => {
    const trimmed = input.trim();
    if (!trimmed) {
      setOutput("");
      return;
    }
    try {
      const parsed = JSON.parse(trimmed);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      toast.error(`JSON inválido: ${err.message}`);
      setOutput("");
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      toast.success("Copiado al portapapeles");
    } catch {
      toast.error("No se pudo copiar al portapapeles");
    }
  };

  return (
    <div className="space-y-4">
      <Textarea
        id="json-input"
        placeholder='{"ejemplo": "pega aquí tu JSON"}'
        rows={10}
        spellCheck={false}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        aria-label="JSON de entrada"
        className="font-code text-sm"
      />

      <div className="flex gap-2" role="group" aria-label="Acciones">
        <Button variant="outline" onClick={handleFormat} aria-label="Formatear JSON con indentación">
          Formatear
        </Button>
        <Button variant="outline" onClick={handleMinify} aria-label="Minificar JSON en una línea">
          Minificar
        </Button>
        <Button
          variant="outline"
          onClick={handleCopy}
          disabled={!output}
          aria-label="Copiar resultado al portapapeles"
        >
          Copiar
        </Button>
      </div>

      {output && (
        <div
          role="textbox"
          tabIndex={0}
          className="min-h-16 w-full cursor-text select-all border-[0.5px] border-solid border-[#333] bg-transparent px-3 py-2 shadow-xs"
          aria-label="Resultado JSON. Clic para seleccionar todo"
        >
          <pre className="m-0 overflow-auto">
            <code className="font-code text-sm whitespace-pre-wrap break-all">{output}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

export default JsonFormatter;

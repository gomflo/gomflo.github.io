import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const JsonFormatter = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isCopying, setIsCopying] = useState(false);

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
      toast.error(`JSON inválido: ${err.message}. Revisa la sintaxis (comillas, comas, llaves) y vuelve a intentar.`);
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
      toast.error(`JSON inválido: ${err.message}. Revisa la sintaxis (comillas, comas, llaves) y vuelve a intentar.`);
      setOutput("");
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(output);
      toast.success("Copiado al portapapeles");
    } catch {
      toast.error("No se pudo copiar al portapapeles");
    } finally {
      setIsCopying(false);
    }
  };

  const handleResultKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const range = document.createRange();
      range.selectNodeContents(e.currentTarget);
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  };

  return (
    <div
      className="json-formatter grid gap-8"
      role="region"
      aria-label="Formateador JSON"
    >
      <section
        className="grid gap-3"
        data-reveal
        style={{ animationDelay: "0ms" }}
      >
        <label
          htmlFor="json-input"
          className="text-muted-foreground font-display text-xs font-medium uppercase tracking-wider"
        >
          Entrada
        </label>
        <Textarea
          id="json-input"
          name="json-input"
          placeholder='{"ejemplo": "pega aquí tu JSON"}…'
          rows={10}
          spellCheck={false}
          autoComplete="off"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="JSON de entrada"
          className="font-code min-h-48 min-w-0 resize-y text-sm transition-[border-color,box-shadow] duration-200 focus-visible:ring-(--json-result-accent)/25"
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
          onClick={handleFormat}
          aria-label="Formatear JSON con indentación"
          className="min-h-[44px] cursor-pointer hover:border-(--json-result-accent)/50 hover:bg-(--json-result-accent)/5"
        >
          Formatear
        </Button>
        <Button
          variant="outline"
          onClick={handleMinify}
          aria-label="Minificar JSON en una línea"
          className="min-h-[44px] cursor-pointer hover:border-(--json-result-accent)/50 hover:bg-(--json-result-accent)/5"
        >
          Minificar
        </Button>
        <Button
          variant="outline"
          onClick={handleCopy}
          disabled={!output || isCopying}
          aria-label={isCopying ? "Copiando…" : "Copiar resultado al portapapeles"}
          className="min-h-[44px] cursor-pointer hover:border-(--json-result-accent)/50 hover:bg-(--json-result-accent)/5 disabled:opacity-50"
        >
          {isCopying ? "Copiando…" : "Copiar"}
        </Button>
      </div>

      {output && (
        <section
          className="grid gap-3"
          data-reveal
          style={{ animationDelay: "160ms" }}
          aria-live="polite"
          aria-label="Resultado"
        >
          <span
            id="json-result-label"
            className="text-muted-foreground font-display text-xs font-medium uppercase tracking-wider"
          >
            Resultado
          </span>
          <div
            role="region"
            tabIndex={0}
            aria-labelledby="json-result-label"
            aria-label="Resultado JSON. Enter o espacio para seleccionar todo"
            className="json-formatter-result-accent min-h-16 w-full cursor-text select-all border-[0.5px] border-solid border-(--color-border) border-l-[3px] bg-muted/40 px-4 py-3 shadow-sm transition-shadow duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--json-result-accent)/30 focus-visible:ring-offset-2"
            onKeyDown={handleResultKeyDown}
          >
            <pre className="m-0 overflow-auto">
              <code className="font-code text-sm whitespace-pre-wrap wrap-break-word">
                {output}
              </code>
            </pre>
          </div>
        </section>
      )}
    </div>
  );
};

export default JsonFormatter;

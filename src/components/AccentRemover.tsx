import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const removeAccents = (str: string): string =>
  str.normalize("NFD").replace(/\p{Diacritic}/gu, "");

const AccentRemover = () => {
  const [input, setInput] = useState("");
  const [isCopying, setIsCopying] = useState(false);

  const output = useMemo(() => removeAccents(input), [input]);

  const handleCopy = async () => {
    if (!output) return;
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(output);
      toast.success("Texto copiado al portapapeles");
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
      className="accent-remover grid gap-8"
      role="region"
      aria-label="Removedor de acentos"
    >
      <section
        className="grid gap-3"
        data-reveal
        style={{ animationDelay: "0ms" }}
      >
        <label
          htmlFor="accent-remover-input"
          className="text-muted-foreground font-display text-xs font-medium uppercase tracking-wider"
        >
          Texto con acentos
        </label>
        <Textarea
          id="accent-remover-input"
          name="accent-remover-input"
          placeholder="Escribe o pega aquí el texto con acentos…"
          rows={6}
          spellCheck={true}
          autoComplete="off"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Texto de entrada con acentos"
          className="font-code min-w-0 resize-y text-sm transition-[border-color,box-shadow] duration-200 focus-visible:ring-(--json-result-accent)/25"
        />
      </section>

      {output ? (
        <Card
          data-reveal
          style={{ animationDelay: "80ms" }}
          className="grid gap-3 transition-shadow duration-200 focus-within:ring-2 focus-within:ring-(--json-result-accent)/20 focus-within:ring-offset-2"
          aria-live="polite"
          aria-label="Resultado sin acentos"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle id="accent-remover-result-label" className="text-base font-medium">
              Texto sin acentos
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={isCopying}
              aria-label={isCopying ? "Copiando…" : "Copiar texto sin acentos al portapapeles"}
              className="min-h-[44px] min-w-[44px] cursor-pointer disabled:opacity-50"
            >
              {isCopying ? "Copiando…" : "Copiar"}
            </Button>
          </CardHeader>
          <CardContent>
            <div
              role="region"
              tabIndex={0}
              aria-labelledby="accent-remover-result-label"
              aria-label="Resultado. Enter o espacio para seleccionar todo"
              className="min-h-12 w-full cursor-text select-all rounded-md border border-transparent px-1 py-0.5 transition-shadow duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--json-result-accent)/30 focus-visible:ring-offset-2"
              onKeyDown={handleResultKeyDown}
            >
              <pre className="m-0 overflow-auto">
                <code className="font-code text-sm whitespace-pre-wrap wrap-break-word">
                  {output}
                </code>
              </pre>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default AccentRemover;

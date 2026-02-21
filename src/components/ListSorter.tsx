import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SortDirection = "asc" | "desc";

const sortLines = (text: string, direction: SortDirection): string => {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
  const sorted = [...lines].sort((a, b) => a.localeCompare(b, "es"));
  const result =
    direction === "desc" ? [...sorted].reverse() : sorted;
  return result.join("\n");
};

const ListSorter = () => {
  const [input, setInput] = useState("");
  const [direction, setDirection] = useState<SortDirection>("asc");
  const [isCopying, setIsCopying] = useState(false);

  const output = useMemo(() => sortLines(input, direction), [input, direction]);

  const handleCopy = async () => {
    if (!output) return;
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(output);
      toast.success("Lista copiada al portapapeles");
    } catch {
      toast.error("No se pudo copiar al portapapeles");
    } finally {
      setIsCopying(false);
    }
  };

  const handleDirectionAsc = () => setDirection("asc");
  const handleDirectionDesc = () => setDirection("desc");

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
      className="list-sorter grid gap-8"
      role="region"
      aria-label="Ordenador de lista"
    >
      <section
        className="grid gap-3"
        data-reveal
        style={{ animationDelay: "0ms" }}
      >
        <label
          htmlFor="list-sorter-input"
          className="text-muted-foreground font-display text-xs font-medium uppercase tracking-wider"
        >
          Lista (un elemento por línea)
        </label>
        <Textarea
          id="list-sorter-input"
          name="list-sorter-input"
          placeholder="Un elemento por línea…"
          rows={6}
          spellCheck={true}
          autoComplete="off"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Lista de entrada, un elemento por línea"
          className="font-code min-w-0 resize-y text-sm transition-[border-color,box-shadow] duration-200 focus-visible:ring-(--json-result-accent)/25"
        />
      </section>

      <div
        className="flex flex-wrap gap-2"
        data-reveal
        role="group"
        aria-label="Dirección de orden"
        style={{ animationDelay: "80ms" }}
      >
        <Button
          type="button"
          variant={direction === "asc" ? "default" : "outline"}
          size="sm"
          onClick={handleDirectionAsc}
          aria-label="Ordenar de A a Z"
          aria-pressed={direction === "asc"}
          className="min-h-[44px] cursor-pointer"
        >
          A → Z
        </Button>
        <Button
          type="button"
          variant={direction === "desc" ? "default" : "outline"}
          size="sm"
          onClick={handleDirectionDesc}
          aria-label="Ordenar de Z a A"
          aria-pressed={direction === "desc"}
          className="min-h-[44px] cursor-pointer"
        >
          Z → A
        </Button>
      </div>

      {output ? (
        <Card
          data-reveal
          style={{ animationDelay: "120ms" }}
          className="grid gap-3 transition-shadow duration-200 focus-within:ring-2 focus-within:ring-(--json-result-accent)/20 focus-within:ring-offset-2"
          aria-live="polite"
          aria-label="Lista ordenada"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle id="list-sorter-result-label" className="text-base font-medium">
              Lista ordenada
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={isCopying}
              aria-label={isCopying ? "Copiando…" : "Copiar lista ordenada al portapapeles"}
              className="min-h-[44px] min-w-[44px] cursor-pointer disabled:opacity-50"
            >
              {isCopying ? "Copiando…" : "Copiar"}
            </Button>
          </CardHeader>
          <CardContent>
            <div
              role="region"
              tabIndex={0}
              aria-labelledby="list-sorter-result-label"
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

export default ListSorter;

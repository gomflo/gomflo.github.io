import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const JsonFormatter = () => {
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [isCopying, setIsCopying] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyTransform = useCallback(
    (transformer: (parsed: unknown) => string) => {
      const trimmed = value.trim();
      if (!trimmed) return;
      try {
        const parsed = JSON.parse(trimmed);
        const result = transformer(parsed);
        if (result === value) return;

        const doUpdate = () => {
          setHistory((prev) => [...prev, value]);
          setValue(result);
          // Auto-resize: scroll to top after transform
          requestAnimationFrame(() => {
            if (textareaRef.current) {
              textareaRef.current.scrollTop = 0;
            }
          });
        };

        // Use View Transitions if available
        if (typeof document !== "undefined" && "startViewTransition" in document) {
          (document as any).startViewTransition(doUpdate);
        } else {
          doUpdate();
        }
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        toast.error(
          `JSON inválido: ${err.message}. Revisa la sintaxis y vuelve a intentar.`
        );
      }
    },
    [value]
  );

  const handleFormat = useCallback(
    () => applyTransform((parsed) => JSON.stringify(parsed, null, 2)),
    [applyTransform]
  );

  const handleMinify = useCallback(
    () => applyTransform((parsed) => JSON.stringify(parsed)),
    [applyTransform]
  );

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const doUndo = () => {
      const prev = history[history.length - 1];
      setHistory((h) => h.slice(0, -1));
      setValue(prev);
    };

    if (typeof document !== "undefined" && "startViewTransition" in document) {
      (document as any).startViewTransition(doUndo);
    } else {
      doUndo();
    }
  }, [history]);

  const handleCopy = useCallback(async () => {
    if (!value.trim()) return;
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copiado al portapapeles");
    } catch {
      toast.error("No se pudo copiar al portapapeles");
    } finally {
      setIsCopying(false);
    }
  }, [value]);

  const hasContent = value.trim().length > 0;
  const canUndo = history.length > 0;

  return (
    <div
      className="json-formatter grid gap-5"
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
          className="text-muted-foreground text-sm font-semibold"
        >
          JSON
        </label>
        <Textarea
          ref={textareaRef}
          id="json-input"
          name="json-input"
          placeholder='{"clave": "valor"}'
          rows={12}
          spellCheck={false}
          autoComplete="off"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label="JSON"
          style={{ viewTransitionName: "json-editor" }}
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
          onClick={handleFormat}
          aria-label="Formatear JSON con indentación"
          className="min-h-[44px] cursor-pointer"
        >
          Formatear
        </Button>
        <Button
          variant="outline"
          onClick={handleMinify}
          aria-label="Minificar JSON en una línea"
          className="min-h-[44px] cursor-pointer"
        >
          Minificar
        </Button>
        {canUndo && (
          <Button
            variant="ghost"
            onClick={handleUndo}
            aria-label="Deshacer último cambio"
            className="min-h-[44px] cursor-pointer"
          >
            Deshacer
          </Button>
        )}
        {hasContent && (
          <Button
            variant="ghost"
            onClick={handleCopy}
            disabled={isCopying}
            aria-label={isCopying ? "Copiando…" : "Copiar al portapapeles"}
            className="min-h-[44px] cursor-pointer ml-auto"
          >
            {isCopying ? "Copiando…" : "Copiar"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default JsonFormatter;

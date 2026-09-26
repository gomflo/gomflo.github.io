import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CASE_MODES, convertCase, type CaseMode } from "@/lib/case";
import { CopyButton, labelClass, textareaClass } from "./tool-kit";

const CaseConverter = () => {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<CaseMode>("upper");

  const output = useMemo(() => convertCase(input, mode), [input, mode]);
  const current = CASE_MODES.find((m) => m.id === mode);

  return (
    <div className="tool-view grid gap-5" role="region" aria-label="Convertidor de mayúsculas y minúsculas">
      <section data-reveal className="grid gap-3">
        <label htmlFor="case-input" className={labelClass}>
          Texto
        </label>
        <Textarea
          id="case-input"
          placeholder="Escribe o pega aquí tu texto…"
          rows={6}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={textareaClass}
        />
      </section>

      <section data-reveal style={{ animationDelay: "40ms" }} className="grid gap-3" aria-labelledby="case-modes-label">
        <span id="case-modes-label" className={labelClass}>
          Convertir a
        </span>
        <div className="flex flex-wrap gap-2" role="group" aria-labelledby="case-modes-label">
          {CASE_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              aria-pressed={mode === m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                "min-h-[44px] cursor-pointer rounded-full border px-4 text-sm font-semibold transition-[background-color,color,border-color,scale] duration-150 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 active:scale-[0.97]",
                mode === m.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-card hover:bg-accent"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </section>

      <Card data-reveal style={{ animationDelay: "80ms" }} aria-live="polite">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold">
            Resultado <span className="text-muted-foreground font-code ml-1 text-xs font-normal">{current?.sample}</span>
          </CardTitle>
          <CopyButton value={output} what="el texto convertido" />
        </CardHeader>
        <CardContent>
          <pre className="font-code m-0 min-h-12 text-sm whitespace-pre-wrap break-words">
            {output || <span className="text-muted-foreground">El resultado aparecerá aquí.</span>}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default CaseConverter;

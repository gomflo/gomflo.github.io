import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { diffLines, type DiffLine } from "@/lib/diff";
import { GitCompare } from "lucide-react";

const inputBaseClass =
  "font-code min-h-[44px] w-full rounded-md border-[0.5px] border-solid border-[#333] bg-transparent px-3 py-2 text-xs shadow-xs transition-[color,box-shadow] duration-200 outline-none placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-[#111]/30 focus-visible:border-[#111] dark:bg-input/30 dark:border-[#333] dark:focus-visible:ring-[#111]/30 resize-y min-w-0";

export default function DiffViewer() {
  const [textLeft, setTextLeft] = useState("");
  const [textRight, setTextRight] = useState("");

  const diffResult = useMemo(() => {
    return diffLines(textLeft, textRight);
  }, [textLeft, textRight]);

  const stats = useMemo(() => {
    let add = 0;
    let remove = 0;
    let equal = 0;
    for (const line of diffResult) {
      if (line.type === "add") add++;
      else if (line.type === "remove") remove++;
      else equal++;
    }
    return { add, remove, equal };
  }, [diffResult]);

  return (
    <div
      className="diff-viewer grid gap-8"
      role="region"
      aria-label="Comparar texto o JSON"
    >
      <section
        className="grid gap-6 sm:grid-cols-2"
        aria-labelledby="diff-inputs-heading"
        data-reveal
        style={{ animationDelay: "0ms" }}
      >
        <h2
          id="diff-inputs-heading"
          className="text-muted-foreground font-display text-xs font-medium uppercase tracking-wider sm:col-span-2"
        >
          Bloques a comparar
        </h2>
        <div className="grid gap-2">
          <label htmlFor="diff-text-left" className="text-sm font-medium">
            Texto A (original)
          </label>
          <Textarea
            id="diff-text-left"
            name="diff-text-left"
            placeholder="Pega aquí el primer bloque…"
            value={textLeft}
            onChange={(e) => setTextLeft(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            aria-label="Texto A (original)"
            className={inputBaseClass}
            rows={10}
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="diff-text-right" className="text-sm font-medium">
            Texto B (comparar)
          </label>
          <Textarea
            id="diff-text-right"
            name="diff-text-right"
            placeholder="Pega aquí el segundo bloque…"
            value={textRight}
            onChange={(e) => setTextRight(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            aria-label="Texto B (comparar)"
            className={inputBaseClass}
            rows={10}
          />
        </div>
      </section>

      {diffResult.length > 0 && (
        <Card
          className="border-l-4 border-l-(--diff-accent)"
          data-reveal
          style={{ animationDelay: "120ms" }}
        >
          <CardContent className="pt-6">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wider">
                <GitCompare className="size-4" aria-hidden />
                Diferencias línea por línea
              </span>
              <p
                className="text-muted-foreground text-sm tabular-nums"
                aria-live="polite"
                aria-atomic="true"
              >
                {stats.equal} iguales, {stats.remove} eliminadas, {stats.add} añadidas
              </p>
            </div>
            <div
              className="diff-output overflow-x-auto rounded-md border border-[#333] bg-(--diff-bg) dark:border-[#333]"
              role="figure"
              aria-label="Resultado del diff"
            >
              <pre className="font-code block min-h-[120px] p-3 text-xs leading-relaxed tabular-nums">
                {diffResult.map((line, i) => (
                  <DiffLineRow key={i} line={line} />
                ))}
              </pre>
            </div>
            <p className="sr-only">
              Leyenda: líneas en verde son añadidas, en rojo eliminadas, sin fondo son iguales.
            </p>
          </CardContent>
        </Card>
      )}

      {textLeft === "" && textRight === "" && (
        <p className="text-muted-foreground text-sm" aria-live="polite">
          Escribe o pega texto en ambos bloques para ver las diferencias.
        </p>
      )}
    </div>
  );
}

function DiffLineRow({ line }: { line: DiffLine }) {
  const prefix =
    line.type === "add"
      ? "+ "
      : line.type === "remove"
        ? "- "
        : "  ";
  const leftNum = line.lineLeft != null ? String(line.lineLeft).padStart(4) : "    ";
  const rightNum = line.lineRight != null ? String(line.lineRight).padStart(4) : "    ";
  const lineNum = `${leftNum} ${rightNum}`;

  return (
    <div
      className={`diff-line flex w-full border-l-2 pl-2 ${
        line.type === "add"
          ? "border-l-(--diff-add) bg-(--diff-add-bg)"
          : line.type === "remove"
            ? "border-l-(--diff-remove) bg-(--diff-remove-bg)"
            : "border-l-transparent"
      }`}
    >
      <span className="text-muted-foreground shrink-0 select-none" aria-hidden>
        {lineNum}
      </span>
      <span className="diff-prefix shrink-0 select-none" aria-hidden>
        {prefix}
      </span>
      <span className="min-w-0 break-all whitespace-pre-wrap">
        {line.content || "\u00A0"}
      </span>
    </div>
  );
}

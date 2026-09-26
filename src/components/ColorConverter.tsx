import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  contrastRatio,
  parseColor,
  toHexString,
  toHslString,
  toOklchString,
  toRgbString,
  type Rgba,
} from "@/lib/color";
import { InlineError, ResultRow, inputClass, labelClass } from "./tool-kit";

const WHITE: Rgba = { r: 255, g: 255, b: 255, a: 1 };
const BLACK: Rgba = { r: 0, g: 0, b: 0, a: 1 };

const Verdict = ({ ratio, min, label }: { ratio: number; min: number; label: string }) => {
  const pass = ratio >= min;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
        pass ? "bg-cobalt/15 text-foreground" : "bg-destructive/15 text-destructive"
      )}
    >
      {pass ? "✓" : "✕"} {label}
    </span>
  );
};

const ContrastCard = ({ color, against, name }: { color: Rgba; against: Rgba; name: string }) => {
  const ratio = contrastRatio(color, against);
  const bg = toHexString({ ...color, a: 1 });
  const fg = toHexString(against);
  return (
    <div className="grid gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="grid min-h-20 place-items-center rounded-xl px-3 text-center" style={{ background: bg, color: fg }}>
        <span className="text-lg font-bold">Texto {name}</span>
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold">Contraste con {name}</span>
        <span className="font-code text-sm tabular-nums">{ratio.toFixed(2)}:1</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Verdict ratio={ratio} min={4.5} label="AA texto" />
        <Verdict ratio={ratio} min={7} label="AAA texto" />
        <Verdict ratio={ratio} min={3} label="AA grande" />
      </div>
    </div>
  );
};

const ColorConverter = () => {
  const [input, setInput] = useState("#2340b8");
  const color = useMemo(() => parseColor(input), [input]);
  const [last, setLast] = useState<Rgba>({ r: 35, g: 64, b: 184, a: 1 });
  const shown = color ?? last;

  if (color && (color.r !== last.r || color.g !== last.g || color.b !== last.b || color.a !== last.a)) {
    setLast(color);
  }

  const hex = toHexString(shown);

  return (
    <div className="tool-view grid gap-5" role="region" aria-label="Conversor de colores">
      <section data-reveal className="grid gap-3">
        <label htmlFor="color-input" className={labelClass}>
          Color en HEX, RGB, HSL, OKLCH o nombre CSS
        </label>
        <div className="flex gap-3">
          <label
            className="focus-within:ring-ring/50 relative size-11 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-input shadow-xs focus-within:ring-[3px]"
            style={{ background: hex }}
          >
            <span className="sr-only">Elegir color con el selector</span>
            <input
              type="color"
              value={hex.slice(0, 7)}
              onChange={(e) => setInput(e.target.value)}
              className="absolute inset-0 size-full cursor-pointer opacity-0"
            />
          </label>
          <input
            id="color-input"
            autoComplete="off"
            spellCheck={false}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-invalid={!color}
            placeholder="#2340b8, rgb(35 64 184), tomato…"
            className={cn(inputClass, "text-base")}
          />
        </div>
        {!color && input.trim() && (
          <InlineError>No reconozco ese color. Prueba con #2340b8, rgb(35, 64, 184) o hsl(228, 68%, 43%).</InlineError>
        )}
      </section>

      <section data-reveal style={{ animationDelay: "40ms" }} className="grid gap-4 sm:grid-cols-[minmax(0,14rem)_1fr]">
        <div
          aria-hidden
          className="min-h-36 rounded-2xl border border-border shadow-xs transition-colors duration-200"
          style={{ background: toRgbString(shown) }}
        />
        <div className="grid content-start gap-1" aria-live="polite">
          <ResultRow label="HEX" value={hex} />
          <ResultRow label="RGB" value={toRgbString(shown)} />
          <ResultRow label="HSL" value={toHslString(shown)} />
          <ResultRow label="OKLCH" value={toOklchString(shown)} />
        </div>
      </section>

      <section data-reveal style={{ animationDelay: "80ms" }} className="grid gap-3" aria-labelledby="contrast-heading">
        <h3 id="contrast-heading" className="text-lg font-bold">
          Contraste WCAG
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <ContrastCard color={shown} against={WHITE} name="blanco" />
          <ContrastCard color={shown} against={BLACK} name="negro" />
        </div>
      </section>
    </div>
  );
};

export default ColorConverter;

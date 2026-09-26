import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { uuidV4, uuidV7, uuidV7Date } from "@/lib/random";
import { Checkbox, CopyButton, Segmented, inputClass, labelClass, textareaClass } from "./tool-kit";

type Version = "v4" | "v7";

const MAX_COUNT = 500;

const UuidGenerator = () => {
  const [version, setVersion] = useState<Version>("v4");
  const [count, setCount] = useState(1);
  const [uppercase, setUppercase] = useState(false);
  const [noHyphens, setNoHyphens] = useState(false);
  const [braces, setBraces] = useState(false);
  const [raw, setRaw] = useState<string[]>([]);

  const regenerate = useCallback(() => {
    const make = version === "v4" ? uuidV4 : uuidV7;
    setRaw(Array.from({ length: count }, () => make()));
  }, [version, count]);

  useEffect(regenerate, [regenerate]);

  const formatted = useMemo(
    () =>
      raw.map((id) => {
        let out = noHyphens ? id.replace(/-/g, "") : id;
        if (uppercase) out = out.toUpperCase();
        return braces ? `{${out}}` : out;
      }),
    [raw, uppercase, noHyphens, braces]
  );

  const text = formatted.join("\n");
  const embeddedDate = version === "v7" && raw[0] ? uuidV7Date(raw[0]) : null;

  return (
    <div className="tool-view grid gap-5" role="region" aria-label="Generador de UUID">
      <section data-reveal className="flex flex-wrap items-end gap-4" aria-label="Opciones">
        <div className="grid gap-2">
          <span className={labelClass}>Versión</span>
          <Segmented
            label="Versión de UUID"
            value={version}
            onChange={setVersion}
            options={[
              { value: "v4", label: "v4 aleatorio" },
              { value: "v7", label: "v7 ordenado por fecha" },
            ]}
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="uuid-count" className={labelClass}>
            Cantidad
          </label>
          <input
            id="uuid-count"
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_COUNT}
            value={count}
            onChange={(e) => {
              const n = Math.round(Number(e.target.value));
              setCount(Number.isFinite(n) ? Math.min(MAX_COUNT, Math.max(1, n)) : 1);
            }}
            className={cn(inputClass, "w-24")}
          />
        </div>
      </section>

      <div data-reveal style={{ animationDelay: "40ms" }} className="flex flex-wrap gap-x-6">
        <Checkbox label="Mayúsculas" checked={uppercase} onChange={setUppercase} />
        <Checkbox label="Sin guiones" checked={noHyphens} onChange={setNoHyphens} />
        <Checkbox label="Entre llaves {} (GUID)" checked={braces} onChange={setBraces} />
      </div>

      <section data-reveal style={{ animationDelay: "80ms" }} className="grid gap-3" aria-label="Resultado">
        {count === 1 ? (
          <output
            aria-live="polite"
            className="font-code rounded-xl border border-input bg-card px-4 py-4 text-base break-all select-all sm:text-lg"
          >
            {text}
          </output>
        ) : (
          <Textarea
            readOnly
            value={text}
            rows={Math.min(count, 12)}
            aria-label={`${count} UUID generados`}
            className={textareaClass}
          />
        )}
        {embeddedDate && (
          <p className="text-muted-foreground text-sm">
            El primer UUID lleva la fecha {embeddedDate.toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "medium" })}.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <CopyButton value={text} what={count === 1 ? "el UUID" : `${count} UUID`} variant="default" size="default" />
          <Button type="button" variant="outline" onClick={regenerate} className="min-h-[44px] cursor-pointer">
            <RefreshCw aria-hidden />
            Generar {count === 1 ? "otro" : "otros"}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default UuidGenerator;

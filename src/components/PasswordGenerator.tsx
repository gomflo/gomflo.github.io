import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  CHARSETS,
  generatePassword,
  passwordEntropy,
  strengthLabel,
  type CharsetId,
  type PasswordOptions,
} from "@/lib/random";
import { Checkbox, CopyButton, inputClass, labelClass } from "./tool-kit";

const SETS: { id: CharsetId; label: string }[] = [
  { id: "upper", label: "Mayúsculas" },
  { id: "lower", label: "Minúsculas" },
  { id: "digits", label: "Números" },
  { id: "symbols", label: "Símbolos" },
];

const MIN = 6;
const MAX = 64;

const STRENGTH_COLORS = ["", "bg-destructive", "bg-yolk", "bg-cobalt", "bg-cobalt"];

const PasswordGenerator = () => {
  const [length, setLength] = useState(16);
  const [sets, setSets] = useState<CharsetId[]>(["upper", "lower", "digits", "symbols"]);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [password, setPassword] = useState("");

  const options: PasswordOptions = useMemo(
    () => ({ length, sets, excludeAmbiguous }),
    [length, sets, excludeAmbiguous]
  );

  const regenerate = useCallback(() => setPassword(generatePassword(options)), [options]);

  // Se genera en el cliente para que la contraseña nunca exista en el HTML.
  useEffect(regenerate, [regenerate]);

  const bits = passwordEntropy(options);
  const strength = strengthLabel(bits);

  const toggleSet = (id: CharsetId, on: boolean) =>
    setSets((prev) => (on ? SETS.map((s) => s.id).filter((s) => prev.includes(s) || s === id) : prev.filter((s) => s !== id)));

  const setLengthClamped = (value: number) =>
    setLength(Number.isFinite(value) ? Math.min(MAX, Math.max(MIN, Math.round(value))) : MIN);

  return (
    <div className="tool-view grid gap-5" role="region" aria-label="Generador de contraseñas">
      <Card data-reveal className="gap-4">
        <CardContent className="grid gap-4">
          <output
            aria-live="polite"
            aria-label="Contraseña generada"
            className="font-code min-h-[3.5rem] rounded-xl bg-muted px-4 py-3 text-lg leading-relaxed break-all select-all sm:text-xl"
          >
            {password}
          </output>

          <div className="grid gap-2">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-semibold">{strength.label}</span>
              <span className="text-muted-foreground tabular-nums">≈ {Math.round(bits)} bits de entropía</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5" aria-hidden>
              {[1, 2, 3, 4].map((level) => (
                <span
                  key={level}
                  className={cn(
                    "h-1.5 rounded-full transition-colors duration-300",
                    level <= strength.level ? STRENGTH_COLORS[strength.level] : "bg-muted"
                  )}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <CopyButton value={password} what="la contraseña" variant="default" size="default" />
            <Button type="button" variant="outline" onClick={regenerate} className="min-h-[44px] cursor-pointer">
              <RefreshCw aria-hidden />
              Generar otra
            </Button>
          </div>
        </CardContent>
      </Card>

      <section data-reveal style={{ animationDelay: "80ms" }} className="grid gap-5 sm:grid-cols-2" aria-label="Opciones">
        <div className="grid content-start gap-3">
          <label htmlFor="password-length" className={labelClass}>
            Longitud
          </label>
          <div className="flex items-center gap-3">
            <input
              id="password-length-range"
              type="range"
              min={MIN}
              max={MAX}
              value={length}
              onChange={(e) => setLengthClamped(Number(e.target.value))}
              aria-label="Longitud de la contraseña"
              className="h-11 min-w-0 flex-1 cursor-pointer accent-(--cobalt)"
            />
            <input
              id="password-length"
              type="number"
              inputMode="numeric"
              min={MIN}
              max={MAX}
              value={length}
              onChange={(e) => setLengthClamped(Number(e.target.value))}
              className={cn(inputClass, "w-20 text-center")}
            />
          </div>
        </div>

        <fieldset className="grid gap-0">
          <legend className={cn(labelClass, "mb-1")}>Incluir</legend>
          <div className="grid grid-cols-2 gap-x-4">
            {SETS.map(({ id, label }) => (
              <Checkbox
                key={id}
                label={label}
                hint={CHARSETS[id].slice(0, 3)}
                checked={sets.includes(id)}
                disabled={sets.length === 1 && sets.includes(id)}
                onChange={(on) => toggleSet(id, on)}
              />
            ))}
          </div>
          <Checkbox
            label="Evitar caracteres parecidos"
            hint="O 0 l 1 I"
            checked={excludeAmbiguous}
            onChange={setExcludeAmbiguous}
          />
        </fieldset>
      </section>
    </div>
  );
};

export default PasswordGenerator;

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  parseCron,
  buildCron,
  explainCron,
  cronToHuman,
  CRON_PRESETS,
  type CronFields,
} from "@/lib/cron";
import { toast } from "sonner";
import { Copy, Clock } from "lucide-react";

const inputBaseClass =
  "font-code min-h-[44px] w-full rounded-md border-[0.5px] border-solid border-[#333] bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] duration-200 outline-none placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-[#111]/30 focus-visible:border-[#111] dark:bg-input/30 dark:border-[#333] dark:focus-visible:ring-[#111]/30";

const INITIAL_FIELDS: CronFields = {
  minute: "0",
  hour: "0",
  dayOfMonth: "*",
  month: "*",
  dayOfWeek: "*",
};


function CopyButton({
  text,
  label,
}: {
  text: string;
  label: string;
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Copiado al portapapeles");
      })
      .catch(() => {
        toast.error("No se pudo copiar al portapapeles");
      });
  }, [text]);
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleCopy}
      aria-label={label}
      className="shrink-0"
    >
      <Copy className="size-4" aria-hidden />
      {copied ? "Copiado" : "Copiar"}
    </Button>
  );
}

export default function CronConverter() {
  const [fields, setFields] = useState<CronFields>(INITIAL_FIELDS);
  const [rawExpression, setRawExpression] = useState("0 0 * * *");
  const [explainInput, setExplainInput] = useState("");

  const cronExpression = useMemo(() => buildCron(fields), [fields]);
  const humanExplanation = useMemo(
    () => (parseCron(cronExpression) ? cronToHuman(fields) : ""),
    [cronExpression, fields]
  );
  const explainResult = useMemo(() => {
    if (!explainInput.trim()) return null;
    return explainCron(explainInput.trim());
  }, [explainInput]);

  const setField = useCallback((key: keyof CronFields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  }, []);

  const applyPreset = useCallback((expr: string) => {
    const parsed = parseCron(expr);
    if (parsed) {
      setFields(parsed);
      setRawExpression(expr);
    }
  }, []);

  return (
    <div
      className="cron-converter grid gap-8"
      role="region"
      aria-label="Conversor de expresiones Cron"
    >
      <Tabs defaultValue="build" className="w-full">
        <TabsList
          className="w-full sm:w-auto"
          aria-label="Modo: construir expresión o explicar expresión"
        >
          <TabsTrigger value="build" id="tab-build">
            Construir
          </TabsTrigger>
          <TabsTrigger value="explain" id="tab-explain">
            Explicar expresión
          </TabsTrigger>
        </TabsList>

        <TabsContent value="build" aria-labelledby="tab-build">
          <section
            className="grid gap-6"
            aria-labelledby="cron-presets-heading"
            data-reveal
            style={{ animationDelay: "0ms" }}
          >
            <h2 id="cron-presets-heading" className="text-muted-foreground font-display text-xs font-medium uppercase tracking-wider">
              Plantillas
            </h2>
            <Select
              value={
                CRON_PRESETS.some((p) => p.expr === cronExpression)
                  ? cronExpression
                  : "__custom__"
              }
              onValueChange={(v) => {
                if (v && v !== "__custom__") applyPreset(v);
              }}
            >
              <SelectTrigger
                id="cron-preset"
                aria-label="Plantilla de expresión cron"
                className="min-h-[44px] w-full min-w-0 font-code sm:w-[320px]"
              >
                <SelectValue placeholder="Elegir plantilla…" />
              </SelectTrigger>
              <SelectContent>
                {!CRON_PRESETS.some((p) => p.expr === cronExpression) && (
                  <SelectItem value="__custom__">
                    Personalizado — {cronExpression}
                  </SelectItem>
                )}
                {CRON_PRESETS.map(({ label, expr }) => (
                  <SelectItem key={expr} value={expr}>
                    {label} — {expr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>

          <section
            className="grid gap-4 pt-10"
            aria-labelledby="cron-fields-heading"
            data-reveal
            style={{ animationDelay: "60ms" }}
          >
            <h2 id="cron-fields-heading" className="text-muted-foreground font-display text-xs font-medium uppercase tracking-wider">
              Campos (minuto hora día-mes mes día-semana)
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="grid gap-2">
                <label htmlFor="cron-minute" className="text-sm font-medium">
                  Minuto
                </label>
                <input
                  id="cron-minute"
                  name="cron-minute"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  spellCheck={false}
                  value={fields.minute}
                  onChange={(e) => setField("minute", e.target.value.replace(/\s/g, ""))}
                  placeholder="0-59 o *"
                  aria-label="Minuto (0-59 o *)"
                  className={inputBaseClass}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="cron-hour" className="text-sm font-medium">
                  Hora
                </label>
                <input
                  id="cron-hour"
                  name="cron-hour"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  spellCheck={false}
                  value={fields.hour}
                  onChange={(e) => setField("hour", e.target.value.replace(/\s/g, ""))}
                  placeholder="0-23 o *"
                  aria-label="Hora (0-23 o *)"
                  className={inputBaseClass}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="cron-dom" className="text-sm font-medium">
                  Día del mes
                </label>
                <input
                  id="cron-dom"
                  name="cron-dom"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  spellCheck={false}
                  value={fields.dayOfMonth}
                  onChange={(e) => setField("dayOfMonth", e.target.value.replace(/\s/g, ""))}
                  placeholder="1-31 o *"
                  aria-label="Día del mes (1-31 o *)"
                  className={inputBaseClass}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="cron-month" className="text-sm font-medium">
                  Mes
                </label>
                <input
                  id="cron-month"
                  name="cron-month"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  spellCheck={false}
                  value={fields.month}
                  onChange={(e) => setField("month", e.target.value.replace(/\s/g, ""))}
                  placeholder="1-12 o *"
                  aria-label="Mes (1-12 o *)"
                  className={inputBaseClass}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="cron-dow" className="text-sm font-medium">
                  Día de la semana
                </label>
                <input
                  id="cron-dow"
                  name="cron-dow"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  spellCheck={false}
                  value={fields.dayOfWeek}
                  onChange={(e) => setField("dayOfWeek", e.target.value.replace(/\s/g, ""))}
                  placeholder="0-7 (0=dom) o *"
                  aria-label="Día de la semana (0-7, 0=domingo)"
                  className={inputBaseClass}
                />
              </div>
            </div>
          </section>

          <Card
            className="mt-12 w-full border-l-4 border-l-(--json-result-accent)"
            data-reveal
            style={{ animationDelay: "120ms" }}
          >
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wider">
                    Expresión cron
                  </p>
                  <p
                    className="font-code text-lg tabular-nums"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {parseCron(cronExpression) ? cronExpression : "Expresión inválida"}
                  </p>
                </div>
                <CopyButton text={cronExpression} label="Copiar expresión cron" />
              </div>
              {parseCron(cronExpression) && (
                <div className="mt-4 flex items-start gap-3 rounded-md bg-muted/50 p-3">
                  <Clock className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                  <p className="text-sm leading-relaxed" aria-live="polite">
                    {humanExplanation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="explain" aria-labelledby="tab-explain">
          <section
            className="grid gap-4"
            aria-label="Pega una expresión cron para ver su explicación"
            data-reveal
            style={{ animationDelay: "0ms" }}
          >
            <label htmlFor="cron-explain-input" className="text-sm font-medium">
              Expresión cron (5 campos)
            </label>
            <Textarea
              id="cron-explain-input"
              name="cron-explain-input"
              placeholder="Ej: 0 9 * * 1-5…"
              rows={3}
              spellCheck={false}
              autoComplete="off"
              value={explainInput}
              onChange={(e) => setExplainInput(e.target.value)}
              aria-label="Expresión cron a explicar"
              className="font-code min-w-0 resize-y text-sm"
            />
            <p className="text-muted-foreground text-sm">
              Formato: minuto hora día-mes mes día-semana (ej. 0 0 * * *)
            </p>
          </section>

          {explainInput.trim() && (
            <Card
              className="border-l-4 border-l-(--json-result-accent)"
              data-reveal
              style={{ animationDelay: "80ms" }}
            >
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wider">
                  Explicación
                </p>
                <p
                  className="text-sm leading-relaxed"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {explainResult}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useMemo, useState } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { analizarClabe, formatearClabe, limpiarClabe } from "@/lib/clabe";
import { CopyButton, InlineError, ResultRow, inputClass, labelClass } from "./tool-kit";

const SEGMENTS = [
  { key: "banco", label: "Banco", from: 0, to: 3, className: "bg-primary text-primary-foreground" },
  { key: "plaza", label: "Plaza", from: 3, to: 6, className: "bg-muted" },
  { key: "cuenta", label: "Cuenta", from: 6, to: 17, className: "bg-muted/60" },
  { key: "control", label: "Control", from: 17, to: 18, className: "bg-yolk text-(--yolk-ink)" },
] as const;

const ClabeValidator = () => {
  const [input, setInput] = useState("");

  const digits = limpiarClabe(input);
  const result = useMemo(() => {
    if (!digits) return null;
    try {
      return { data: analizarClabe(input), error: "" };
    } catch (e) {
      // Mientras se escribe no hace falta regañar: solo si ya sobran dígitos o hay letras.
      const message = e instanceof Error ? e.message : "No se pudo leer la CLABE.";
      const premature = /^\d+$/.test(digits) && digits.length < 17;
      return { data: null, error: premature ? "" : message };
    }
  }, [input, digits]);

  const data = result?.data ?? null;
  const controlOk = data ? Number(data.control) === data.controlEsperado : false;

  let status: { ok: boolean; title: string; detail: string } | null = null;
  if (data) {
    if (!data.completa) {
      status = {
        ok: true,
        title: `El dígito de control es ${data.controlEsperado}`,
        detail: "Escribiste 17 dígitos; calculamos el último para completar la CLABE.",
      };
    } else if (!controlOk) {
      status = {
        ok: false,
        title: "La CLABE no es válida",
        detail: `El último dígito debería ser ${data.controlEsperado} y es ${data.control}. Revisa que no haya un dígito cambiado o dos invertidos.`,
      };
    } else if (!data.banco) {
      status = {
        ok: false,
        title: "El banco no existe",
        detail: `El dígito de control cuadra, pero el código ${data.codigoBanco} no corresponde a ninguna institución de SPEI.`,
      };
    } else {
      status = { ok: true, title: "La CLABE es válida", detail: `Pertenece a ${data.banco}.` };
    }
  }

  const StatusIcon = status?.ok ? CircleCheck : CircleAlert;

  return (
    <div className="tool-view grid gap-5" role="region" aria-label="Validar CLABE interbancaria">
      <section data-reveal className="grid gap-3">
        <label htmlFor="clabe-input" className={labelClass}>
          CLABE de 18 dígitos
        </label>
        <input
          id="clabe-input"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          maxLength={24}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-invalid={Boolean(result?.error) || (status ? !status.ok : false)}
          aria-describedby="clabe-hint"
          placeholder="012 180 00118359719 8"
          className={cn(inputClass, "text-lg tracking-wider tabular-nums")}
        />
        <p id="clabe-hint" className="text-muted-foreground m-0 text-sm">
          {digits && digits.length < 17 && /^\d+$/.test(digits)
            ? `Llevas ${digits.length} de 18 dígitos.`
            : "Puedes pegarla con espacios o guiones. Con 17 dígitos calculamos el de control."}
        </p>
        {result?.error && <InlineError>{result.error}</InlineError>}
      </section>

      {data && status && (
        <Card data-reveal style={{ animationDelay: "40ms" }} aria-live="polite">
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <StatusIcon
                aria-hidden
                className={cn("mt-0.5 size-6 shrink-0", status.ok ? "text-cobalt" : "text-destructive")}
              />
              <div className="grid gap-1">
                <CardTitle className="text-lg font-bold">{status.title}</CardTitle>
                <p className="text-muted-foreground m-0 text-sm text-pretty">{status.detail}</p>
              </div>
            </div>
            <CopyButton value={data.digitos} what="la CLABE" />
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex flex-wrap gap-1.5" aria-hidden>
              {SEGMENTS.map((segment) => (
                <div key={segment.key} className="grid gap-1">
                  <span
                    className={cn(
                      "font-code rounded-lg px-2 py-1.5 text-base tracking-wider tabular-nums sm:text-lg",
                      segment.className,
                      segment.key === "control" && !controlOk && "bg-destructive text-white"
                    )}
                  >
                    {data.digitos.slice(segment.from, segment.to)}
                  </span>
                  <span className="text-muted-foreground text-xs font-semibold">{segment.label}</span>
                </div>
              ))}
            </div>
            <div className="grid gap-1">
              <ResultRow label="Banco" value={data.banco ?? "Desconocido"} hint={`Código ${data.codigoBanco}`} highlight />
              <ResultRow label="Plaza" value={data.plaza} />
              <ResultRow label="Número de cuenta" value={data.cuenta} />
              <ResultRow label="Dígito de control" value={data.control} hint={`Esperado: ${data.controlEsperado}`} />
              <ResultRow label="CLABE con espacios" value={formatearClabe(data.digitos)} />
            </div>
          </CardContent>
        </Card>
      )}

      <p data-reveal style={{ animationDelay: "80ms" }} className="text-muted-foreground m-0 text-sm text-pretty">
        La validación se hace en tu navegador: la CLABE no se envía a ningún servidor. Que la CLABE sea válida no
        garantiza que la cuenta exista ni a nombre de quién está; eso solo lo confirma el banco al hacer la transferencia.
      </p>
    </div>
  );
};

export default ClabeValidator;

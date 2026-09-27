import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  RETENCIONES_ISR,
  TASAS,
  calcularIva,
  leerMonto,
  type OpcionesIva,
  type RetencionIsr,
  type Tasa,
} from "@/lib/iva";
import { Checkbox, CopyButton, InlineError, ResultRow, Segmented, inputClass, labelClass } from "./tool-kit";

const money = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
const fmt = (n: number) => money.format(n);

// Orden explícito: las claves numéricas de un objeto se enumeran antes que las demás.
const TASAS_ORDEN: Tasa[] = ["16", "8"];
const ISR_ORDEN: RetencionIsr[] = ["ninguna", "10", "1.25"];

const IvaCalculator = () => {
  const [input, setInput] = useState("1000");
  const [modo, setModo] = useState<OpcionesIva["modo"]>("agregar");
  const [tasa, setTasa] = useState<Tasa>("16");
  const [retenerIva, setRetenerIva] = useState(false);
  const [retencionIsr, setRetencionIsr] = useState<RetencionIsr>("ninguna");

  const monto = leerMonto(input);
  const r = useMemo(
    () => (monto === null ? null : calcularIva(monto, { modo, tasa, retenerIva, retencionIsr })),
    [monto, modo, tasa, retenerIva, retencionIsr]
  );
  const conRetenciones = retenerIva || retencionIsr !== "ninguna";
  const tasaLabel = `${tasa} %`;

  return (
    <div className="tool-view grid gap-5" role="region" aria-label="Calculadora de IVA">
      <div data-reveal className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Segmented
          label="Qué quieres calcular"
          value={modo}
          onChange={setModo}
          options={[
            { value: "agregar", label: "Agregar IVA" },
            { value: "quitar", label: "Quitar IVA" },
          ]}
        />
        <Segmented
          label="Tasa de IVA"
          value={tasa}
          onChange={setTasa}
          options={TASAS_ORDEN.map((t) => ({ value: t, label: TASAS[t].nombre }))}
        />
      </div>

      <section data-reveal style={{ animationDelay: "40ms" }} className="grid gap-3">
        <label htmlFor="iva-input" className={labelClass}>
          {modo === "agregar" ? "Precio sin IVA (subtotal)" : "Precio con IVA incluido"}
        </label>
        <input
          id="iva-input"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-invalid={Boolean(input.trim() && monto === null)}
          placeholder="1,000.00"
          className={cn(inputClass, "text-lg tabular-nums")}
        />
        {input.trim() && monto === null && <InlineError>Escribe un monto como 1500 o 1,500.00.</InlineError>}
      </section>

      <fieldset data-reveal style={{ animationDelay: "80ms" }} className="m-0 grid gap-2 border-0 p-0">
        <legend className={cn(labelClass, "mb-1")}>Retenciones (factura de persona física a persona moral)</legend>
        <Checkbox label="Retener IVA" hint="2/3 partes del IVA" checked={retenerIva} onChange={setRetenerIva} />
        <Segmented
          label="Retención de ISR"
          value={retencionIsr}
          onChange={setRetencionIsr}
          options={ISR_ORDEN.map((k) => ({
            value: k,
            label: RETENCIONES_ISR[k].nombre,
          }))}
        />
      </fieldset>

      {r && (
        <Card data-reveal style={{ animationDelay: "120ms" }} aria-live="polite">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
            <div className="grid gap-1">
              <CardTitle className="text-muted-foreground text-sm font-semibold">
                {conRetenciones ? "Total a pagar" : modo === "agregar" ? "Total con IVA" : "Subtotal sin IVA"}
              </CardTitle>
              <p className="m-0 text-3xl font-bold tabular-nums sm:text-4xl">
                {fmt(conRetenciones ? r.neto : modo === "agregar" ? r.total : r.subtotal)}
              </p>
            </div>
            <CopyButton
              value={fmt(conRetenciones ? r.neto : modo === "agregar" ? r.total : r.subtotal)}
              what="el resultado"
              variant="default"
            />
          </CardHeader>
          <CardContent className="grid gap-1">
            <ResultRow label="Subtotal" value={fmt(r.subtotal)} />
            <ResultRow label={`IVA ${tasaLabel}`} value={fmt(r.iva)} />
            <ResultRow label="Total con IVA" value={fmt(r.total)} highlight={!conRetenciones} />
            {retenerIva && <ResultRow label="IVA retenido" hint="10.6667 % del subtotal" value={`−${fmt(r.ivaRetenido)}`} />}
            {retencionIsr !== "ninguna" && (
              <ResultRow label="ISR retenido" hint={`${retencionIsr} % del subtotal`} value={`−${fmt(r.isrRetenido)}`} />
            )}
            {conRetenciones && <ResultRow label="Total a pagar" value={fmt(r.neto)} highlight />}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IvaCalculator;

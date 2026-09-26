/**
 * Piezas compartidas por las herramientas: copiar, filas de resultado,
 * controles segmentados, casillas y etiquetas.
 */
import { useCallback, useId, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const inputClass =
  "font-code min-h-[44px] w-full rounded-xl border border-solid border-input bg-card px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] duration-200 outline-none placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring aria-invalid:border-destructive";

export const textareaClass =
  "font-code min-w-0 resize-y text-sm transition-[border-color,box-shadow] duration-200";

export const labelClass = "text-muted-foreground text-sm font-semibold";

export const copyToClipboard = async (text: string, message = "Copiado al portapapeles") => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(message);
    return true;
  } catch {
    toast.error("No se pudo copiar al portapapeles");
    return false;
  }
};

/** Botón de copiar que confirma con una palomita durante un momento. */
export const CopyButton = ({
  value,
  label = "Copiar",
  what,
  variant = "outline",
  size = "sm",
  className,
}: {
  value: string;
  label?: string;
  /** Qué se copia, para el nombre accesible y el aviso ("el UUID"). */
  what?: string;
  variant?: "outline" | "default" | "ghost";
  size?: "sm" | "default" | "icon-sm";
  className?: string;
}) => {
  const [copied, setCopied] = useState(false);

  const handleClick = useCallback(async () => {
    if (!value) return;
    const ok = await copyToClipboard(value, what ? `Copiaste ${what}` : undefined);
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }, [value, what]);

  const Icon = copied ? Check : Copy;
  const isIcon = size === "icon-sm";

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={!value}
      aria-label={what ? `Copiar ${what}` : label}
      className={cn("min-h-[44px] cursor-pointer", isIcon && "min-w-[44px]", className)}
    >
      <Icon aria-hidden className={cn("transition-transform duration-200", copied && "scale-110")} />
      {!isIcon && (copied ? "Copiado" : label)}
    </Button>
  );
};

/** Una fila "etiqueta · valor · copiar" para resultados cortos. */
export const ResultRow = ({
  label,
  value,
  hint,
  highlight,
}: {
  label: string;
  value: string;
  hint?: ReactNode;
  highlight?: boolean;
}) => (
  <div
    className={cn(
      "grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 rounded-xl px-3 py-2.5 transition-colors duration-200 sm:grid-cols-[9rem_1fr_auto]",
      highlight ? "bg-yolk/25" : "odd:bg-muted/60"
    )}
  >
    <span className="text-muted-foreground col-span-2 text-sm font-semibold sm:col-span-1">
      {label}
      {hint && <span className="block text-xs font-normal">{hint}</span>}
    </span>
    <code className="font-code min-w-0 text-sm break-all">{value || "—"}</code>
    <CopyButton value={value} what={label} size="icon-sm" variant="ghost" />
  </div>
);

/** Grupo de opciones excluyentes con aspecto de píldora. */
export const Segmented = <T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) => {
  const name = useId();
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("bg-muted inline-flex flex-wrap gap-1 rounded-3xl p-1", className)}
    >
      {options.map((option) => (
        <label key={option.value} className="relative cursor-pointer">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="peer sr-only"
          />
          <span className="text-foreground/70 hover:text-foreground peer-checked:bg-card peer-checked:text-foreground peer-focus-visible:ring-ring/50 flex min-h-9 items-center rounded-full px-4 text-sm font-semibold transition-[background-color,color,box-shadow] duration-200 peer-checked:shadow-sm peer-focus-visible:ring-[3px]">
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
};

/** Casilla con etiqueta y área táctil de 44px. */
export const Checkbox = ({
  label,
  checked,
  onChange,
  disabled,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  hint?: string;
}) => (
  <label
    className={cn(
      "flex min-h-[44px] cursor-pointer items-center gap-3 text-sm font-medium",
      disabled && "cursor-not-allowed opacity-60"
    )}
  >
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
      className="size-[1.125rem] shrink-0 cursor-pointer accent-(--cobalt) disabled:cursor-not-allowed"
    />
    <span>
      {label}
      {hint && <span className="text-muted-foreground font-code ml-2 text-xs">{hint}</span>}
    </span>
  </label>
);

/** Mensaje de error en línea, anunciado a lectores de pantalla. */
export const InlineError = ({ children }: { children: ReactNode }) => (
  <p role="alert" className="text-destructive text-sm font-medium">
    {children}
  </p>
);

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

type Base64Mode = "base64-to-file" | "file-to-base64";

const MIME_TO_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "application/pdf": "pdf",
  "text/plain": "txt",
  "application/json": "json",
};

type ParsedBase64 = {
  base64: string;
  mime: string | null;
};

const parseBase64Input = (input: string): ParsedBase64 | null => {
  const trimmed = input.trim().replace(/\s/g, "");
  if (!trimmed) return null;

  if (trimmed.startsWith("data:")) {
    const commaIndex = trimmed.indexOf(",");
    if (commaIndex === -1) return null;
    const header = trimmed.slice(0, commaIndex);
    const base64 = trimmed.slice(commaIndex + 1);
    const mimeMatch = header.match(/^data:([^;]+)/);
    const mime = mimeMatch ? mimeMatch[1].trim() : null;
    return { base64, mime };
  }

  return { base64: trimmed, mime: null };
};

const getDefaultDownloadFilename = (mime: string | null): string => {
  if (mime && MIME_TO_EXT[mime]) {
    return `archivo.${MIME_TO_EXT[mime]}`;
  }
  return "descarga.bin";
};

const Base64FileConverter = () => {
  const [mode, setMode] = useState<Base64Mode>("base64-to-file");
  const [fileToBase64Result, setFileToBase64Result] = useState("");
  const [base64ToFileInput, setBase64ToFileInput] = useState("");
  const [downloadFilename, setDownloadFilename] = useState("");
  const [isCopying, setIsCopying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleModeBase64ToFile = () => setMode("base64-to-file");
  const handleModeFileToBase64 = () => setMode("file-to-base64");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setFileToBase64Result("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      setFileToBase64Result(typeof result === "string" ? result : "");
    };
    reader.onerror = () => {
      toast.error("No se pudo leer el archivo");
      setFileToBase64Result("");
    };
    reader.readAsDataURL(file);
  };

  const handleCopyBase64 = async () => {
    if (!fileToBase64Result) return;
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(fileToBase64Result);
      toast.success("Copiado al portapapeles");
    } catch {
      toast.error("No se pudo copiar al portapapeles");
    } finally {
      setIsCopying(false);
    }
  };

  const handleDownload = () => {
    const parsed = parseBase64Input(base64ToFileInput);
    if (!parsed) {
      toast.error("Pega una cadena Base64 o una URL data:");
      return;
    }

    const { base64, mime } = parsed;
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(padded)) {
      toast.error("La cadena Base64 no es válida");
      return;
    }

    try {
      const binary = atob(padded);
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      const type = mime ?? "application/octet-stream";
      const blob = new Blob([bytes], { type });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        downloadFilename.trim() || getDefaultDownloadFilename(mime);
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Descarga iniciada");
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      toast.error(`Error al descargar: ${err.message}`);
    }
  };

  const handleBase64InputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setBase64ToFileInput(e.target.value);
    const parsed = parseBase64Input(e.target.value);
    if (parsed?.mime && !downloadFilename) {
      const suggested = getDefaultDownloadFilename(parsed.mime);
      setDownloadFilename(suggested);
    }
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  return (
    <div
      className="base64-converter grid gap-8"
      role="region"
      aria-label="Conversor Base64 y archivo"
    >
      <div
        className="flex flex-wrap gap-2"
        data-reveal
        role="group"
        aria-label="Modo de conversión"
        style={{ animationDelay: "0ms" }}
      >
        <Button
          type="button"
          variant={mode === "base64-to-file" ? "default" : "outline"}
          size="sm"
          onClick={handleModeBase64ToFile}
          aria-label="Base64 a Archivo"
          aria-pressed={mode === "base64-to-file"}
          className="min-h-[44px] cursor-pointer"
        >
          Base64 a Archivo
        </Button>
        <Button
          type="button"
          variant={mode === "file-to-base64" ? "default" : "outline"}
          size="sm"
          onClick={handleModeFileToBase64}
          aria-label="Archivo a Base64"
          aria-pressed={mode === "file-to-base64"}
          className="min-h-[44px] cursor-pointer"
        >
          Archivo a Base64
        </Button>
      </div>

      {mode === "base64-to-file" && (
        <Card
          data-reveal
          style={{ animationDelay: "80ms" }}
          className="transition-shadow duration-200 focus-within:ring-2 focus-within:ring-(--json-result-accent)/20 focus-within:ring-offset-2"
        >
          <CardContent className="pt-6 space-y-4">
            <div className="grid gap-3">
              <label
                htmlFor="base64-to-file-input"
                className="text-muted-foreground font-display text-xs font-medium uppercase tracking-wider"
              >
                Base64 o URL data:
              </label>
              <Textarea
                id="base64-to-file-input"
                name="base64-to-file-input"
                placeholder="Pega aquí Base64 o una URL data: (ej. data:image/png;base64,…)"
                rows={8}
                spellCheck={false}
                autoComplete="off"
                value={base64ToFileInput}
                onChange={handleBase64InputChange}
                aria-label="Base64 o URL data: para convertir a archivo"
                className="font-code min-w-0 max-h-80 resize-y text-sm transition-[border-color,box-shadow] duration-200 focus-visible:ring-(--json-result-accent)/25"
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label
                htmlFor="download-filename"
                className="text-sm text-muted-foreground"
              >
                Nombre del archivo (opcional):
              </label>
              <input
                id="download-filename"
                name="download-filename"
                type="text"
                autoComplete="off"
                value={downloadFilename}
                onChange={(e) => setDownloadFilename(e.target.value)}
                placeholder="archivo.png"
                className="flex h-10 min-h-[44px] w-full max-w-xs rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[border-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Nombre del archivo a descargar"
              />
            </div>
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={!base64ToFileInput.trim()}
              aria-label="Descargar archivo desde Base64"
              className="min-h-[44px] cursor-pointer hover:border-(--json-result-accent)/50 hover:bg-(--json-result-accent)/5 disabled:opacity-50"
            >
              Descargar archivo
            </Button>
          </CardContent>
        </Card>
      )}

      {mode === "file-to-base64" && (
        <Card
          data-reveal
          style={{ animationDelay: "80ms" }}
          className="transition-shadow duration-200 focus-within:ring-2 focus-within:ring-(--json-result-accent)/20 focus-within:ring-offset-2"
        >
          <CardContent className="pt-6 space-y-4">
            <div data-reveal style={{ animationDelay: "100ms" }}>
              <input
                ref={fileInputRef}
                id="file-to-base64-input"
                type="file"
                onChange={handleFileChange}
                className="sr-only"
                aria-label="Seleccionar archivo para convertir a Base64"
              />
              <label
                htmlFor="file-to-base64-input"
                tabIndex={0}
                role="button"
                onKeyDown={handleLabelKeyDown}
                className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors duration-200 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Elegir archivo para convertir a Base64"
              >
                Elegir archivo
              </label>
            </div>
            {fileToBase64Result && (
              <div
                className="grid gap-3"
                data-reveal
                style={{ animationDelay: "120ms" }}
                aria-live="polite"
              >
                <span className="text-muted-foreground font-display text-xs font-medium uppercase tracking-wider">
                  Resultado Base64
                </span>
                <Textarea
                  id="file-to-base64-output"
                  name="file-to-base64-output"
                  rows={8}
                  spellCheck={false}
                  value={fileToBase64Result}
                  readOnly
                  aria-label="Resultado Base64 del archivo"
                  className="font-code min-w-0 max-h-80 resize-y text-sm wrap-break-word transition-[border-color,box-shadow] duration-200 focus-visible:ring-(--json-result-accent)/25"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyBase64}
                  disabled={isCopying}
                  aria-label={isCopying ? "Copiando…" : "Copiar Base64 al portapapeles"}
                  className="min-h-[44px] min-w-[44px] cursor-pointer disabled:opacity-50"
                >
                  {isCopying ? "Copiando…" : "Copiar"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Base64FileConverter;

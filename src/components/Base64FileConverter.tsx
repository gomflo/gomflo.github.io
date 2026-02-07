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
    try {
      await navigator.clipboard.writeText(fileToBase64Result);
      toast.success("Copiado al portapapeles");
    } catch {
      toast.error("No se pudo copiar al portapapeles");
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
    <div className="space-y-4">
      <div className="flex gap-2" role="group" aria-label="Modo de conversión">
        <Button
          type="button"
          variant={mode === "base64-to-file" ? "default" : "outline"}
          size="sm"
          onClick={handleModeBase64ToFile}
          aria-label="Base64 a Archivo"
        >
          Base64 a Archivo
        </Button>
        <Button
          type="button"
          variant={mode === "file-to-base64" ? "default" : "outline"}
          size="sm"
          onClick={handleModeFileToBase64}
          aria-label="Archivo a Base64"
        >
          Archivo a Base64
        </Button>
      </div>

      {mode === "base64-to-file" && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Textarea
              id="base64-to-file-input"
              placeholder="Pega aquí Base64 o una URL data: (ej. data:image/png;base64,...)"
              rows={8}
              spellCheck={false}
              value={base64ToFileInput}
              onChange={handleBase64InputChange}
              aria-label="Base64 o URL data: para convertir a archivo"
              className="font-code text-sm max-h-80 resize-y"
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label
                htmlFor="download-filename"
                className="text-sm text-muted-foreground"
              >
                Nombre del archivo (opcional):
              </label>
              <input
                id="download-filename"
                type="text"
                value={downloadFilename}
                onChange={(e) => setDownloadFilename(e.target.value)}
                placeholder="archivo.png"
                className="flex h-9 w-full max-w-xs rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Nombre del archivo a descargar"
              />
            </div>
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={!base64ToFileInput.trim()}
              aria-label="Descargar archivo desde Base64"
            >
              Descargar archivo
            </Button>
          </CardContent>
        </Card>
      )}

      {mode === "file-to-base64" && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
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
                className="inline-flex cursor-pointer items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Elegir archivo para convertir a Base64"
              >
                Elegir archivo
              </label>
            </div>
            {fileToBase64Result && (
              <>
                <Textarea
                  id="file-to-base64-output"
                  rows={8}
                  spellCheck={false}
                  value={fileToBase64Result}
                  readOnly
                  aria-label="Resultado Base64 del archivo"
                  className="font-code text-sm max-h-80 resize-y"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyBase64}
                  aria-label="Copiar Base64 al portapapeles"
                >
                  Copiar
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Base64FileConverter;

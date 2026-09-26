import { useEffect, useMemo, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { md5, toHex } from "@/lib/md5";
import { Checkbox, InlineError, ResultRow, Segmented, inputClass, labelClass, textareaClass } from "./tool-kit";

type Source = "text" | "file";
type Algorithm = "MD5" | "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

const ALGORITHMS: Algorithm[] = ["MD5", "SHA-1", "SHA-256", "SHA-384", "SHA-512"];

const digest = async (bytes: Uint8Array<ArrayBuffer>): Promise<Record<Algorithm, string>> => {
  const sha = await Promise.all(
    ALGORITHMS.slice(1).map(async (alg) => toHex(new Uint8Array(await crypto.subtle.digest(alg, bytes))))
  );
  return {
    MD5: md5(bytes),
    "SHA-1": sha[0],
    "SHA-256": sha[1],
    "SHA-384": sha[2],
    "SHA-512": sha[3],
  };
};

const formatSize = (bytes: number) =>
  bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 ** 2
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1024 ** 2).toFixed(1)} MB`;

const HashGenerator = () => {
  const [source, setSource] = useState<Source>("text");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [hashes, setHashes] = useState<Record<Algorithm, string> | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [uppercase, setUppercase] = useState(false);
  const [expected, setExpected] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setError("");
      try {
        if (source === "text") {
          const result = await digest(new TextEncoder().encode(text));
          if (!cancelled) setHashes(result);
        } else if (file) {
          setBusy(true);
          const bytes = new Uint8Array(await file.arrayBuffer());
          const result = await digest(bytes);
          if (!cancelled) setHashes(result);
        } else {
          setHashes(null);
        }
      } catch {
        if (!cancelled) setError("No se pudo leer el archivo. Prueba con uno más pequeño.");
      } finally {
        if (!cancelled) setBusy(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [source, text, file]);

  const target = expected.trim().toLowerCase();
  const match = useMemo(
    () => (hashes && target ? ALGORITHMS.find((alg) => hashes[alg] === target) ?? null : null),
    [hashes, target]
  );

  return (
    <div className="tool-view grid gap-5" role="region" aria-label="Generador de hash">
      <div data-reveal className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <Segmented
          label="Origen"
          value={source}
          onChange={setSource}
          options={[
            { value: "text", label: "Texto" },
            { value: "file", label: "Archivo" },
          ]}
        />
        <Checkbox label="Mayúsculas" checked={uppercase} onChange={setUppercase} />
      </div>

      <section data-reveal style={{ animationDelay: "40ms" }} className="grid gap-3">
        {source === "text" ? (
          <>
            <label htmlFor="hash-input" className={labelClass}>
              Texto
            </label>
            <Textarea
              id="hash-input"
              rows={5}
              spellCheck={false}
              placeholder="Escribe o pega el texto…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className={textareaClass}
            />
          </>
        ) : (
          <>
            <span className={labelClass}>Archivo</span>
            <label
              htmlFor="hash-file"
              className="focus-within:ring-ring/50 flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-input bg-card px-4 py-6 text-center transition-colors duration-200 focus-within:ring-[3px] hover:border-primary"
            >
              <Upload aria-hidden className="text-primary size-6" />
              <span className="text-sm font-semibold">
                {file ? file.name : "Elige un archivo para calcular su checksum"}
              </span>
              <span className="text-muted-foreground text-xs">
                {file ? formatSize(file.size) : "Se lee en tu navegador; no se sube a ningún lado."}
              </span>
              <input
                ref={fileRef}
                id="hash-file"
                type="file"
                className="sr-only"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </>
        )}
        {error && <InlineError>{error}</InlineError>}
      </section>

      <section
        data-reveal
        style={{ animationDelay: "80ms" }}
        className={cn("grid gap-1 transition-opacity duration-200", busy && "opacity-50")}
        aria-live="polite"
        aria-busy={busy}
        aria-label="Hashes"
      >
        {ALGORITHMS.map((alg) => {
          const value = hashes?.[alg] ?? "";
          return (
            <ResultRow
              key={alg}
              label={alg}
              value={uppercase ? value.toUpperCase() : value}
              highlight={match === alg}
              hint={match === alg ? "✓ coincide" : undefined}
            />
          );
        })}
      </section>

      <section data-reveal style={{ animationDelay: "120ms" }} className="grid gap-2">
        <label htmlFor="hash-expected" className={labelClass}>
          Verificar contra un hash conocido
        </label>
        <input
          id="hash-expected"
          spellCheck={false}
          autoComplete="off"
          placeholder="Pega aquí el checksum publicado"
          value={expected}
          onChange={(e) => setExpected(e.target.value)}
          className={inputClass}
        />
        {target && hashes && (
          <p role="status" className={cn("text-sm font-semibold", match ? "text-cobalt" : "text-destructive")}>
            {match ? `Coincide con ${match}. El contenido es idéntico.` : "No coincide con ninguno de los hashes calculados."}
          </p>
        )}
      </section>
    </div>
  );
};

export default HashGenerator;

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ALFABETO, aMorse, deMorse, pareceMorse, secuencia } from "@/lib/morse";
import { CopyButton, Segmented, labelClass, textareaClass } from "./tool-kit";

type Speed = "10" | "15" | "20";

const MorseCode = () => {
  const [input, setInput] = useState("SOS");
  const [speed, setSpeed] = useState<Speed>("15");
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);

  const isMorse = pareceMorse(input);
  const result = useMemo(() => {
    if (!input.trim()) return null;
    return isMorse ? deMorse(input) : aMorse(input);
  }, [input, isMorse]);

  // Siempre se reproduce el morse, venga de la entrada o del resultado.
  const morse = useMemo(() => {
    if (!result) return "";
    return isMorse ? aMorse(result.salida).salida : result.salida;
  }, [result, isMorse]);

  const stop = useCallback(() => {
    ctxRef.current?.close();
    ctxRef.current = null;
    setPlaying(false);
  }, []);

  useEffect(() => stop, [stop]);

  const play = useCallback(() => {
    if (!morse) return;
    stop();
    try {
      const ctx = new AudioContext();
      const unit = 1.2 / Number(speed);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 620;
      gain.gain.value = 0;
      osc.connect(gain).connect(ctx.destination);

      let t = ctx.currentTime + 0.05;
      for (const paso of secuencia(morse)) {
        const dur = paso.unidades * unit;
        if (paso.on) {
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.35, t + 0.006);
          gain.gain.setValueAtTime(0.35, t + dur - 0.006);
          gain.gain.linearRampToValueAtTime(0, t + dur);
        }
        t += dur;
      }
      osc.start();
      osc.stop(t + 0.05);
      osc.onended = () => {
        if (ctxRef.current === ctx) stop();
      };
      ctxRef.current = ctx;
      setPlaying(true);
    } catch (e) {
      toast.error(e instanceof Error ? `No se pudo reproducir el sonido: ${e.message}` : "No se pudo reproducir el sonido");
    }
  }, [morse, speed, stop]);

  return (
    <div className="tool-view grid gap-5" role="region" aria-label="Traductor de código morse">
      <section data-reveal className="grid gap-3">
        <label htmlFor="morse-input" className={labelClass}>
          Texto o código morse
        </label>
        <Textarea
          id="morse-input"
          rows={4}
          spellCheck={!isMorse}
          placeholder="Escribe un texto, o pega morse como ... --- ..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-describedby="morse-hint"
          className={textareaClass}
        />
        <p id="morse-hint" className="text-muted-foreground m-0 text-sm">
          {input.trim()
            ? isMorse
              ? "Detectamos morse: lo traducimos a texto."
              : "Detectamos texto: lo traducimos a morse."
            : "Detectamos si es texto o morse."}{" "}
          Separa letras con un espacio y palabras con <code className="font-code">/</code>.
        </p>
      </section>

      {result && (
        <Card data-reveal style={{ animationDelay: "40ms" }} aria-live="polite">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base font-semibold">{isMorse ? "Texto" : "Código morse"}</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={playing ? stop : play}
                disabled={!morse}
                aria-pressed={playing}
                className="min-h-[44px] cursor-pointer"
              >
                {playing ? <Square aria-hidden /> : <Play aria-hidden />}
                {playing ? "Detener" : "Escuchar"}
              </Button>
              <CopyButton value={result.salida} what="el resultado" variant="default" />
            </div>
          </CardHeader>
          <CardContent className="grid gap-3">
            <p className="font-code m-0 text-xl leading-relaxed break-words whitespace-pre-wrap">{result.salida || "—"}</p>
            {result.omitidos.length > 0 && (
              <p className="text-muted-foreground m-0 text-sm">
                Sin equivalente, se omitieron:{" "}
                <span className="font-code">{result.omitidos.slice(0, 12).join("  ")}</span>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div data-reveal style={{ animationDelay: "80ms" }} className="flex flex-wrap items-center gap-3">
        <span className={labelClass} aria-hidden>
          Velocidad
        </span>
        <Segmented
          label="Velocidad en palabras por minuto"
          value={speed}
          onChange={setSpeed}
          options={[
            { value: "10", label: "Lenta" },
            { value: "15", label: "Normal" },
            { value: "20", label: "Rápida" },
          ]}
        />
      </div>

      <section data-reveal style={{ animationDelay: "120ms" }} className="grid gap-3" aria-labelledby="morse-alphabet">
        <h3 id="morse-alphabet" className="text-lg font-bold">
          Alfabeto morse
        </h3>
        <dl className="m-0 grid grid-cols-2 gap-x-4 sm:grid-cols-3 md:grid-cols-4">
          {ALFABETO.map(([letra, codigo]) => (
            <div key={letra} className="flex items-baseline justify-between gap-3 border-b border-dashed border-border py-1.5">
              <dt className="font-semibold">{letra}</dt>
              <dd className="font-code m-0 text-sm tracking-widest">{codigo}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
};

export default MorseCode;

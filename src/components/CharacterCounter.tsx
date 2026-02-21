import { useState, useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

type Stats = {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  lines: number;
};

const computeStats = (text: string): Stats => {
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lines = text ? text.split("\n").length : 0;
  return { characters, charactersNoSpaces, words, lines };
};

const StatCard = ({
  label,
  value,
  ariaLabel,
  id,
}: {
  label: string;
  value: number;
  ariaLabel: string;
  id: string;
}) => (
  <Card
    id={id}
    aria-label={ariaLabel}
    role="region"
    className="flex flex-col transition-shadow duration-200 focus-within:ring-2 focus-within:ring-(--json-result-accent)/20 focus-within:ring-offset-2"
  >
    <CardContent className="flex flex-1 flex-col py-4">
      <p className="text-muted-foreground mb-2 min-h-10 text-sm leading-tight">
        {label}
      </p>
      <p
        className="mt-auto text-xl font-medium tabular-nums"
        aria-live="polite"
        aria-atomic="true"
      >
        {value}
      </p>
    </CardContent>
  </Card>
);

const CharacterCounter = () => {
  const [input, setInput] = useState("");

  const stats = useMemo(() => computeStats(input), [input]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  return (
    <div
      className="character-counter grid gap-8"
      role="region"
      aria-label="Contador de caracteres"
    >
      <section
        className="grid gap-3"
        data-reveal
        style={{ animationDelay: "0ms" }}
      >
        <label
          htmlFor="character-counter-input"
          className="text-muted-foreground font-display text-xs font-medium uppercase tracking-wider"
        >
          Texto
        </label>
        <Textarea
          id="character-counter-input"
          name="character-counter-input"
          placeholder="Escribe o pega aquí tu texto…"
          rows={8}
          spellCheck={true}
          autoComplete="off"
          value={input}
          onChange={handleChange}
          aria-label="Texto para contar caracteres"
          className="font-code min-w-0 resize-y text-sm transition-[border-color,box-shadow] duration-200 focus-visible:ring-(--json-result-accent)/25"
        />
      </section>

      <div
        className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4"
        role="group"
        aria-label="Estadísticas del texto"
        aria-live="polite"
        data-reveal
        style={{ animationDelay: "80ms" }}
      >
        <StatCard
          id="stat-characters"
          label="Caracteres"
          value={stats.characters}
          ariaLabel={`${stats.characters} caracteres`}
        />
        <StatCard
          id="stat-characters-no-spaces"
          label="Caracteres (sin espacios)"
          value={stats.charactersNoSpaces}
          ariaLabel={`${stats.charactersNoSpaces} caracteres sin espacios`}
        />
        <StatCard
          id="stat-words"
          label="Palabras"
          value={stats.words}
          ariaLabel={`${stats.words} palabras`}
        />
        <StatCard
          id="stat-lines"
          label="Líneas"
          value={stats.lines}
          ariaLabel={`${stats.lines} líneas`}
        />
      </div>
    </div>
  );
};

export default CharacterCounter;

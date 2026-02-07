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
}: {
  label: string;
  value: number;
  ariaLabel: string;
}) => (
  <Card aria-label={ariaLabel} className="flex flex-col">
    <CardContent className="flex flex-1 flex-col py-4">
      <p className="text-muted-foreground mb-2 min-h-10 text-sm leading-tight">
        {label}
      </p>
      <p className="mt-auto text-xl font-medium tabular-nums">{value}</p>
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
    <div className="space-y-4">
      <Textarea
        id="character-counter-input"
        placeholder="Escribe o pega aquí tu texto..."
        rows={8}
        value={input}
        onChange={handleChange}
        aria-label="Texto para contar caracteres"
        className="font-code text-sm"
      />

      <div
        className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4"
        role="group"
        aria-label="Estadísticas del texto"
      >
        <StatCard
          label="Caracteres"
          value={stats.characters}
          ariaLabel={`${stats.characters} caracteres`}
        />
        <StatCard
          label="Caracteres (sin espacios)"
          value={stats.charactersNoSpaces}
          ariaLabel={`${stats.charactersNoSpaces} caracteres sin espacios`}
        />
        <StatCard
          label="Palabras"
          value={stats.words}
          ariaLabel={`${stats.words} palabras`}
        />
        <StatCard
          label="Líneas"
          value={stats.lines}
          ariaLabel={`${stats.lines} líneas`}
        />
      </div>
    </div>
  );
};

export default CharacterCounter;

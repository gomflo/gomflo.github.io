import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SortDirection = "asc" | "desc";

const sortLines = (text: string, direction: SortDirection): string => {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
  const sorted = [...lines].sort((a, b) => a.localeCompare(b, "es"));
  const result =
    direction === "desc" ? [...sorted].reverse() : sorted;
  return result.join("\n");
};

const ListSorter = () => {
  const [input, setInput] = useState("");
  const [direction, setDirection] = useState<SortDirection>("asc");

  const output = useMemo(() => sortLines(input, direction), [input, direction]);

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      toast.success("Lista copiada al portapapeles");
    } catch {
      toast.error("No se pudo copiar al portapapeles");
    }
  };

  const handleDirectionAsc = () => setDirection("asc");
  const handleDirectionDesc = () => setDirection("desc");

  return (
    <div className="space-y-4">
      <Textarea
        id="list-sorter-input"
        placeholder="Un elemento por línea..."
        rows={6}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        aria-label="Lista de entrada, un elemento por línea"
        className="font-code text-sm"
      />

      <div className="flex gap-2">
        <Button
          type="button"
          variant={direction === "asc" ? "default" : "outline"}
          size="sm"
          onClick={handleDirectionAsc}
          aria-label="Ordenar de A a Z"
        >
          A → Z
        </Button>
        <Button
          type="button"
          variant={direction === "desc" ? "default" : "outline"}
          size="sm"
          onClick={handleDirectionDesc}
          aria-label="Ordenar de Z a A"
        >
          Z → A
        </Button>
      </div>

      {output ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">
              Lista ordenada
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              aria-label="Copiar lista ordenada al portapapeles"
            >
              Copiar
            </Button>
          </CardHeader>
          <CardContent>
            <pre className="m-0 overflow-auto">
              <code className="font-code text-sm whitespace-pre-wrap break-all">
                {output}
              </code>
            </pre>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default ListSorter;

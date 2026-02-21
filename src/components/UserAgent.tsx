import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const UserAgent = () => {
  const [userAgent, setUserAgent] = useState<string>("");
  const [isCopying, setIsCopying] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setUserAgent(navigator.userAgent);
    }
  }, []);

  const handleCopy = async () => {
    if (!userAgent) return;
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(userAgent);
      toast.success("User Agent copiado al portapapeles");
    } catch {
      toast.error("No se pudo copiar al portapapeles");
    } finally {
      setIsCopying(false);
    }
  };

  const handleResultKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const range = document.createRange();
      range.selectNodeContents(e.currentTarget);
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  };

  return (
    <div
      className="user-agent-view grid gap-8"
      role="region"
      aria-label="User Agent del navegador"
    >
      <Card
        data-reveal
        style={{ animationDelay: "0ms" }}
        className="grid gap-3 transition-shadow duration-200 focus-within:ring-2 focus-within:ring-(--json-result-accent)/20 focus-within:ring-offset-2"
        aria-live="polite"
        aria-busy={!userAgent}
      >
        <CardContent className="pt-6">
          <span className="text-muted-foreground font-display text-xs font-medium uppercase tracking-wider">
            User Agent
          </span>
          <div
            role="region"
            tabIndex={0}
            aria-label="User Agent del navegador. Enter o espacio para seleccionar todo"
            className="min-h-12 w-full cursor-text select-all rounded-md border border-transparent px-1 py-2 transition-shadow duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--json-result-accent)/30 focus-visible:ring-offset-2"
            onKeyDown={handleResultKeyDown}
          >
            <pre className="font-code m-0 w-full whitespace-pre-wrap wrap-break-word text-sm text-foreground">
              {userAgent || "Cargando…"}
            </pre>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleCopy}
            disabled={!userAgent || isCopying}
            aria-label={isCopying ? "Copiando…" : "Copiar User Agent al portapapeles"}
            className="mt-4 min-h-[44px] min-w-[44px] cursor-pointer disabled:opacity-50"
          >
            {isCopying ? "Copiando…" : "Copiar"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAgent;

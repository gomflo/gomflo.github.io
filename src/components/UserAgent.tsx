import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const UserAgent = () => {
  const [userAgent, setUserAgent] = useState<string>("");

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setUserAgent(navigator.userAgent);
    }
  }, []);

  const handleCopy = async () => {
    if (!userAgent) return;
    try {
      await navigator.clipboard.writeText(userAgent);
      toast.success("User Agent copiado al portapapeles");
    } catch {
      toast.error("No se pudo copiar al portapapeles");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCopy();
    }
  };

  return (
    <>
      <pre
        className="font-code w-full whitespace-pre-wrap break-words text-sm text-foreground"
        role="text"
        aria-label="User Agent del navegador"
      >
        {userAgent || "Cargando…"}
      </pre>
      <Button
        type="button"
        variant="outline"
        onClick={handleCopy}
        onKeyDown={handleKeyDown}
        disabled={!userAgent}
        aria-label="Copiar User Agent al portapapeles"
        tabIndex={0}
        className="mt-4"
      >
        Copiar
      </Button>
    </>
  );
};

export default UserAgent;

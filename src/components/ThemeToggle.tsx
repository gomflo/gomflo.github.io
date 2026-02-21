"use client";

import { Moon, Sun } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const THEME_KEY = "theme";

const getThemeFromDOM = (): "light" | "dark" => {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
};

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const applyTheme = useCallback((next: "light" | "dark") => {
    const root = document.documentElement;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (next === "dark") {
      root.classList.add("dark");
      if (meta) meta.setAttribute("content", "#0f0f0f");
    } else {
      root.classList.remove("dark");
      if (meta) meta.setAttribute("content", "#ffffff");
    }
    localStorage.setItem(THEME_KEY, next);
    setTheme(next);
    window.dispatchEvent(
      new CustomEvent("themechange", { detail: { theme: next } })
    );
  }, []);

  useEffect(() => {
    setTheme(getThemeFromDOM());
  }, []);

  const handleClick = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    applyTheme(next);
  }, [theme, applyTheme]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  const isDark = theme === "dark";
  const ariaLabel = isDark
    ? "Cambiar a modo claro"
    : "Cambiar a modo oscuro";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      className="text-(--color-text-muted) hover:text-(--color-text) transition-[color,opacity,transform] duration-150 hover:bg-transparent"
    >
      <Sun
        className="h-[1.2rem] w-[1.2rem] dark:hidden"
        aria-hidden
        style={{
          transition: "opacity 0.15s ease, transform 0.15s ease",
        }}
      />
      <Moon
        className="hidden h-[1.2rem] w-[1.2rem] dark:block"
        aria-hidden
        style={{
          transition: "opacity 0.15s ease, transform 0.15s ease",
        }}
      />
    </Button>
  );
};

import { useCallback, useEffect, useState } from "react";

const THEME_KEY = "theme";
const THEME_COLORS = { light: "#f5f7fc", dark: "#0b1130" } as const;

type Theme = keyof typeof THEME_COLORS;

const getThemeFromDOM = (): Theme => {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
};

/**
 * Sol que se vuelve luna: los rayos se recogen y una sombra muerde el disco.
 * El estado visual depende de la clase `.dark` en <html>, así que no parpadea
 * antes de hidratar.
 */
export const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(getThemeFromDOM());
  }, []);

  const handleClick = useCallback(() => {
    const next: Theme = getThemeFromDOM() === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", THEME_COLORS[next]);
    localStorage.setItem(THEME_KEY, next);
    setTheme(next);
    window.dispatchEvent(
      new CustomEvent("themechange", { detail: { theme: next } })
    );
  }, []);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className="theme-toggle"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <mask id="theme-toggle-mask">
          <rect width="24" height="24" fill="#fff" />
          <circle className="theme-toggle-bite" cx="25" cy="3" r="7" fill="#000" />
        </mask>
        <circle
          className="theme-toggle-core"
          cx="12"
          cy="12"
          r="5"
          fill="currentColor"
          mask="url(#theme-toggle-mask)"
        />
        <g
          className="theme-toggle-rays"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <path key={deg} d="M12 2.5v2" transform={`rotate(${deg} 12 12)`} />
          ))}
        </g>
      </svg>
      <style>{`
        .theme-toggle {
          display: grid;
          place-items: center;
          width: 44px;
          height: 44px;
          border: 0;
          border-radius: 999px;
          background: transparent;
          color: var(--ink);
          cursor: pointer;
          transition: background-color 0.2s var(--ease-out), color 0.2s var(--ease-out);
        }
        .theme-toggle:hover {
          background: var(--glaze-sunk);
          color: var(--cobalt);
        }
        .theme-toggle:focus-visible {
          outline: 2px solid var(--cobalt);
          outline-offset: 2px;
        }
        .theme-toggle svg {
          width: 24px;
          height: 24px;
          overflow: visible;
        }
        .theme-toggle-core,
        .theme-toggle-bite,
        .theme-toggle-rays {
          transform-box: view-box;
          transform-origin: 12px 12px;
        }
        .theme-toggle-core {
          transition: transform 0.5s var(--ease-spring);
        }
        .theme-toggle-bite {
          transition: transform 0.5s var(--ease-out);
        }
        .theme-toggle-rays {
          transition: transform 0.5s var(--ease-out), opacity 0.3s var(--ease-out);
        }
        .dark .theme-toggle-core {
          transform: scale(1.7);
        }
        .dark .theme-toggle-bite {
          transform: translate(-8px, 4px);
        }
        .dark .theme-toggle-rays {
          transform: rotate(90deg) scale(0.4);
          opacity: 0;
        }
      `}</style>
    </button>
  );
};

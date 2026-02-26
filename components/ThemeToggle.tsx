"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

function getTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  const t = document.documentElement.dataset.theme;
  return t === "light" ? "light" : "dark";
}

function setTheme(next: Theme) {
  document.documentElement.dataset.theme = next;
  try {
    window.localStorage.setItem("cb_theme", next);
  } catch {
    // ignore
  }
}

function Icon({ name }: { name: "sun" | "moon" }) {
  if (name === "sun") {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
        <path
          d="M12 3v2m0 14v2M4.22 4.22l1.41 1.41m12.73 12.73 1.41 1.41M3 12h2m14 0h2M4.22 19.78l1.41-1.41m12.73-12.73 1.41-1.41"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
      <path
        d="M21 14.5A7.5 7.5 0 0 1 9.5 3a6.5 6.5 0 1 0 11.5 11.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ThemeToggle() {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    setThemeState(getTheme());
  }, []);

  const next: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className="cb-theme-toggle"
      role="switch"
      aria-checked={theme === "light"}
      aria-label={`Toggle theme (currently ${theme})`}
      title={`Switch to ${next} theme`}
      data-state={theme}
      onClick={() => {
        setTheme(next);
        setThemeState(next);
      }}
    >
      <span className="cb-theme-toggle__icon cb-theme-toggle__icon--dark" aria-hidden="true">
        <Icon name="moon" />
      </span>
      <span className="cb-theme-toggle__icon cb-theme-toggle__icon--light" aria-hidden="true">
        <Icon name="sun" />
      </span>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

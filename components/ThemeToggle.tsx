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

export function ThemeToggle() {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    setThemeState(getTheme());
  }, []);

  const next: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className="btn btn--secondary btn--sm"
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      onClick={() => {
        setTheme(next);
        setThemeState(next);
      }}
      style={{ paddingInline: 14 }}
    >
      {next === "light" ? "Light" : "Dark"}
    </button>
  );
}


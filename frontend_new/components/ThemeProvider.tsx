"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme =
  | "modern-saas"
  | "executive-dark"
  | "business-gold"
  | "retail-pos";

export const THEME_LABELS: Record<Theme, string> = {
  "modern-saas": "Modern SaaS",
  "executive-dark": "Executive Dark",
  "business-gold": "Business Gold",
  "retail-pos": "Retail POS",
};

export const THEME_SWATCHES: Record<Theme, { bg: string; accent: string; surface: string }> = {
  "modern-saas": { bg: "#F7F8FA", accent: "#2563EB", surface: "#FFFFFF" },
  "executive-dark": { bg: "#14161A", accent: "#10B981", surface: "#1B1E24" },
  "business-gold": { bg: "#FAF8F3", accent: "#B8912F", surface: "#FFFFFF" },
  "retail-pos": { bg: "#F4F5F4", accent: "#16A34A", surface: "#FFFFFF" },
};

const STORAGE_KEY = "pawn-manager-theme";
const DEFAULT_THEME: Theme = "modern-saas";

function applyTheme(t: Theme) {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", t);
  }
}

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);

  // On mount, read persisted theme
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (stored && stored in THEME_LABELS) {
        applyTheme(stored);
        setThemeState(stored);
      } else {
        applyTheme(DEFAULT_THEME);
      }
    } catch {
      applyTheme(DEFAULT_THEME);
    }
  }, []);

  function setTheme(t: Theme) {
    applyTheme(t);
    setThemeState(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {}
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

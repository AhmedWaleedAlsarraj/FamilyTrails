import React, { createContext, useContext, useEffect, useState } from "react";

export type TextSize = "small" | "default" | "large" | "extra-large";

const TEXT_SIZE_PX: Record<TextSize, string> = {
  small: "14px",
  default: "16px",
  large: "18px",
  "extra-large": "20px",
};

const STORAGE_KEY = "familytrails-accessibility";

interface StoredPrefs {
  textSize: TextSize;
  highContrast: boolean;
  reduceMotion: boolean | null; // null = not set by user, follow OS preference
}

interface AccessibilityContextType extends StoredPrefs {
  setTextSize: (size: TextSize) => void;
  setHighContrast: (value: boolean) => void;
  setReduceMotion: (value: boolean) => void;
  // Resolved value actually applied (falls back to the OS setting when the
  // user hasn't made an explicit choice).
  effectiveReduceMotion: boolean;
}

const defaultPrefs: StoredPrefs = {
  textSize: "default",
  highContrast: false,
  reduceMotion: null,
};

function loadPrefs(): StoredPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPrefs;
    const parsed = JSON.parse(raw);
    return { ...defaultPrefs, ...parsed };
  } catch {
    return defaultPrefs;
  }
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prefs, setPrefs] = useState<StoredPrefs>(loadPrefs);
  const [osReducedMotion, setOsReducedMotion] = useState(
    () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
  );

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setOsReducedMotion(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs]);

  const effectiveReduceMotion = prefs.reduceMotion ?? osReducedMotion;

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--font-size", TEXT_SIZE_PX[prefs.textSize]);
    root.setAttribute("data-contrast", prefs.highContrast ? "high" : "normal");
    root.setAttribute("data-reduce-motion", effectiveReduceMotion ? "true" : "false");
  }, [prefs.textSize, prefs.highContrast, effectiveReduceMotion]);

  return (
    <AccessibilityContext.Provider
      value={{
        ...prefs,
        effectiveReduceMotion,
        setTextSize: (size) => setPrefs((p) => ({ ...p, textSize: size })),
        setHighContrast: (value) => setPrefs((p) => ({ ...p, highContrast: value })),
        setReduceMotion: (value) => setPrefs((p) => ({ ...p, reduceMotion: value })),
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return context;
};

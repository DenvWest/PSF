"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_THEME, themeToCssVariables, type ThemeConfig } from "@/config/theme";

const ThemeContext = createContext<ThemeConfig>(DEFAULT_THEME);

export function useTheme(): ThemeConfig {
  return useContext(ThemeContext);
}

interface ThemeProviderProps {
  theme?: ThemeConfig;
  children: ReactNode;
}

export function ThemeProvider({ theme = DEFAULT_THEME, children }: ThemeProviderProps) {
  const cssVars = themeToCssVariables(theme);
  const style = Object.entries(cssVars).reduce(
    (acc, [key, value]) => {
      acc[key as string] = value;
      return acc;
    },
    {} as Record<string, string>,
  );

  return (
    <ThemeContext.Provider value={theme}>
      <div style={style}>{children}</div>
    </ThemeContext.Provider>
  );
}

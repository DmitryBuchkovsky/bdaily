import { createContext, useContext, useEffect, type ReactNode } from "react";
import {
  type ThemeConfig,
  type DeepPartial,
  getTheme,
  setTheme,
  applyThemeToDOM,
  defaultTheme,
} from "@/config/theme";

const ThemeContext = createContext<ThemeConfig>(defaultTheme);

export function useTheme(): ThemeConfig {
  return useContext(ThemeContext);
}

interface ThemeProviderProps {
  overrides?: DeepPartial<ThemeConfig>;
  children: ReactNode;
}

export function ThemeProvider({ overrides, children }: ThemeProviderProps) {
  useEffect(() => {
    if (overrides) {
      setTheme(overrides);
    } else {
      applyThemeToDOM(getTheme());
    }
  }, [overrides]);

  const theme = overrides ? setTheme(overrides) : getTheme();

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

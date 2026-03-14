import { useEffect, useMemo, type ReactNode } from "react";
import {
  type ThemeConfig,
  type DeepPartial,
  getTheme,
  setTheme,
  applyThemeToDOM,
} from "@/config/theme";
import { ThemeContext } from "@/config/theme-context";
import { useTeamTheme } from "@/hooks/useTeamTheme";

interface ThemeProviderProps {
  overrides?: DeepPartial<ThemeConfig>;
  children: ReactNode;
}

export function ThemeProvider({ overrides, children }: ThemeProviderProps) {
  const isLoggedIn = !!localStorage.getItem("access_token");
  const { data: teamTheme } = useTeamTheme(isLoggedIn);

  const merged = useMemo<DeepPartial<ThemeConfig>>(() => {
    const base: DeepPartial<ThemeConfig> = { ...overrides };

    if (teamTheme) {
      if (teamTheme.companyName) {
        base.company = { ...base.company, name: teamTheme.companyName };
      }
      if (teamTheme.logoPath) {
        base.company = { ...base.company, logoUrl: teamTheme.logoPath };
      }
      if (teamTheme.faviconPath) {
        base.company = { ...base.company, faviconUrl: teamTheme.faviconPath };
      }
      if (teamTheme.themeConfig) {
        const tc = teamTheme.themeConfig;
        if (tc.colors) base.colors = { ...base.colors, ...tc.colors };
        if (tc.layout) base.layout = { ...base.layout, ...tc.layout };
        if (tc.features) base.features = { ...base.features, ...tc.features };
        if (tc.company) {
          base.company = { ...base.company, ...tc.company };
        }
      }
    }

    return base;
  }, [overrides, teamTheme]);

  useEffect(() => {
    if (Object.keys(merged).length > 0) {
      setTheme(merged);
    } else {
      applyThemeToDOM(getTheme());
    }
  }, [merged]);

  const theme = Object.keys(merged).length > 0 ? setTheme(merged) : getTheme();

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

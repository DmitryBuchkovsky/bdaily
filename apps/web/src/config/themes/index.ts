import type { ThemeConfig, DeepPartial } from "../theme";

export const blueTheme: DeepPartial<ThemeConfig> = {
  company: {
    name: "BDaily",
  },
  colors: {
    primary: "210 100% 40%",
    primaryForeground: "0 0% 100%",
    accent: "210 40% 96%",
    accentForeground: "210 40% 30%",
  },
};

export const presets: Record<string, DeepPartial<ThemeConfig>> = {
  default: {},
  blue: blueTheme,
};

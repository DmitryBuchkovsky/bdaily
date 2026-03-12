import type { ThemeConfig, DeepPartial } from "../theme";

export const hanTheme: DeepPartial<ThemeConfig> = {
  company: {
    name: "HAN",
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
  han: hanTheme,
};

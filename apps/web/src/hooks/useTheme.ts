import { useContext } from "react";
import type { ThemeConfig } from "@/config/theme";
import { ThemeContext } from "@/config/theme-context";

export function useTheme(): ThemeConfig {
  return useContext(ThemeContext);
}

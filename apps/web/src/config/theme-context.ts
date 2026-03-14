import { createContext } from "react";
import { type ThemeConfig, defaultTheme } from "@/config/theme";

export const ThemeContext = createContext<ThemeConfig>(defaultTheme);

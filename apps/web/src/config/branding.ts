import { presets } from "./themes";

const ACTIVE_PRESET = import.meta.env.VITE_THEME_PRESET ?? "default";

export const brandingOverrides = presets[ACTIVE_PRESET] ?? {};

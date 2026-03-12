export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export interface ThemeConfig {
  company: {
    name: string;
    logoUrl?: string;
    faviconUrl?: string;
  };
  colors: {
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    warning: string;
    success: string;
  };
  layout: {
    sidebarWidth: string;
    maxContentWidth: string;
    borderRadius: string;
  };
  features: {
    showLogo: boolean;
    showSprintInfo: boolean;
    showTestedTickets: boolean;
    showQuestions: boolean;
  };
}

const defaultTheme: ThemeConfig = {
  company: {
    name: "BDaily",
  },
  colors: {
    primary: "220 90% 56%",
    primaryForeground: "0 0% 100%",
    secondary: "220 14% 96%",
    secondaryForeground: "220 9% 46%",
    accent: "220 14% 96%",
    accentForeground: "220 9% 46%",
    destructive: "0 84% 60%",
    warning: "38 92% 50%",
    success: "142 71% 45%",
  },
  layout: {
    sidebarWidth: "16rem",
    maxContentWidth: "56rem",
    borderRadius: "0.75rem",
  },
  features: {
    showLogo: true,
    showSprintInfo: true,
    showTestedTickets: true,
    showQuestions: true,
  },
};

let currentTheme: ThemeConfig = { ...defaultTheme };

export function getTheme(): ThemeConfig {
  return currentTheme;
}

export function setTheme(overrides: DeepPartial<ThemeConfig>): ThemeConfig {
  currentTheme = deepMerge(defaultTheme, overrides as Record<string, any>) as unknown as ThemeConfig;
  applyThemeToDOM(currentTheme);
  return currentTheme;
}

export function applyThemeToDOM(theme: ThemeConfig): void {
  const root = document.documentElement;
  root.style.setProperty("--primary", theme.colors.primary);
  root.style.setProperty(
    "--primary-foreground",
    theme.colors.primaryForeground,
  );
  root.style.setProperty("--secondary", theme.colors.secondary);
  root.style.setProperty(
    "--secondary-foreground",
    theme.colors.secondaryForeground,
  );
  root.style.setProperty("--accent", theme.colors.accent);
  root.style.setProperty(
    "--accent-foreground",
    theme.colors.accentForeground,
  );
  root.style.setProperty("--destructive", theme.colors.destructive);
  root.style.setProperty("--warning", theme.colors.warning);
  root.style.setProperty("--success", theme.colors.success);
  root.style.setProperty("--sidebar-width", theme.layout.sidebarWidth);
  root.style.setProperty(
    "--max-content-width",
    theme.layout.maxContentWidth,
  );
  root.style.setProperty("--radius", theme.layout.borderRadius);

  if (theme.company.faviconUrl) {
    const link = document.querySelector(
      "link[rel='icon']",
    ) as HTMLLinkElement | null;
    if (link) link.href = theme.company.faviconUrl;
  }

  document.title = `${theme.company.name} - Daily Reports`;
}

function deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const sourceVal = source[key];
    const targetVal = target[key];
    if (
      sourceVal &&
      typeof sourceVal === "object" &&
      !Array.isArray(sourceVal) &&
      targetVal &&
      typeof targetVal === "object"
    ) {
      result[key] = deepMerge(targetVal, sourceVal);
    } else if (sourceVal !== undefined) {
      result[key] = sourceVal;
    }
  }
  return result;
}

export { defaultTheme };

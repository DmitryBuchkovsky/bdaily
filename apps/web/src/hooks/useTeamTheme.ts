import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { DeepPartial, ThemeConfig } from "@/config/theme";

interface TeamThemeResponse {
  themeConfig: DeepPartial<ThemeConfig> | null;
  logoPath: string | null;
  faviconPath: string | null;
  companyName: string;
}

export function useTeamTheme(enabled: boolean) {
  return useQuery({
    queryKey: ["team-theme"],
    queryFn: () => api.get<TeamThemeResponse>("/theme/my-team"),
    enabled,
    staleTime: 1000 * 60 * 10,
  });
}

export function useInvalidateTeamTheme() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["team-theme"] });
}

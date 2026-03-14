import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import {
  useTeam,
  useUpdateTeamTheme,
  useUploadLogo,
  useDeleteLogo,
  useUploadFavicon,
  useDeleteFavicon,
} from "@/hooks/useAdmin";
import { ColorPickerField } from "@/components/admin/ColorPickerField";
import { FileUploadField } from "@/components/admin/FileUploadField";
import { ThemePreview } from "@/components/admin/ThemePreview";
import { PageInfoBlock } from "@/components/ui/PageInfoBlock";
import { cn } from "@/lib/utils";

const DEFAULT_COLORS: Record<string, string> = {
  primary: "220 90% 56%",
  primaryForeground: "0 0% 100%",
  secondary: "220 14% 96%",
  secondaryForeground: "220 9% 46%",
  accent: "220 14% 96%",
  accentForeground: "220 9% 46%",
  destructive: "0 84% 60%",
  warning: "38 92% 50%",
  success: "142 71% 45%",
};

const COLOR_LABELS: Record<string, string> = {
  primary: "Primary",
  primaryForeground: "Primary text",
  secondary: "Secondary",
  secondaryForeground: "Secondary text",
  accent: "Accent",
  accentForeground: "Accent text",
  destructive: "Destructive",
  warning: "Warning",
  success: "Success",
};

export function BrandingPage() {
  const { id } = useParams<{ id: string }>();
  const { data: team, isLoading } = useTeam(id);
  const updateTheme = useUpdateTeamTheme();
  const uploadLogo = useUploadLogo();
  const deleteLogo = useDeleteLogo();
  const uploadFavicon = useUploadFavicon();
  const deleteFavicon = useDeleteFavicon();

  const existingColors = (team?.themeConfig as Record<string, Record<string, string>> | null)
    ?.colors;

  const [colors, setColors] = useState<Record<string, string>>({});

  const mergedColors = { ...DEFAULT_COLORS, ...existingColors, ...colors };

  const handleColorChange = (key: string, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveColors = () => {
    if (!id) return;
    const existing = (team?.themeConfig as Record<string, unknown>) ?? {};
    updateTheme.mutate({
      id,
      themeConfig: { ...existing, colors: { ...existingColors, ...colors } },
    });
  };

  const handleResetColors = () => {
    if (!id) return;
    setColors({});
    const existing = (team?.themeConfig as Record<string, unknown>) ?? {};
    const { colors: _, ...rest } = existing;
    void _;
    updateTheme.mutate({ id, themeConfig: rest });
  };

  const handleLogoUpload = (file: File) => {
    if (!id) return;
    uploadLogo.mutate({ id, file });
  };

  const handleLogoDelete = () => {
    if (!id) return;
    deleteLogo.mutate(id);
  };

  const handleFaviconUpload = (file: File) => {
    if (!id) return;
    uploadFavicon.mutate({ id, file });
  };

  const handleFaviconDelete = () => {
    if (!id) return;
    deleteFavicon.mutate(id);
  };

  if (isLoading || !team) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <Link
        to={`/admin/teams/${id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Back to team
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Branding &amp; Theme</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Customize colors, logo, and favicon for {team.name}
        </p>
      </div>

      <PageInfoBlock
        storageKey="admin-branding"
        title="Branding & Theme Customization"
        description="Customize the look and feel of the application for your team. Upload a company logo and favicon, and pick a color scheme that matches your brand. Changes are applied across the app for all team members."
        tips={[
          "Logo — displayed in the sidebar and login screen (recommended 256x256 PNG/SVG)",
          "Favicon — the small icon shown in browser tabs (recommended 32x32 PNG)",
          "Colors — primary, secondary, accent, and status colors used throughout the UI",
          "Use the live preview on the right to see changes before saving",
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <section className="rounded-xl border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Logo &amp; Favicon</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <FileUploadField
                label="Logo"
                hint="Recommended: 256x256 PNG or SVG. Max 2 MB."
                currentUrl={team.logoPath}
                onUpload={handleLogoUpload}
                onDelete={handleLogoDelete}
                isUploading={uploadLogo.isPending}
              />
              <FileUploadField
                label="Favicon"
                hint="Recommended: 32x32 or 64x64 PNG. Max 2 MB."
                currentUrl={team.faviconPath}
                onUpload={handleFaviconUpload}
                onDelete={handleFaviconDelete}
                isUploading={uploadFavicon.isPending}
              />
            </div>
          </section>

          <section className="rounded-xl border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Color Scheme</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleResetColors}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent"
                >
                  Reset to defaults
                </button>
                <button
                  type="button"
                  onClick={handleSaveColors}
                  disabled={updateTheme.isPending}
                  className={cn(
                    "rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90",
                    updateTheme.isPending && "opacity-60",
                  )}
                >
                  {updateTheme.isPending ? "Saving…" : "Save colors"}
                </button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(COLOR_LABELS).map(([key, label]) => (
                <ColorPickerField
                  key={key}
                  label={label}
                  hslValue={mergedColors[key] ?? DEFAULT_COLORS[key] ?? "0 0% 0%"}
                  onChange={(v) => handleColorChange(key, v)}
                />
              ))}
            </div>
          </section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">Live Preview</h3>
            <ThemePreview colors={mergedColors} logoUrl={team.logoPath} companyName={team.name} />
          </div>
        </aside>
      </div>
    </div>
  );
}

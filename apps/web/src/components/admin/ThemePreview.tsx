function hslToCss(hsl: string): string {
  return `hsl(${hsl})`;
}

interface ThemePreviewProps {
  colors: Record<string, string>;
  logoUrl: string | null;
  companyName: string;
}

export function ThemePreview({ colors, logoUrl, companyName }: ThemePreviewProps) {
  const bg = "hsl(0 0% 100%)";
  const cardBg = "hsl(0 0% 98%)";
  const border = "hsl(220 13% 91%)";
  const text = "hsl(224 71% 4%)";
  const muted = "hsl(220 9% 46%)";

  return (
    <div className="overflow-hidden rounded-xl border" style={{ background: bg, color: text }}>
      {/* Sidebar mockup */}
      <div className="flex">
        <div className="w-14 border-r p-2" style={{ borderColor: border, background: cardBg }}>
          <div className="mb-3 flex items-center justify-center">
            {logoUrl ? (
              <img src={logoUrl} alt="" className="h-8 w-8 rounded-lg object-contain" />
            ) : (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold"
                style={{
                  background: hslToCss(colors.primary ?? "220 90% 56%"),
                  color: hslToCss(colors.primaryForeground ?? "0 0% 100%"),
                }}
              >
                {companyName.charAt(0)}
              </div>
            )}
          </div>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="mb-2 h-2 rounded"
              style={{ background: i === 1 ? hslToCss(colors.primary ?? "") + "22" : border }}
            />
          ))}
        </div>

        {/* Content mockup */}
        <div className="flex-1 p-3">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-3 w-24 rounded" style={{ background: text }} />
            <div className="flex-1" />
            <div
              className="h-5 w-5 rounded-full"
              style={{
                background: hslToCss(colors.primary ?? ""),
                opacity: 0.15,
              }}
            />
          </div>

          {/* Cards */}
          <div className="space-y-2">
            <div
              className="rounded-lg border p-2"
              style={{ borderColor: border, background: cardBg }}
            >
              <div className="mb-1 h-2 w-16 rounded" style={{ background: muted }} />
              <div className="h-2 w-full rounded" style={{ background: border }} />
            </div>

            {/* Button row */}
            <div className="flex gap-1.5">
              <div
                className="h-6 rounded-md px-2 text-[10px] font-medium leading-6"
                style={{
                  background: hslToCss(colors.primary ?? ""),
                  color: hslToCss(colors.primaryForeground ?? ""),
                }}
              >
                Primary
              </div>
              <div
                className="h-6 rounded-md px-2 text-[10px] font-medium leading-6"
                style={{
                  background: hslToCss(colors.secondary ?? ""),
                  color: hslToCss(colors.secondaryForeground ?? ""),
                }}
              >
                Secondary
              </div>
              <div
                className="h-6 rounded-md px-2 text-[10px] font-medium leading-6"
                style={{
                  background: hslToCss(colors.destructive ?? ""),
                  color: "white",
                }}
              >
                Delete
              </div>
            </div>

            {/* Status pills */}
            <div className="flex gap-1.5">
              <div
                className="rounded-full px-2 py-0.5 text-[9px] font-medium"
                style={{
                  background: hslToCss(colors.success ?? "") + "22",
                  color: hslToCss(colors.success ?? ""),
                }}
              >
                Done
              </div>
              <div
                className="rounded-full px-2 py-0.5 text-[9px] font-medium"
                style={{
                  background: hslToCss(colors.warning ?? "") + "22",
                  color: hslToCss(colors.warning ?? ""),
                }}
              >
                Pending
              </div>
              <div
                className="rounded-full px-2 py-0.5 text-[9px] font-medium"
                style={{
                  background: hslToCss(colors.accent ?? ""),
                  color: hslToCss(colors.accentForeground ?? ""),
                }}
              >
                Accent
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

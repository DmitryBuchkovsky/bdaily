import { useState } from "react";
import { Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageInfoBlockProps {
  title: string;
  description: string;
  tips?: string[];
  storageKey?: string;
}

export function PageInfoBlock({ title, description, tips, storageKey }: PageInfoBlockProps) {
  const key = storageKey ? `bdaily-info-dismissed-${storageKey}` : null;
  const [dismissed, setDismissed] = useState(() => !!key && localStorage.getItem(key) === "1");

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    if (key) localStorage.setItem(key, "1");
  };

  return (
    <div className={cn("relative rounded-xl border border-primary/20 bg-primary/5 p-4")}>
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-primary/10 hover:text-primary"
        title="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex gap-3 pr-8">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-semibold text-primary">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          {tips && tips.length > 0 && (
            <ul className="mt-2 space-y-1">
              {tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/50" />
                  {tip}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

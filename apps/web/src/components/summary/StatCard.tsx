import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  color: string;
}

export function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 text-center shadow-sm">
      <div className={cn("mx-auto mb-1", color)}>{icon}</div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

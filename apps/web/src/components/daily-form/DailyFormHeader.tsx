import { Calendar, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DailyFormHeaderProps {
  date: string;
  isExisting: boolean;
  isSaving: boolean;
  onSave: () => void;
  onDateChange: (date: string) => void;
}

export function DailyFormHeader({
  date,
  isExisting,
  isSaving,
  onSave,
  onDateChange,
}: DailyFormHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Daily Report</h1>
        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="border-none bg-transparent text-sm outline-none"
          />
        </div>
      </div>
      <button
        onClick={onSave}
        disabled={isSaving}
        className={cn(
          "flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          isSaving && "cursor-not-allowed opacity-60",
        )}
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {isExisting ? "Update" : "Save"}
      </button>
    </div>
  );
}

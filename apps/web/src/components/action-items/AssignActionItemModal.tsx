import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AssignActionItemForm } from "./AssignActionItemForm";

interface TeamMember {
  id: string;
  name: string;
}

export interface AssignActionItemInput {
  assigneeId: string;
  title: string;
  description: string;
  dueDate: string;
  dailyReportId?: string;
}

interface AssignActionItemModalProps {
  open: boolean;
  onClose: () => void;
  teamMembers: TeamMember[];
  onSubmit: (data: AssignActionItemInput) => void;
  dailyReportId?: string;
}

export function AssignActionItemModal({
  open,
  onClose,
  teamMembers,
  onSubmit,
  dailyReportId,
}: AssignActionItemModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      />
      <div className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Assign Action Item</h2>
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <AssignActionItemForm
          teamMembers={teamMembers}
          dailyReportId={dailyReportId}
          onSubmit={(data) => {
            onSubmit(data);
            onClose();
          }}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}

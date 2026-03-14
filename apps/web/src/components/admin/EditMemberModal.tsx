import { useState } from "react";
import { X } from "lucide-react";
import { FormSelect } from "@/components/ui/FormSelect";
import { cn } from "@/lib/utils";

interface EditMemberModalProps {
  memberId: string;
  memberName: string;
  currentRole: string;
  onSave: (id: string, role: string) => void;
  onClose: () => void;
  isLoading?: boolean;
}

const ROLE_OPTIONS = [
  { value: "MEMBER", label: "Member" },
  { value: "ADMIN", label: "Admin" },
];

export function EditMemberModal({
  memberId,
  memberName,
  currentRole,
  onSave,
  onClose,
  isLoading,
}: EditMemberModalProps) {
  const [role, setRole] = useState(currentRole);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-xl border bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Edit {memberName}</h2>
          <button
            type="button"
            onClick={onClose}
            className={cn("rounded p-1 text-muted-foreground hover:bg-accent")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Role</label>
            <FormSelect value={role} onChange={setRole} options={ROLE_OPTIONS} />
          </div>
          <button
            type="button"
            onClick={() => onSave(memberId, role)}
            disabled={isLoading}
            className={cn(
              "rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
              "hover:bg-primary/90 disabled:opacity-60",
            )}
          >
            {isLoading ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

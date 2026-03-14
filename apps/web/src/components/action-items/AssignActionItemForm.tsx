import { useState } from "react";
import { cn } from "@/lib/utils";
import { FormInput } from "@/components/ui/FormInput";
import { FormSelect } from "@/components/ui/FormSelect";
import { FormTextarea } from "@/components/ui/FormTextarea";
import type { AssignActionItemInput } from "./AssignActionItemModal";

interface TeamMember {
  id: string;
  name: string;
}

interface AssignActionItemFormProps {
  teamMembers: TeamMember[];
  dailyReportId?: string;
  onSubmit: (data: AssignActionItemInput) => void;
  onCancel: () => void;
}

export function AssignActionItemForm({
  teamMembers,
  dailyReportId,
  onSubmit,
  onCancel,
}: AssignActionItemFormProps) {
  const [assigneeId, setAssigneeId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigneeId || !title.trim() || !dueDate) return;
    onSubmit({
      assigneeId,
      title: title.trim(),
      description: description.trim(),
      dueDate,
      ...(dailyReportId && { dailyReportId }),
    });
  };

  const options = teamMembers.map((m) => ({ value: m.id, label: m.name }));
  const canSubmit = assigneeId && title.trim() && dueDate;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium">Assignee</label>
        <FormSelect
          value={assigneeId}
          onChange={setAssigneeId}
          options={[{ value: "", label: "Select..." }, ...options]}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Title</label>
        <FormInput value={title} onChange={setTitle} placeholder="Action item title" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Description</label>
        <FormTextarea
          value={description}
          onChange={setDescription}
          placeholder="Optional details"
          rows={3}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Due Date</label>
        <FormInput type="date" value={dueDate} onChange={setDueDate} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            "rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90",
            !canSubmit && "cursor-not-allowed opacity-60",
          )}
        >
          Assign
        </button>
      </div>
    </form>
  );
}

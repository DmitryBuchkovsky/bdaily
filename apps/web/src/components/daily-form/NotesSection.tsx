import { RichTextEditor } from "@/components/ui/RichTextEditor";
import type { Notes } from "@/hooks/useDailyReport";

interface NotesSectionProps {
  notes: Notes;
  onChange: (notes: Notes) => void;
}

const noteFields: { key: keyof Notes; label: string; placeholder: string }[] = [
  {
    key: "codeReviewRequests",
    label: "Code Review Requests",
    placeholder: "PRs that need review...",
  },
  { key: "testingStatus", label: "Testing Status", placeholder: "Testing progress..." },
  { key: "deploymentNotes", label: "Deployment Notes", placeholder: "Deployment-related notes..." },
  {
    key: "learningResearch",
    label: "Learning / Research",
    placeholder: "Anything learned or researched...",
  },
];

export function NotesSection({ notes, onChange }: NotesSectionProps) {
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Additional Notes</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {noteFields.map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="mb-1.5 block text-sm font-medium">{label}</label>
            <RichTextEditor
              value={notes[key] ?? ""}
              onChange={(v) => onChange({ ...notes, [key]: v })}
              placeholder={placeholder}
              mentionsEnabled
            />
          </div>
        ))}
      </div>
    </section>
  );
}

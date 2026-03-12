import { FormInput } from "@/components/ui/FormInput";
import { FormSelect } from "@/components/ui/FormSelect";
import type { Question } from "@/hooks/useDailyReport";

interface QuestionsSectionProps {
  items: Question[];
  onChange: (items: Question[]) => void;
}

const typeOptions = [
  { value: "TECHNICAL", label: "Technical" },
  { value: "PRODUCT", label: "Product" },
  { value: "PROCESS", label: "Process" },
];

export function QuestionsSection({ items, onChange }: QuestionsSectionProps) {
  function add() {
    onChange([...items, { type: "TECHNICAL", content: "" }]);
  }

  function update(index: number, patch: Partial<Question>) {
    const updated = [...items];
    updated[index] = { ...updated[index], ...patch } as Question;
    onChange(updated);
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Questions</h2>
        <button onClick={add} className="text-sm font-medium text-primary hover:underline">
          + Add question
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No questions — click "Add question" if you have any.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((q, i) => (
            <div key={i} className="flex gap-3">
              <FormSelect
                value={q.type}
                onChange={(v) => update(i, { type: v as Question["type"] })}
                options={typeOptions}
              />
              <FormInput
                value={q.content}
                onChange={(v) => update(i, { content: v })}
                placeholder="Your question..."
                className="flex-1"
              />
              <button
                onClick={() => remove(i)}
                className="text-sm text-muted-foreground hover:text-destructive"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

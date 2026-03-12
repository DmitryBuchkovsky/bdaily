import { FormInput } from "@/components/ui/FormInput";
import { FormSelect } from "@/components/ui/FormSelect";
import type { TestedTicket } from "@/hooks/useDailyReport";

interface TestedTicketsSectionProps {
  items: TestedTicket[];
  onChange: (items: TestedTicket[]) => void;
}

const resultOptions = [
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

export function TestedTicketsSection({
  items,
  onChange,
}: TestedTicketsSectionProps) {
  function add() {
    onChange([...items, { ticketId: "", title: "", result: "APPROVED" }]);
  }

  function update(index: number, patch: Partial<TestedTicket>) {
    const updated = [...items];
    updated[index] = { ...updated[index], ...patch } as TestedTicket;
    onChange(updated);
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tested Tickets</h2>
        <button onClick={add} className="text-sm font-medium text-primary hover:underline">
          + Add ticket
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No tested tickets — click "Add ticket" to add one.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((t, i) => (
            <div key={i} className="flex gap-3">
              <FormInput
                value={t.ticketId}
                onChange={(v) => update(i, { ticketId: v })}
                placeholder="Ticket ID"
                className="w-32"
              />
              <FormInput
                value={t.title}
                onChange={(v) => update(i, { title: v })}
                placeholder="Ticket title"
                className="flex-1"
              />
              <FormSelect
                value={t.result}
                onChange={(v) => update(i, { result: v as TestedTicket["result"] })}
                options={resultOptions}
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

import { useState, useRef, useEffect } from "react";
import { Search, Tag, X } from "lucide-react";
import { useSearchTickets, type Ticket } from "@/hooks/useTickets";
import { cn } from "@/lib/utils";

interface TicketAutocompleteProps {
  selectedTicket?: { id: string; summary: string };
  onChange: (ticket: { id: string; summary: string } | null) => void;
  placeholder?: string;
}

const stateColors: Record<string, string> = {
  Open: "bg-blue-100 text-blue-700", "In Progress": "bg-yellow-100 text-yellow-700",
  Done: "bg-green-100 text-green-700", Fixed: "bg-green-100 text-green-700",
};

export function TicketAutocomplete({ selectedTicket, onChange, placeholder = "Search tickets..." }: TicketAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: tickets, isLoading } = useSearchTickets(query);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (selectedTicket) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2">
        <Tag className="h-3.5 w-3.5 text-primary" />
        <span className="font-mono text-xs text-primary">{selectedTicket.id}</span>
        <span className="flex-1 truncate text-sm">{selectedTicket.summary}</span>
        <button onClick={() => onChange(null)} className="rounded p-0.5 text-muted-foreground hover:bg-accent"><X className="h-3.5 w-3.5" /></button>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input type="text" value={query} onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }} onFocus={() => query.length >= 2 && setIsOpen(true)} className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20" placeholder={placeholder} />
      </div>
      {isOpen && query.length >= 2 && (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-border bg-popover shadow-lg">
          {isLoading ? (
            <div className="flex items-center justify-center py-4"><div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
          ) : !tickets?.length ? (
            <div className="py-4 text-center text-sm text-muted-foreground">No tickets found</div>
          ) : tickets.map((t: Ticket) => (
            <button key={t.id} onClick={() => { onChange({ id: t.id, summary: t.summary }); setQuery(""); setIsOpen(false); }} className="flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-accent">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-medium text-primary">{t.id}</span>
                  <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-medium", stateColors[t.state] ?? "bg-muted text-muted-foreground")}>{t.state}</span>
                </div>
                <p className="mt-0.5 truncate text-sm">{t.summary}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

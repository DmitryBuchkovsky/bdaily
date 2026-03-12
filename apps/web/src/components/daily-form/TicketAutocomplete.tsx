import { useState, useRef, useEffect } from "react";
import { Search, Tag, X } from "lucide-react";
import { useSearchTickets, type Ticket } from "@/hooks/useTickets";
import { cn } from "@/lib/utils";

interface TicketAutocompleteProps {
  value?: string;
  selectedTicket?: { id: string; summary: string };
  onChange: (ticket: { id: string; summary: string } | null) => void;
  placeholder?: string;
}

const stateColors: Record<string, string> = {
  Open: "bg-blue-100 text-blue-700",
  "In Progress": "bg-yellow-100 text-yellow-700",
  Done: "bg-green-100 text-green-700",
  Fixed: "bg-green-100 text-green-700",
  Verified: "bg-emerald-100 text-emerald-700",
  "Won't fix": "bg-zinc-100 text-zinc-600",
};

const typeIcons: Record<string, string> = {
  Bug: "🐛",
  Task: "✅",
  Story: "📖",
  Feature: "✨",
  Epic: "🎯",
};

export function TicketAutocomplete({
  selectedTicket,
  onChange,
  placeholder = "Search tickets...",
}: TicketAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: tickets, isLoading } = useSearchTickets(query);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(ticket: Ticket) {
    onChange({ id: ticket.id, summary: ticket.summary });
    setQuery("");
    setIsOpen(false);
  }

  if (selectedTicket) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2">
        <Tag className="h-3.5 w-3.5 text-primary" />
        <span className="font-mono text-xs text-primary">
          {selectedTicket.id}
        </span>
        <span className="flex-1 truncate text-sm">{selectedTicket.summary}</span>
        <button
          onClick={() => onChange(null)}
          className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
          placeholder={placeholder}
        />
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-border bg-popover shadow-lg">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : !tickets?.length ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              No tickets found
            </div>
          ) : (
            tickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => handleSelect(ticket)}
                className="flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent"
              >
                <span className="mt-0.5 text-sm">
                  {typeIcons[ticket.type] ?? "📋"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-medium text-primary">
                      {ticket.id}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                        stateColors[ticket.state] ??
                          "bg-muted text-muted-foreground",
                      )}
                    >
                      {ticket.state}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-sm">{ticket.summary}</p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FormInput } from "@/components/ui/FormInput";
import { FormSelect } from "@/components/ui/FormSelect";
import { cn } from "@/lib/utils";

export interface TeamFormData {
  name: string;
  ticketSystemType: string;
  ticketSystemConfig: { baseUrl: string; projectIds: string[]; token?: string };
}

interface TeamFormProps {
  team?: {
    name: string;
    ticketSystemType: string;
    ticketSystemConfig: { baseUrl: string; projectIds: string[]; token?: string };
  };
  onSubmit: (data: TeamFormData) => void;
  isLoading?: boolean;
}

const TICKET_TYPES = [
  { value: "YOUTRACK", label: "YouTrack" },
  { value: "JIRA", label: "Jira" },
  { value: "LINEAR", label: "Linear" },
];

export function TeamForm({ team, onSubmit, isLoading }: TeamFormProps) {
  const [name, setName] = useState(team?.name ?? "");
  const [ticketSystemType, setTicketSystemType] = useState(team?.ticketSystemType ?? "YOUTRACK");
  const [baseUrl, setBaseUrl] = useState(team?.ticketSystemConfig?.baseUrl ?? "");
  const [projectIdsStr, setProjectIdsStr] = useState(
    team?.ticketSystemConfig?.projectIds?.join(", ") ?? "",
  );
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const hasExistingToken = !!team?.ticketSystemConfig?.token;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const projectIds = projectIdsStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (projectIds.length === 0) return;
    const config: TeamFormData["ticketSystemConfig"] = {
      baseUrl: baseUrl.trim(),
      projectIds,
    };
    if (token.trim()) {
      config.token = token.trim();
    }
    onSubmit({
      name: name.trim(),
      ticketSystemType,
      ticketSystemConfig: config,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium">Team name</label>
        <FormInput value={name} onChange={setName} placeholder="e.g. Engineering" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Ticket system type</label>
        <FormSelect
          value={ticketSystemType}
          onChange={setTicketSystemType}
          options={TICKET_TYPES}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Base URL</label>
        <FormInput
          value={baseUrl}
          onChange={setBaseUrl}
          placeholder="https://youtrack.example.com"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Project IDs (comma-separated)</label>
        <FormInput value={projectIdsStr} onChange={setProjectIdsStr} placeholder="PROJ-1, PROJ-2" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">API Token</label>
        <div className="relative">
          <input
            type={showToken ? "text" : "password"}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={
              hasExistingToken ? "••••••••  (leave empty to keep current)" : "Paste your API token"
            }
            className={cn(
              "w-full rounded-lg border border-input bg-background px-3 py-2 pr-10 text-sm",
              "outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20",
            )}
          />
          <button
            type="button"
            onClick={() => setShowToken((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Shared token used by all team members for ticket integration
        </p>
      </div>
      <button
        type="submit"
        disabled={
          isLoading ||
          !name.trim() ||
          !baseUrl.trim() ||
          !projectIdsStr
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean).length
        }
        className={cn(
          "rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90",
          (isLoading || !name.trim() || !baseUrl.trim()) && "cursor-not-allowed opacity-60",
        )}
      >
        {isLoading ? "Saving…" : team ? "Save" : "Create"}
      </button>
    </form>
  );
}

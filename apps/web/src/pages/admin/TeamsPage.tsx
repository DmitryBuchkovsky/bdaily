import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Users } from "lucide-react";
import { useTeams, useCreateTeam } from "@/hooks/useAdmin";
import { TeamForm } from "@/components/admin/TeamForm";
import { PageInfoBlock } from "@/components/ui/PageInfoBlock";
import { cn } from "@/lib/utils";

export function TeamsPage() {
  const { data: teams, isLoading } = useTeams();
  const createTeam = useCreateTeam();
  const [showModal, setShowModal] = useState(false);

  const handleCreate = (data: {
    name: string;
    ticketSystemType: string;
    ticketSystemConfig: { baseUrl: string; projectIds: string[]; token?: string };
  }) => {
    createTeam.mutate(data, { onSuccess: () => setShowModal(false) });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Teams</h1>
        <button
          onClick={() => setShowModal(true)}
          className={cn(
            "flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium",
            "text-primary-foreground hover:bg-primary/90",
          )}
        >
          <Plus className="h-4 w-4" /> Create Team
        </button>
      </div>

      <PageInfoBlock
        storageKey="admin-teams"
        title="Team Management"
        description="Create and manage teams in your organization. Each team has its own ticket system integration (YouTrack, Jira, or Linear), member list, and branding options."
        tips={[
          'Create a new team with "Create Team" and configure its ticket system connection',
          "Click a team to manage members, update settings, or configure branding",
          "Each team can have its own color scheme, logo, and favicon",
        ]}
      />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative z-10 w-full max-w-md rounded-xl border bg-card p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">Create Team</h2>
            <TeamForm onSubmit={handleCreate} isLoading={createTeam.isPending} />
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams?.map((team) => (
            <Link
              key={team.id}
              to={`/admin/teams/${team.id}`}
              className={cn(
                "block rounded-xl border bg-card p-4 transition-colors",
                "hover:border-primary/30",
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{team.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {team.ticketSystemType} · {team.memberCount} members
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Palette } from "lucide-react";
import {
  useTeam,
  useUpdateTeam,
  useAddMember,
  useUpdateMember,
  useRemoveMember,
  useActivateMember,
  useDeactivateMember,
} from "@/hooks/useAdmin";
import { TeamForm } from "@/components/admin/TeamForm";
import { MemberTable } from "@/components/admin/MemberTable";
import { AddMemberForm } from "@/components/admin/AddMemberForm";
import { EditMemberModal } from "@/components/admin/EditMemberModal";
import { PageInfoBlock } from "@/components/ui/PageInfoBlock";
import { cn } from "@/lib/utils";

export function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: team, isLoading } = useTeam(id);
  const updateTeam = useUpdateTeam();
  const addMember = useAddMember();
  const updateMember = useUpdateMember();
  const removeMember = useRemoveMember();
  const activateMember = useActivateMember();
  const deactivateMember = useDeactivateMember();
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  const handleUpdateTeam = (data: {
    name?: string;
    ticketSystemType?: string;
    ticketSystemConfig?: { baseUrl: string; projectIds: string[]; token?: string };
  }) => {
    if (!id) return;
    updateTeam.mutate({ id, ...data });
  };

  const handleAddMember = (data: {
    email: string;
    name: string;
    password: string;
    role: string;
  }) => {
    if (!id) return;
    addMember.mutate({ teamId: id, ...data }, { onSuccess: () => setShowAddMember(false) });
  };

  const handleUpdateMember = (memberId: string, role: string) => {
    updateMember.mutate({ id: memberId, role }, { onSuccess: () => setEditingMemberId(null) });
  };

  const editingMember = team?.members.find((m) => m.id === editingMemberId);

  if (isLoading || !team) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Link
        to="/admin/teams"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Back to teams
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{team.name}</h1>
        <Link
          to={`/admin/teams/${id}/branding`}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium",
            "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
        >
          <Palette className="h-4 w-4" /> Branding &amp; Theme
        </Link>
      </div>

      <PageInfoBlock
        storageKey="admin-team-detail"
        title="Team Settings"
        description="Edit the team name, ticket system integration, manage members, and customize branding. The API token set here is shared by all team members for ticket search and autocomplete."
        tips={[
          "Team Info — update the team name, ticket system URL, project IDs, and API token",
          "API Token — a single shared token used by all members to search and link tickets",
          "Add Member — new members receive an invite email with their login credentials",
          "Activate/Deactivate — toggle member access without deleting their account or data",
          "Branding & Theme — customize colors, upload logo and favicon for this team",
        ]}
      />

      <section>
        <h2 className="mb-4 text-lg font-semibold">Team Info</h2>
        <div className="rounded-xl border bg-card p-6">
          <TeamForm
            team={{
              name: team.name,
              ticketSystemType: team.ticketSystemType,
              ticketSystemConfig: team.ticketSystemConfig,
            }}
            onSubmit={handleUpdateTeam}
            isLoading={updateTeam.isPending}
          />
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Members</h2>
          <button
            onClick={() => setShowAddMember(true)}
            className={cn(
              "rounded-lg bg-primary px-4 py-2 text-sm font-medium",
              "text-primary-foreground hover:bg-primary/90",
            )}
          >
            Add member
          </button>
        </div>
        {showAddMember && (
          <div className="mb-4 rounded-xl border bg-card p-6">
            <AddMemberForm onSubmit={handleAddMember} isLoading={addMember.isPending} />
          </div>
        )}
        <div className="rounded-xl border bg-card p-6">
          <MemberTable
            members={team.members}
            onEdit={(memberId) => setEditingMemberId(memberId)}
            onRemove={(memberId) => removeMember.mutate(memberId)}
            onActivate={(memberId) => activateMember.mutate(memberId)}
            onDeactivate={(memberId) => deactivateMember.mutate(memberId)}
          />
        </div>
      </section>

      {editingMember && (
        <EditMemberModal
          memberId={editingMember.id}
          memberName={editingMember.name}
          currentRole={editingMember.role}
          onSave={handleUpdateMember}
          onClose={() => setEditingMemberId(null)}
          isLoading={updateMember.isPending}
        />
      )}
    </div>
  );
}

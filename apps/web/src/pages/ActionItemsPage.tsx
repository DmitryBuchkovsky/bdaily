import { useState } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  useMyActionItems,
  usePendingApproval,
  useUpdateActionItem,
  useRequestDone,
  useApproveActionItem,
  useRejectActionItem,
  useCreateActionItem,
} from "@/hooks/useActionItems";
import { useTeamMembers } from "@/hooks/useAdmin";
import { ActionItemCard } from "@/components/action-items/ActionItemCard";
import { AssignActionItemModal } from "@/components/action-items/AssignActionItemModal";
import type { ActionItem } from "@/components/action-items/actionItemTypes";
import { PageInfoBlock } from "@/components/ui/PageInfoBlock";
import { cn } from "@/lib/utils";

const STATUS_ORDER = ["PENDING_APPROVAL", "PENDING", "IN_PROGRESS", "DONE", "REJECTED"];

function groupByStatus(items: ActionItem[]): Record<string, ActionItem[]> {
  const groups: Record<string, ActionItem[]> = {};
  for (const status of STATUS_ORDER) groups[status] = [];
  for (const item of items) {
    const s = (item.status as string) ?? "PENDING";
    if (!groups[s]) groups[s] = [];
    groups[s].push(item);
  }
  return groups;
}

export function ActionItemsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const { data: myItemsRaw = [], isLoading } = useMyActionItems();
  const myItems = myItemsRaw as ActionItem[];
  const { data: pendingItems = [] } = usePendingApproval();
  const { data: teamData } = useTeamMembers(isAdmin ? user?.teamId : undefined);
  const updateItem = useUpdateActionItem();
  const requestDone = useRequestDone();
  const approveItem = useApproveActionItem();
  const rejectItem = useRejectActionItem();
  const createItem = useCreateActionItem();
  const [showAssign, setShowAssign] = useState(false);

  const teamMembers = (teamData ?? []).map((m) => ({ id: m.id, name: m.name }));

  const handleStart = (id: string) => {
    updateItem.mutate({ id, status: "IN_PROGRESS" } as Parameters<typeof updateItem.mutate>[0]);
  };

  if (isLoading || !user) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const grouped = groupByStatus(myItems as ActionItem[]);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Action Items</h1>
        {isAdmin && (
          <button
            onClick={() => setShowAssign(true)}
            className={cn(
              "flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium",
              "text-primary-foreground hover:bg-primary/90",
            )}
          >
            <Plus className="h-4 w-4" /> Assign New
          </button>
        )}
      </div>

      <PageInfoBlock
        storageKey="action-items"
        title="Action Items"
        description="Action items are tasks assigned to you by your PM or team lead, usually based on standup discussions. They have a due date and require completion before the deadline."
        tips={[
          'PENDING — newly assigned, click "Start" to begin working on it',
          "IN PROGRESS — you're actively working on it; daily reminders will continue until done",
          'Mark as Done — when finished, click "Request Done" to notify the assigner for approval',
          "PENDING APPROVAL — waiting for the assigner to verify and approve your work",
          "If rejected, the item returns to IN PROGRESS and reminders resume",
          isAdmin
            ? "As an admin, you can assign new items and approve/reject completion requests"
            : "",
        ].filter(Boolean)}
      />

      {isAdmin && pendingItems.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">Pending My Approval</h2>
          <div className="space-y-3">
            {pendingItems.map((item) => (
              <ActionItemCard
                key={item.id}
                item={item as ActionItem}
                currentUserId={user.id}
                onRequestDone={(id) => requestDone.mutate(id)}
                onApprove={(id) => approveItem.mutate(id)}
                onReject={(id) => rejectItem.mutate(id)}
              />
            ))}
          </div>
        </section>
      )}

      {STATUS_ORDER.map((status) => {
        const items = grouped[status] ?? [];
        if (items.length === 0) return null;
        return (
          <section key={status}>
            <h2 className="mb-4 text-lg font-semibold">{status.replace(/_/g, " ")}</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <ActionItemCard
                  key={item.id}
                  item={item}
                  currentUserId={user.id}
                  onStart={handleStart}
                  onRequestDone={(id) => requestDone.mutate(id)}
                  onApprove={(id) => approveItem.mutate(id)}
                  onReject={(id) => rejectItem.mutate(id)}
                />
              ))}
            </div>
          </section>
        );
      })}

      {showAssign && (
        <AssignActionItemModal
          open={showAssign}
          onClose={() => setShowAssign(false)}
          teamMembers={teamMembers}
          onSubmit={(data) =>
            createItem.mutate(data as unknown as Parameters<typeof createItem.mutate>[0], {
              onSuccess: () => setShowAssign(false),
            })
          }
        />
      )}
    </div>
  );
}

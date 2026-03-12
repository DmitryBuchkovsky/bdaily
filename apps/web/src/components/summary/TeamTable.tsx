import { cn } from "@/lib/utils";
import type { SprintMember } from "@/hooks/useSummary";

interface TeamTableProps {
  members: SprintMember[];
}

export function TeamTable({ members }: TeamTableProps) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-6 py-4">
        <h2 className="font-semibold">Team Breakdown</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-6 py-3 text-left font-medium text-muted-foreground">Member</th>
              <th className="px-6 py-3 text-center font-medium text-muted-foreground">Tasks</th>
              <th className="px-6 py-3 text-center font-medium text-muted-foreground">Bugs</th>
              <th className="px-6 py-3 text-center font-medium text-muted-foreground">Blockers</th>
              <th className="px-6 py-3 text-center font-medium text-muted-foreground">Dailies</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.map((m) => (
              <tr key={m.userId} className="transition-colors hover:bg-accent">
                <td className="px-6 py-3 font-medium">{m.name}</td>
                <td className="px-6 py-3 text-center">{m.tasksCompleted}</td>
                <td className="px-6 py-3 text-center">{m.bugsFixed}</td>
                <td className="px-6 py-3 text-center">
                  <span className={cn(m.blockersRaised > 0 && "font-medium text-warning")}>
                    {m.blockersRaised}
                  </span>
                </td>
                <td className="px-6 py-3 text-center">{m.dailiesFiled}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

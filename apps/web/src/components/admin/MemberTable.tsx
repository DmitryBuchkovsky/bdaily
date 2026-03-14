import { format } from "date-fns";
import { Pencil, Trash2, UserCheck, UserX } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MemberTableMember {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface MemberTableProps {
  members: MemberTableMember[];
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
}

export function MemberTable({
  members,
  onEdit,
  onRemove,
  onActivate,
  onDeactivate,
}: MemberTableProps) {
  if (members.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No members yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">Name</th>
            <th className="px-4 py-3 text-left font-medium">Email</th>
            <th className="px-4 py-3 text-left font-medium">Role</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-left font-medium">Joined</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr
              key={m.id}
              className={cn("border-b border-border last:border-0", !m.isActive && "opacity-60")}
            >
              <td className="px-4 py-3 font-medium">{m.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{m.email}</td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "rounded-md px-2 py-0.5 text-xs font-medium",
                    m.role === "ADMIN"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {m.role}
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "rounded-md px-2 py-0.5 text-xs font-medium",
                    m.isActive
                      ? "bg-success/10 text-success"
                      : "bg-destructive/10 text-destructive",
                  )}
                >
                  {m.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {format(new Date(m.createdAt), "MMM d, yyyy")}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-1">
                  {m.isActive ? (
                    <button
                      type="button"
                      onClick={() => onDeactivate(m.id)}
                      className="rounded p-1.5 text-muted-foreground hover:bg-warning/10 hover:text-warning"
                      title="Deactivate"
                    >
                      <UserX className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onActivate(m.id)}
                      className="rounded p-1.5 text-muted-foreground hover:bg-success/10 hover:text-success"
                      title="Activate"
                    >
                      <UserCheck className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onEdit(m.id)}
                    className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(m.id)}
                    className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

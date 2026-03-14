import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCircle2, AlertTriangle, Info, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Notification } from "@/hooks/useNotifications";

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  info: Info,
  alert: AlertTriangle,
  success: CheckCircle2,
  message: MessageSquare,
  default: Bell,
};

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
}

export function NotificationItem({ notification: n, onMarkRead }: NotificationItemProps) {
  const Icon =
    TYPE_ICONS[
      (n.type as string) && TYPE_ICONS[n.type as string] ? (n.type as string) : "default"
    ] ?? Bell;
  const isUnread = !n.readAt;
  const title = (n as Notification & { title?: string }).title ?? "Notification";
  const message = (n as Notification & { message?: string }).message ?? "";
  const timeAgo = n.createdAt
    ? formatDistanceToNow(new Date(n.createdAt as string), { addSuffix: true })
    : "";

  return (
    <button
      type="button"
      onClick={() => isUnread && onMarkRead(n.id)}
      className={cn(
        "flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-accent",
        isUnread && "border-l-4 border-l-primary bg-primary/5",
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{title}</p>
        <p className="text-xs text-muted-foreground line-clamp-2">{message}</p>
        <p className="mt-1 text-xs text-muted-foreground">{timeAgo}</p>
      </div>
    </button>
  );
}

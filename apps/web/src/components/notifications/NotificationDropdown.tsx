import {
  useNotifications,
  useMarkRead,
  useMarkAllRead,
  type Notification,
} from "@/hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";

interface NotificationDropdownProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationDropdown({ open, onClose }: NotificationDropdownProps) {
  const { data: notifications = [], isLoading } = useNotifications();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  if (!open) return null;

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-96 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="font-semibold">Notifications</h3>
        <button
          type="button"
          onClick={() => {
            markAllRead.mutate();
            onClose();
          }}
          className="text-xs font-medium text-primary hover:underline"
        >
          Mark all read
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : notifications.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No notifications</p>
        ) : (
          <div className="divide-y divide-border">
            {(notifications as Notification[]).map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onMarkRead={(id) => markRead.mutate(id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

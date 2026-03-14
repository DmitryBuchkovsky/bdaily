import { NavLink } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { navItems } from "@/config/navigation";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user } = useAuth();
  const theme = useTheme();

  const filteredItems = navItems.filter((item) => !item.adminOnly || user?.role === "ADMIN");

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onClose} />}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          {theme.company.logoUrl ? (
            <img
              src={theme.company.logoUrl}
              alt={theme.company.name}
              className="h-8 w-8 rounded-lg object-contain"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              {theme.company.name.charAt(0)}
            </div>
          )}
          <span className="text-lg font-semibold">{theme.company.name}</span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {filteredItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-border p-4">
          <NavLink
            to="/profile"
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
                isActive ? "bg-primary/10" : "hover:bg-accent",
              )
            }
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
              {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
            <div className="flex-1 truncate">
              <p className="truncate font-medium">{user?.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </NavLink>
        </div>
      </aside>
    </>
  );
}

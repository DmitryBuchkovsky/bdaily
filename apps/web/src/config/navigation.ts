import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Users,
  ClipboardList,
  ListTodo,
  Settings,
  Mail,
  Newspaper,
} from "lucide-react";

interface NavItem {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
  adminOnly?: boolean;
}

export const navItems: NavItem[] = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/daily", icon: FileText, label: "Daily Report" },
  { to: "/board", icon: Users, label: "Team Board" },
  { to: "/board/daily", icon: Newspaper, label: "Team Daily" },
  { to: "/action-items", icon: ListTodo, label: "Action Items" },
  { to: "/summary/me", icon: BarChart3, label: "My Summary" },
  { to: "/team", icon: ClipboardList, label: "Team Summary" },
  { to: "/admin/teams", icon: Settings, label: "Teams", adminOnly: true },
  { to: "/admin/email-templates", icon: Mail, label: "Email Templates", adminOnly: true },
];

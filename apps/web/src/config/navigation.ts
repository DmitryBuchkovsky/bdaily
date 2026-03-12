import { LayoutDashboard, FileText, BarChart3, Users } from "lucide-react";

interface NavItem {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
}

export const navItems: NavItem[] = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/daily", icon: FileText, label: "Daily Report" },
  { to: "/summary/me", icon: BarChart3, label: "My Summary" },
  { to: "/team", icon: Users, label: "Team" },
];

import { NavLink } from "react-router-dom";
import { LayoutDashboard, CheckSquare, Calendar, Settings, LogOut, Hexagon } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Sidebar() {
  const { user, logout } = useAuthStore();

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "My Tasks", icon: CheckSquare, href: "#" },
    { label: "Calendar", icon: Calendar, href: "#" },
    { label: "Settings", icon: Settings, href: "#" },
  ];

  return (
    <div className="flex flex-col h-full bg-card border-r border-border min-h-screen">
      <div className="p-6 flex items-center gap-3 border-b border-border">
        <div className="bg-primary/10 p-2 rounded-lg text-primary">
          <Hexagon className="h-6 w-6" />
        </div>
        <span className="font-bold text-xl tracking-tight">Antigravity</span>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive && item.href !== "#"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-border flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-3 bg-secondary/30 p-3 rounded-xl border border-border/50">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shadow-inner">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-semibold truncate">{user?.name}</span>
            <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full py-2.5 mt-2 text-sm font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-lg transition-colors min-h-[44px]"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </div>
    </div>
  );
}

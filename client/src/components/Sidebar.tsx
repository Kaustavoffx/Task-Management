import { NavLink } from "react-router-dom";
import { LayoutDashboard, CheckSquare, Calendar, Settings, LogOut, Hexagon } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";

const MotionNavLink = motion.create ? motion.create(NavLink) : motion(NavLink as any);

export function Sidebar() {
  const { user, logout } = useAuthStore();

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "My Tasks", icon: CheckSquare, href: "/tasks" },
    { label: "Calendar", icon: Calendar, href: "/calendar" },
    { label: "Settings", icon: Settings, href: "/settings" },
  ];

  return (
    <div className="flex flex-col h-full bg-white/5 dark:bg-black/10 backdrop-blur-xl border-r border-white/20 dark:border-white/10 min-h-screen transition-colors">
      <div className="p-6 flex items-center gap-3 border-b border-white/10 dark:border-white/5">
        <div className="bg-primary/20 p-2 rounded-lg text-primary shadow-inner">
          <Hexagon className="h-6 w-6" />
        </div>
        <span className="font-bold text-xl tracking-tight">Motion Todoist</span>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2">
        {navItems.map((item) => (
          <MotionNavLink
            key={item.label}
            to={item.href}
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
            whileTap={{ scale: 0.98 }}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </MotionNavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-white/10 dark:border-white/5 flex flex-col gap-4">
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
        <motion.button
          whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full py-2.5 mt-2 text-sm font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-lg transition-colors min-h-[44px] border border-destructive/20"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </motion.button>
      </div>
    </div>
  );
}

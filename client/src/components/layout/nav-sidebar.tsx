import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CheckSquare,
  Target,
  Clock,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: CheckSquare, label: "Tasks", href: "/tasks" },
  { icon: Target, label: "Milestones", href: "/milestones" },
  { icon: Clock, label: "Time Tracking", href: "/time-tracking" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function NavSidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 min-h-screen bg-sidebar border-r border-sidebar-border">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-sidebar-foreground">Productivity</h1>
      </div>
      
      <nav className="px-3">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <a
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
                location === item.href && "bg-sidebar-accent"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </a>
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-0 w-64 p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={() => auth.signOut()}
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

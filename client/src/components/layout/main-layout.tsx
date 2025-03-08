import { useState, useEffect } from "react";
import { NavSidebar } from "./nav-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  Menu,
  X,
  LayoutDashboard,
  CheckSquare,
  Target,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/components/auth/auth-provider";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: CheckSquare, label: "Tasks", href: "/tasks" },
  { icon: Target, label: "Milestones", href: "/milestones" },
];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();

  // Check if device is mobile on mount and window resize
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIsMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIsMobile);

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isMobile && isSidebarOpen) {
        const sidebar = document.getElementById("nav-sidebar");
        const toggleButton = document.getElementById("sidebar-toggle");

        if (
          sidebar &&
          !sidebar.contains(e.target as Node) &&
          toggleButton &&
          !toggleButton.contains(e.target as Node)
        ) {
          setIsSidebarOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isMobile, isSidebarOpen]);

  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen bg-background">
        {/* Header - sticky for desktop & mobile */}
        <header className="sticky top-0 z-30 w-full bg-background/95 backdrop-blur-sm border-b">
          <div className="container h-16 flex items-center justify-between md:justify-end px-4">
            {/* Mobile menu button */}
            <Button
              id="sidebar-toggle"
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden"
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>

            {/* App title - mobile only */}
            <div className="md:hidden font-bold text-xl">SkillSync</div>

            {/* User profile button */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label="User profile"
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - hidden on mobile, fixed on desktop */}
          <div
            id="nav-sidebar"
            className={cn(
              "fixed inset-y-0 pt-16 z-20 w-64 transition-transform duration-300 ease-in-out bg-card border-r shadow-lg md:shadow-none",
              isMobile
                ? isSidebarOpen
                  ? "translate-x-0"
                  : "-translate-x-full"
                : "translate-x-0 relative"
            )}
          >
            <NavSidebar />
          </div>

          {/* Main content area with 12-column grid system */}
          <main
            className={cn(
              "flex-1 transition-all duration-300 ease-in-out pt-4 pb-20 md:pb-6 px-4 md:px-6 md:ml-64 overflow-y-auto",
              isMobile ? "w-full" : "grid grid-cols-12 gap-4"
            )}
          >
            <div className={cn("w-full", isMobile ? "" : "col-span-12")}>
              {children}
            </div>
          </main>
        </div>

        {/* Mobile bottom navigation */}
        {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 z-30 bg-background border-t">
            <div className="flex items-center justify-around h-16">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a
                    className={cn(
                      "flex flex-col items-center justify-center w-full h-full px-2 py-1",
                      location === item.href
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-6 w-6" />
                    <span className="text-xs mt-1">{item.label}</span>
                  </a>
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </SidebarProvider>
  );
}

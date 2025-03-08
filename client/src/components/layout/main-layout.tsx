import { NavSidebar } from "./nav-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <div className="flex">
          <NavSidebar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
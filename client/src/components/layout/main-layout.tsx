import { NavSidebar } from "./nav-sidebar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <NavSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

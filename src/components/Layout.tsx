import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header with glass effect */}
          <header className="h-14 flex items-center justify-between border-b border-border px-6 bg-glass sticky top-0 z-50">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-card border border-border">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-success">Connected</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {/* Right side header content if needed */}
            </div>
          </header>
          
          {/* Main content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

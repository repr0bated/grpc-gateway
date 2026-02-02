import { useLocation } from "react-router-dom";
import {
  Activity,
  Server,
  Users,
  Network,
  Wrench,
  Shield,
  FileText,
  Puzzle,
  Search,
  MessageSquare,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/", icon: Activity },
  { title: "Services", url: "/services", icon: Server },
  { title: "Directory", url: "/directory", icon: Users },
  { title: "Network", url: "/network", icon: Network },
  { title: "Tools", url: "/tools", icon: Wrench },
  { title: "Policies", url: "/policies", icon: Shield },
  { title: "Audit", url: "/audit", icon: FileText },
  { title: "Plugins", url: "/plugins", icon: Puzzle },
  { title: "Inspector", url: "/inspector", icon: Search },
  { title: "Assistant", url: "/assistant", icon: MessageSquare },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar
      className="border-r border-sidebar-border bg-gradient-to-b from-[hsl(0,0%,10%)] to-[hsl(0,0%,8%)]"
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-sidebar-border px-5 py-6">
        {!collapsed && (
          <h2 className="text-xl font-bold text-white tracking-tight">
            OP-DBUS Control
          </h2>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <Activity className="h-6 w-6 text-primary" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="py-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={collapsed ? item.title : undefined}
                    >
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className={`
                          flex items-center gap-3 px-5 py-3.5 text-sidebar-foreground
                          transition-all duration-150 border-l-[3px] border-transparent
                          hover:bg-white/5 hover:text-white
                        `}
                        activeClassName="bg-gradient-to-r from-primary/15 to-transparent text-primary border-l-primary"
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!collapsed && (
                          <span className="font-medium">{item.title}</span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

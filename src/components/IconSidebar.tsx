import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  MessageSquare,
  FileText,
  Wrench,
  Terminal,
  Bot,
  GitBranch,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: LayoutGrid, label: "Dashboard", path: "/" },
  { icon: MessageSquare, label: "Assistant", path: "/assistant" },
  { icon: FileText, label: "System Prompt", path: "/system-prompt" },
  { icon: Wrench, label: "Tools", path: "/tools" },
  { icon: Terminal, label: "MCP Execution", path: "/mcp-execution" },
  { icon: Bot, label: "Agents", path: "/agents" },
  { icon: GitBranch, label: "Workflows", path: "/workflows" },
  { icon: Settings, label: "Plugins", path: "/plugins" },
];

interface IconSidebarProps {
  connectionStatus: "connected" | "connecting" | "disconnected";
}

export function IconSidebar({ connectionStatus }: IconSidebarProps) {
  const location = useLocation();

  return (
    <nav className="w-14 bg-sidebar border-r border-border flex flex-col items-center py-4 gap-1.5 relative overflow-hidden scanline">
      {/* Top accent line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent mb-2" />
      
      {navItems.map((item, idx) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 group relative",
              isActive
                ? "bg-primary/15 text-primary glow-pulse border border-primary/30"
                : "text-muted-foreground hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/20"
            )}
            title={item.label}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <Icon className={cn("h-[18px] w-[18px] transition-transform duration-200", isActive && "drop-shadow-[0_0_6px_hsl(var(--primary)/0.6)]")} />
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-primary rounded-r shadow-[0_0_8px_hsl(var(--primary)/0.5)]" />
            )}
            <span className="absolute left-14 bg-card text-foreground text-[11px] px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-primary/20 shadow-lg shadow-primary/5 transition-opacity duration-150 font-medium">
              {item.label}
            </span>
          </NavLink>
        );
      })}

      {/* Connection indicator at bottom */}
      <div className="mt-auto flex flex-col items-center gap-2">
        <div className="w-6 h-[1px] bg-border" />
        <div
          className={cn(
            "w-2.5 h-2.5 rounded-full radar-ping",
            connectionStatus === "connected" &&
              "bg-success text-success shadow-[0_0_10px_hsl(var(--success)/0.5)]",
            connectionStatus === "connecting" &&
              "bg-warning text-warning animate-pulse",
            connectionStatus === "disconnected" && "bg-destructive text-destructive"
          )}
        />
      </div>
    </nav>
  );
}

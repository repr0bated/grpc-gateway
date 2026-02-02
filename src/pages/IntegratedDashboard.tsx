import { useState } from "react";
import { ChatPanel, ChatMessage } from "@/components/dashboard/ChatPanel";
import {
  SystemMonitor,
  SystemService,
  DbusService,
  SystemDiagnostics,
  ToolDefinition,
} from "@/components/dashboard/SystemMonitor";
import { MetricsOverview, SystemMetrics } from "@/components/dashboard/MetricsOverview";

// Mock metrics data - will be replaced with real API calls
const mockMetrics: SystemMetrics = {
  hostname: "op-dbus-server",
  kernel: "Linux 6.1.0-18-amd64",
  uptime: "14d 3h 22m",
  loadAverage: [0.42, 0.38, 0.35] as [number, number, number],
  memoryUsedPercent: 26,
  memoryFormatted: "4.2 GB / 16 GB",
  cpuCores: 8,
  cpuUsage: 12.5,
  totalTools: 16847,
  toolsByCategory: {
    dbus: 15234,
    systemd: 892,
    ovs: 156,
    file: 234,
    system: 187,
    plugin: 78,
    other: 66,
  },
  agentTypesAvailable: 70,
  agentInstancesRunning: 12,
  llmProvider: "Gemini",
  llmModel: "gemini-2.0-flash",
  llmAvailable: true,
  networkInterfaces: 8,
  interfacesUp: 6,
  servicesActive: 47,
  servicesTotal: 52,
  connectedUsers: 3,
  activeSessions: 5,
};

const mockServices: SystemService[] = [
  { id: "1", name: "nginx.service", status: "active", subState: "running" },
  { id: "2", name: "postgresql.service", status: "active", subState: "running" },
  { id: "3", name: "redis.service", status: "active", subState: "running" },
  { id: "4", name: "docker.service", status: "active", subState: "running" },
  { id: "5", name: "sshd.service", status: "active", subState: "running" },
  { id: "6", name: "cron.service", status: "active", subState: "running" },
  { id: "7", name: "systemd-resolved", status: "active", subState: "running" },
  { id: "8", name: "NetworkManager", status: "active", subState: "running" },
];

const mockDbusServices: DbusService[] = [
  { name: "tech.ghostbridge.op-dbus", category: "op-dbus" },
  { name: "tech.ghostbridge.op-orchestrator", category: "op-dbus" },
  { name: "org.freedesktop.NetworkManager", category: "system" },
  { name: "org.freedesktop.systemd1", category: "system" },
  { name: "org.freedesktop.DBus", category: "system" },
];

const mockDiagnostics: SystemDiagnostics = {
  hostname: "op-dbus-server",
  uptime: { formatted: "14d 3h 22m" },
  load: { oneMin: 0.42, fiveMin: 0.38, fifteenMin: 0.35 },
  memory: { formatted: "4.2 GB / 16 GB", percentUsed: 26 },
  cpuCores: 8,
};

const mockTools: ToolDefinition[] = [
  { name: "list_services", description: "List systemd services" },
  { name: "restart_service", description: "Restart a service" },
  { name: "get_logs", description: "Get service logs" },
  { name: "network_status", description: "Network interface status" },
  { name: "create_ovs_bridge", description: "Create OVS bridge" },
  { name: "list_ovs_bridges", description: "List OVS bridges" },
  { name: "add_ovs_port", description: "Add port to OVS bridge" },
  { name: "wireguard_status", description: "WireGuard tunnel status" },
];

export default function IntegratedDashboard() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: "Connected to OP-DBUS. Try 'list tools' or 'system status'.",
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [connectionStatus] = useState<"connected" | "connecting" | "disconnected">("connected");
  const [metrics] = useState<SystemMetrics>(mockMetrics);

  const handleSend = (message: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);

    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I've processed your request: "${message}"\n\nFound 8 active services running on the system. All core services are operational.`,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top Section: Metrics + Monitor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Metrics Overview */}
        <div className="flex-1 p-4 overflow-y-auto border-r border-border">
          <MetricsOverview metrics={metrics} />
        </div>
        
        {/* Right: System Monitor */}
        <div className="w-1/2 p-4 overflow-y-auto">
          <SystemMonitor
            services={mockServices}
            dbusServices={mockDbusServices}
            diagnostics={mockDiagnostics}
            tools={mockTools}
            connectionStatus={connectionStatus}
          />
        </div>
      </div>

      {/* Bottom: Chat Panel - Full Width */}
      <div className="h-[280px] min-h-[200px] border-t border-border bg-background">
        <ChatPanel
          messages={messages}
          isProcessing={isProcessing}
          onSend={handleSend}
        />
      </div>
    </div>
  );
}

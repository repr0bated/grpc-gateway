import { useState, useEffect } from "react";
import { ChatPanel, ChatMessage } from "@/components/dashboard/ChatPanel";
import {
  SystemMonitor,
  SystemService,
  DbusService,
  SystemDiagnostics,
  ToolDefinition,
} from "@/components/dashboard/SystemMonitor";
import { ToolLog, ToolCall } from "@/components/dashboard/ToolLog";
import { MetricsOverview, SystemMetrics } from "@/components/dashboard/MetricsOverview";

// Mock metrics data - will be replaced with real API calls
const mockMetrics: SystemMetrics = {
  // System
  hostname: "op-dbus-server",
  kernel: "Linux 6.1.0-18-amd64",
  uptime: "14d 3h 22m",
  loadAverage: [0.42, 0.38, 0.35] as [number, number, number],
  memoryUsedPercent: 26,
  memoryFormatted: "4.2 GB / 16 GB",
  cpuCores: 8,
  cpuUsage: 12.5,
  
  // Tools - every D-Bus object is a tool
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
  
  // Agents
  agentTypesAvailable: 70,
  agentInstancesRunning: 12,
  
  // LLM
  llmProvider: "Gemini",
  llmModel: "gemini-2.0-flash",
  llmAvailable: true,
  
  // Network
  networkInterfaces: 8,
  interfacesUp: 6,
  
  // Services
  servicesActive: 47,
  servicesTotal: 52,
  
  // Connections
  connectedUsers: 3,
  activeSessions: 5,
};

// Mock data for services and tools panels
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
  const [toolLogs, setToolLogs] = useState<ToolCall[]>([]);
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

    // Simulate AI response
    setTimeout(() => {
      const toolCall: ToolCall = {
        id: Date.now().toString(),
        toolName: "list_services",
        args: { filter: "active" },
        timestamp: new Date().toLocaleTimeString(),
        status: "success",
        result: { count: 8 },
      };
      setToolLogs((prev) => [toolCall, ...prev]);

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
    <div className="flex h-full">
      {/* Chat Panel - 1/3 width */}
      <div className="w-1/3 border-r border-border bg-background flex flex-col">
        <ChatPanel
          messages={messages}
          isProcessing={isProcessing}
          onSend={handleSend}
        />
      </div>

      {/* Right Panel: Metrics + Monitor + Logs - 2/3 width */}
      <div className="flex-1 flex flex-col bg-background overflow-hidden">
        {/* Metrics Overview - Fixed Height */}
        <div className="p-4 border-b border-border overflow-y-auto" style={{ maxHeight: '45%' }}>
          <MetricsOverview metrics={metrics} />
        </div>
        
        {/* System Monitor - Scrollable */}
        <div className="flex-1 p-4 overflow-y-auto border-b border-border">
          <SystemMonitor
            services={mockServices}
            dbusServices={mockDbusServices}
            diagnostics={mockDiagnostics}
            tools={mockTools}
            connectionStatus={connectionStatus}
          />
        </div>
        
        {/* Tool Log - Bottom panel */}
        <div className="h-1/4 min-h-[150px]">
          <ToolLog logs={toolLogs} />
        </div>
      </div>
    </div>
  );
}

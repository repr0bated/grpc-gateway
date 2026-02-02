import { useState, useEffect } from "react";
import { Terminal, Play, Pause, Trash2, Filter } from "lucide-react";
import { ToolLog, ToolCall } from "@/components/dashboard/ToolLog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Mock tool executions for demonstration
const mockExecutions: ToolCall[] = [
  {
    id: "1",
    toolName: "systemd_list_units",
    args: { filter: "active", type: "service" },
    timestamp: "14:32:01",
    status: "success",
    result: { count: 47, units: ["nginx.service", "docker.service"] },
  },
  {
    id: "2",
    toolName: "nm_get_connections",
    args: {},
    timestamp: "14:31:55",
    status: "success",
    result: { connections: 3 },
  },
  {
    id: "3",
    toolName: "ovs_list_bridges",
    args: {},
    timestamp: "14:31:42",
    status: "success",
    result: { bridges: ["br0", "br-int"] },
  },
  {
    id: "4",
    toolName: "dbus_introspect",
    args: { bus: "system", service: "org.freedesktop.systemd1" },
    timestamp: "14:31:30",
    status: "success",
    result: { methods: 156, properties: 42 },
  },
  {
    id: "5",
    toolName: "file_read",
    args: { path: "/etc/hostname" },
    timestamp: "14:31:15",
    status: "failure",
    result: { error: "Permission denied" },
  },
];

export default function McpExecution() {
  const [logs, setLogs] = useState<ToolCall[]>(mockExecutions);
  const [isStreaming, setIsStreaming] = useState(true);
  const [filter, setFilter] = useState("");

  // Simulate incoming tool executions
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const tools = [
        "dbus_call",
        "systemd_restart",
        "nm_activate",
        "ovs_add_port",
        "file_write",
      ];
      const randomTool = tools[Math.floor(Math.random() * tools.length)];

      const newExecution: ToolCall = {
        id: Date.now().toString(),
        toolName: randomTool,
        args: { simulated: true },
        timestamp: new Date().toLocaleTimeString(),
        status: Math.random() > 0.1 ? "success" : "failure",
        result: { demo: true },
      };

      setLogs((prev) => [newExecution, ...prev].slice(0, 100));
    }, 5000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  const filteredLogs = filter
    ? logs.filter((log) =>
        log.toolName.toLowerCase().includes(filter.toLowerCase())
      )
    : logs;

  const clearLogs = () => setLogs([]);

  const successCount = logs.filter((l) => l.status === "success").length;
  const failureCount = logs.filter((l) => l.status === "failure").length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Terminal className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">
              MCP Execution Stream
            </h1>
            <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
              JSON-RPC 2.0
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={isStreaming ? "default" : "outline"}
              size="sm"
              onClick={() => setIsStreaming(!isStreaming)}
            >
              {isStreaming ? (
                <>
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Resume
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={clearLogs}>
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>

        {/* Stats + Filter */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span className="text-muted-foreground">
                Success: <span className="text-success font-mono">{successCount}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-destructive" />
              <span className="text-muted-foreground">
                Failed: <span className="text-destructive font-mono">{failureCount}</span>
              </span>
            </div>
            <div className="text-muted-foreground">
              Total: <span className="font-mono">{logs.length}</span>
            </div>
          </div>

          <div className="flex-1 max-w-xs ml-auto">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by tool name..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-9 h-8 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tool Log */}
      <div className="flex-1 overflow-hidden">
        <ToolLog logs={filteredLogs} />
      </div>
    </div>
  );
}

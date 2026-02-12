import { useState, useEffect } from 'react';
import { Terminal, Play, Pause, Trash2, Filter, Brain, Cpu, Plug, ToggleLeft, ToggleRight, ChevronDown, ChevronRight } from 'lucide-react';
import { ToolLog, ToolCall } from '@/components/dashboard/ToolLog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { apiGet } from '@/lib/backend';
import { cn } from '@/lib/utils';

interface ToolsResponse {
  tools: Array<{ name: string; description?: string; category?: string }>;
}

interface JsonRpcToolCallResult {
  content?: Array<{ type: string; text: string }>;
  isError?: boolean;
}

interface AgentDef {
  name: string;
  enabled: boolean;
  category: string;
}

async function callTool(toolName: string, argumentsObj: Record<string, unknown>) {
  const req = {
    jsonrpc: '2.0',
    id: `${Date.now()}`,
    method: 'tools/call',
    params: { name: toolName, arguments: argumentsObj },
  };
  const res = await fetch('/jsonrpc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || `JSON-RPC ${data.error.code}`);
  return data.result as JsonRpcToolCallResult;
}

const MOCK_AGENTS: AgentDef[] = [
  { name: 'systemd-manager', enabled: true, category: 'system' },
  { name: 'network-scanner', enabled: true, category: 'network' },
  { name: 'dbus-introspector', enabled: true, category: 'dbus' },
  { name: 'ovs-bridge-agent', enabled: false, category: 'network' },
  { name: 'policy-enforcer', enabled: true, category: 'security' },
  { name: 'file-watcher', enabled: false, category: 'system' },
  { name: 'wireguard-agent', enabled: true, category: 'network' },
  { name: 'log-analyzer', enabled: true, category: 'observability' },
  { name: 'workflow-orchestrator', enabled: true, category: 'orchestration' },
  { name: 'capability-router', enabled: false, category: 'orchestration' },
];

export default function McpExecution() {
  const [logs, setLogs] = useState<ToolCall[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [filter, setFilter] = useState('');
  const [connectionStatus] = useState<'connected' | 'disconnected'>('connected');
  const [toolCount, setToolCount] = useState(0);
  const [agents, setAgents] = useState<AgentDef[]>(MOCK_AGENTS);
  const [memoryLimit, setMemoryLimit] = useState([512]);
  const [contextWindow, setContextWindow] = useState([4096]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['system', 'network']));

  useEffect(() => {
    apiGet<ToolsResponse>('/api/tools')
      .then((d) => setToolCount(d.tools?.length || 0))
      .catch(() => {});
  }, []);

  const runSample = async () => {
    setIsStreaming(true);
    try {
      const list = await apiGet<ToolsResponse>('/api/tools');
      const names = (list.tools || []).map((t) => t.name).slice(0, 5);
      for (const name of names) {
        const startedAt = new Date();
        const pendingId = `${startedAt.getTime()}-${name}`;
        setLogs((prev) => [{ id: pendingId, toolName: name, args: {}, timestamp: startedAt.toLocaleTimeString(), status: 'pending' }, ...prev]);
        try {
          const result = await callTool(name, {});
          setLogs((prev) => prev.map((l) => l.id === pendingId ? { ...l, status: result?.isError ? 'failure' : 'success', result } : l));
        } catch (err) {
          setLogs((prev) => prev.map((l) => l.id === pendingId ? { ...l, status: 'failure', result: { error: err instanceof Error ? err.message : 'Execution failed' } } : l));
        }
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const filteredLogs = filter ? logs.filter((l) => l.toolName.toLowerCase().includes(filter.toLowerCase())) : logs;
  const successCount = logs.filter((l) => l.status === 'success').length;
  const failureCount = logs.filter((l) => l.status === 'failure').length;
  const enabledAgents = agents.filter((a) => a.enabled).length;

  const toggleAgent = (name: string) => {
    setAgents((prev) => prev.map((a) => a.name === name ? { ...a, enabled: !a.enabled } : a));
  };

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const agentsByCategory = agents.reduce<Record<string, AgentDef[]>>((acc, a) => {
    (acc[a.category] ??= []).push(a);
    return acc;
  }, {});

  return (
    <div className="flex h-full overflow-hidden">
      {/* LEFT: MCP Status */}
      <div className="w-80 border-r border-border flex flex-col overflow-hidden shrink-0">
        <div className="p-3 border-b border-border bg-card/50">
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">MCP Status</h2>
          </div>
        </div>

        {/* Compact status cards */}
        <div className="p-3 space-y-2 border-b border-border">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-background/50 border border-border/50 rounded p-2">
              <div className="text-[10px] text-muted-foreground uppercase">Connection</div>
              <div className="flex items-center gap-1.5 mt-1">
                <div className={cn("w-2 h-2 rounded-full", connectionStatus === 'connected' ? 'bg-success' : 'bg-destructive')} />
                <span className="text-xs font-mono text-foreground capitalize">{connectionStatus}</span>
              </div>
            </div>
            <div className="bg-background/50 border border-border/50 rounded p-2">
              <div className="text-[10px] text-muted-foreground uppercase">Protocol</div>
              <span className="text-xs font-mono text-foreground">JSON-RPC 2.0</span>
            </div>
            <div className="bg-background/50 border border-border/50 rounded p-2">
              <div className="text-[10px] text-muted-foreground uppercase">Tools</div>
              <span className="text-sm font-mono font-bold text-foreground">{toolCount.toLocaleString()}</span>
            </div>
            <div className="bg-background/50 border border-border/50 rounded p-2">
              <div className="text-[10px] text-muted-foreground uppercase">Agents</div>
              <span className="text-sm font-mono font-bold text-foreground">{enabledAgents}/{agents.length}</span>
            </div>
          </div>

          {/* Execution stats */}
          <div className="bg-background/50 border border-border/50 rounded p-2">
            <div className="text-[10px] text-muted-foreground uppercase mb-1">Execution</div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-success">✓ {successCount}</span>
              <span className="text-destructive">✗ {failureCount}</span>
              <span className="text-muted-foreground">Σ {logs.length}</span>
            </div>
          </div>
        </div>

        {/* Stream controls */}
        <div className="p-3 border-b border-border space-y-2">
          <div className="flex items-center gap-2">
            <Button variant={isStreaming ? 'default' : 'outline'} size="sm" className="flex-1" onClick={runSample} disabled={isStreaming}>
              {isStreaming ? <><Pause className="h-3 w-3 mr-1" />Running</> : <><Play className="h-3 w-3 mr-1" />Run Sample</>}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setLogs([])}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
          <div className="relative">
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Filter tools..." value={filter} onChange={(e) => setFilter(e.target.value)} className="pl-8 h-7 text-xs" />
          </div>
        </div>

        {/* Execution stream */}
        <div className="flex-1 overflow-hidden">
          <ToolLog logs={filteredLogs} />
        </div>
      </div>

      {/* RIGHT: Cognitive MCP */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-3 border-b border-border bg-card/50">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Cognitive MCP</h2>
            <Badge variant="outline" className="text-[10px] ml-auto">DAG Orchestration</Badge>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Memory controls */}
          <Card>
            <CardHeader className="py-2.5 px-3">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" />
                <CardTitle className="text-xs">Memory & Context</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-muted-foreground">Memory Limit</span>
                  <span className="text-[11px] font-mono text-foreground">{memoryLimit[0]} MB</span>
                </div>
                <Slider value={memoryLimit} onValueChange={setMemoryLimit} min={128} max={2048} step={128} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-muted-foreground">Context Window</span>
                  <span className="text-[11px] font-mono text-foreground">{contextWindow[0].toLocaleString()} tokens</span>
                </div>
                <Slider value={contextWindow} onValueChange={setContextWindow} min={1024} max={32768} step={1024} />
              </div>
            </CardContent>
          </Card>

          {/* Agent selection */}
          <Card>
            <CardHeader className="py-2.5 px-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Plug className="h-4 w-4 text-primary" />
                  <CardTitle className="text-xs">Agents & Tools</CardTitle>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">{enabledAgents} active</span>
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="divide-y divide-border">
                {Object.entries(agentsByCategory).map(([category, catAgents]) => {
                  const isExpanded = expandedCategories.has(category);
                  const enabledInCat = catAgents.filter((a) => a.enabled).length;
                  return (
                    <div key={category}>
                      <button
                        onClick={() => toggleCategory(category)}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted/50 transition-colors text-left"
                      >
                        {isExpanded ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                        <span className="text-xs font-medium text-foreground capitalize">{category}</span>
                        <Badge variant="outline" className="text-[9px] ml-auto">{enabledInCat}/{catAgents.length}</Badge>
                      </button>
                      {isExpanded && catAgents.map((agent) => (
                        <div key={agent.name} className="flex items-center justify-between px-3 pl-8 py-1.5 hover:bg-muted/30">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-1.5 h-1.5 rounded-full", agent.enabled ? "bg-success" : "bg-muted-foreground/40")} />
                            <span className={cn("text-xs font-mono", agent.enabled ? "text-foreground" : "text-muted-foreground")}>{agent.name}</span>
                          </div>
                          <Switch checked={agent.enabled} onCheckedChange={() => toggleAgent(agent.name)} className="scale-75" />
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Capability routing info */}
          <Card>
            <CardHeader className="py-2.5 px-3">
              <CardTitle className="text-xs">Capability Routing</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Routing Mode</span>
                  <span className="font-mono text-foreground">capability-based</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Workflow Engine</span>
                  <span className="font-mono text-foreground">DAG orchestrator</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pattern Promotion</span>
                  <span className="font-mono text-success">active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

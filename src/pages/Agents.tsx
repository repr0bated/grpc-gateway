import { useState } from 'react';
import { Bot, Search, ChevronRight, ChevronDown, Play, Pause, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface Agent {
  name: string;
  category: string;
  status: 'running' | 'idle' | 'error' | 'stopped';
  description: string;
  tasks: number;
  uptime: string;
}

const MOCK_AGENTS: Agent[] = [
  { name: 'systemd-service-manager', category: 'system', status: 'running', description: 'Manages systemd unit lifecycle', tasks: 342, uptime: '4d 12h' },
  { name: 'dbus-introspector', category: 'dbus', status: 'running', description: 'Introspects D-Bus interfaces and generates tool definitions', tasks: 16847, uptime: '4d 12h' },
  { name: 'network-scanner', category: 'network', status: 'running', description: 'Monitors network interfaces and connectivity', tasks: 89, uptime: '4d 12h' },
  { name: 'ovs-bridge-agent', category: 'network', status: 'idle', description: 'Open vSwitch bridge management', tasks: 12, uptime: '2d 3h' },
  { name: 'wireguard-agent', category: 'network', status: 'running', description: 'WireGuard tunnel management and peer monitoring', tasks: 45, uptime: '4d 12h' },
  { name: 'policy-enforcer', category: 'security', status: 'running', description: 'Enforces access control and security policies', tasks: 231, uptime: '4d 12h' },
  { name: 'firewall-agent', category: 'security', status: 'running', description: 'Manages firewall rules and zones', tasks: 67, uptime: '4d 12h' },
  { name: 'file-watcher', category: 'system', status: 'stopped', description: 'Monitors filesystem changes and triggers events', tasks: 0, uptime: '—' },
  { name: 'log-analyzer', category: 'observability', status: 'running', description: 'Analyzes and classifies log entries', tasks: 1205, uptime: '4d 12h' },
  { name: 'metrics-collector', category: 'observability', status: 'running', description: 'Collects and aggregates system metrics', tasks: 8901, uptime: '4d 12h' },
  { name: 'workflow-orchestrator', category: 'orchestration', status: 'running', description: 'DAG-based workflow execution engine', tasks: 56, uptime: '4d 12h' },
  { name: 'capability-router', category: 'orchestration', status: 'idle', description: 'Routes tasks to agents based on capabilities', tasks: 34, uptime: '1d 8h' },
  { name: 'pattern-promoter', category: 'orchestration', status: 'running', description: 'Promotes frequent patterns to automated workflows', tasks: 18, uptime: '4d 12h' },
];

const STATUS_STYLES: Record<Agent['status'], { dot: string; badge: string; label: string }> = {
  running: { dot: 'bg-success', badge: 'bg-success/10 text-success', label: 'running' },
  idle: { dot: 'bg-warning', badge: 'bg-warning/10 text-warning', label: 'idle' },
  error: { dot: 'bg-destructive', badge: 'bg-destructive/10 text-destructive', label: 'error' },
  stopped: { dot: 'bg-muted-foreground', badge: 'bg-muted text-muted-foreground', label: 'stopped' },
};

export default function Agents() {
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['system', 'network', 'security', 'observability', 'orchestration']));
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const filtered = MOCK_AGENTS.filter((a) =>
    !search || a.name.includes(search.toLowerCase()) || a.category.includes(search.toLowerCase())
  );

  const grouped = filtered.reduce<Record<string, Agent[]>>((acc, a) => {
    (acc[a.category] ??= []).push(a);
    return acc;
  }, {});

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const runningCount = MOCK_AGENTS.filter((a) => a.status === 'running').length;
  const totalTasks = MOCK_AGENTS.reduce((sum, a) => sum + a.tasks, 0);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="p-3 border-b border-border bg-card/50 shrink-0">
        <div className="flex items-center gap-3">
          <Bot className="h-4 w-4 text-primary" />
          <h1 className="text-sm font-semibold text-foreground">Agents</h1>
          <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
            <span className="text-success">{runningCount} running</span>
            <span>/ {MOCK_AGENTS.length} total</span>
            <span>· {totalTasks.toLocaleString()} tasks</span>
          </div>
          <div className="relative ml-auto w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search agents..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-7 text-xs" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Agent list */}
        <div className="flex-1 overflow-y-auto border-r border-border">
          <div className="divide-y divide-border">
            {Object.entries(grouped).sort().map(([category, agents]) => {
              const isExpanded = expandedCategories.has(category);
              const catRunning = agents.filter((a) => a.status === 'running').length;
              return (
                <div key={category}>
                  <button onClick={() => toggleCategory(category)} className="w-full flex items-center gap-2 px-4 py-2 hover:bg-muted/50 transition-colors text-left">
                    {isExpanded ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                    <span className="text-xs font-semibold text-foreground capitalize">{category}</span>
                    <Badge variant="outline" className="text-[9px] font-mono">{catRunning}/{agents.length}</Badge>
                  </button>
                  {isExpanded && agents.map((agent) => {
                    const style = STATUS_STYLES[agent.status];
                    return (
                      <button
                        key={agent.name}
                        onClick={() => setSelectedAgent(agent)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 pl-9 py-2 text-left hover:bg-muted/30 transition-colors",
                          selectedAgent?.name === agent.name && "bg-primary/10 border-l-2 border-primary"
                        )}
                      >
                        <div className={cn("w-2 h-2 rounded-full shrink-0", style.dot)} />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-mono text-foreground block truncate">{agent.name}</span>
                          <span className="text-[10px] text-muted-foreground truncate block">{agent.description}</span>
                        </div>
                        <span className={cn("text-[9px] px-1.5 py-0.5 rounded shrink-0", style.badge)}>{style.label}</span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail panel */}
        <div className="w-80 overflow-y-auto p-3 shrink-0">
          {selectedAgent ? (
            <div className="space-y-3">
              <div>
                <h2 className="text-sm font-semibold font-mono text-foreground">{selectedAgent.name}</h2>
                <p className="text-xs text-muted-foreground mt-1">{selectedAgent.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-background/50 border border-border/50 rounded p-2">
                  <div className="text-[10px] text-muted-foreground uppercase">Status</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className={cn("w-2 h-2 rounded-full", STATUS_STYLES[selectedAgent.status].dot)} />
                    <span className="text-xs font-mono text-foreground capitalize">{selectedAgent.status}</span>
                  </div>
                </div>
                <div className="bg-background/50 border border-border/50 rounded p-2">
                  <div className="text-[10px] text-muted-foreground uppercase">Category</div>
                  <span className="text-xs font-mono text-foreground capitalize">{selectedAgent.category}</span>
                </div>
                <div className="bg-background/50 border border-border/50 rounded p-2">
                  <div className="text-[10px] text-muted-foreground uppercase">Tasks</div>
                  <span className="text-xs font-mono font-bold text-foreground">{selectedAgent.tasks.toLocaleString()}</span>
                </div>
                <div className="bg-background/50 border border-border/50 rounded p-2">
                  <div className="text-[10px] text-muted-foreground uppercase">Uptime</div>
                  <span className="text-xs font-mono text-foreground">{selectedAgent.uptime}</span>
                </div>
              </div>

              <div className="flex gap-2">
                {selectedAgent.status === 'running' ? (
                  <Button variant="outline" size="sm" className="flex-1 h-7 text-xs">
                    <Pause className="h-3 w-3 mr-1" />Stop
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="flex-1 h-7 text-xs">
                    <Play className="h-3 w-3 mr-1" />Start
                  </Button>
                )}
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  <Settings className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
              Select an agent to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

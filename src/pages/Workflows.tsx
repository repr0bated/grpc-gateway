import { useState } from 'react';
import { GitBranch, Play, Pause, Plus, Search, ChevronRight, ChevronDown, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface WorkflowStep {
  name: string;
  status: 'completed' | 'running' | 'pending' | 'failed';
  duration?: string;
}

interface Workflow {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed' | 'idle';
  trigger: string;
  lastRun: string;
  runs: number;
  steps: WorkflowStep[];
}

const MOCK_WORKFLOWS: Workflow[] = [
  {
    id: 'wf-1', name: 'service-health-check', status: 'running', trigger: 'cron(*/5 * * * *)', lastRun: '2m ago', runs: 1204,
    steps: [
      { name: 'collect-metrics', status: 'completed', duration: '120ms' },
      { name: 'evaluate-thresholds', status: 'running' },
      { name: 'notify-alerts', status: 'pending' },
    ],
  },
  {
    id: 'wf-2', name: 'network-audit-sweep', status: 'completed', trigger: 'cron(0 */6 * * *)', lastRun: '1h ago', runs: 89,
    steps: [
      { name: 'scan-interfaces', status: 'completed', duration: '2.3s' },
      { name: 'check-firewall-rules', status: 'completed', duration: '890ms' },
      { name: 'generate-report', status: 'completed', duration: '340ms' },
    ],
  },
  {
    id: 'wf-3', name: 'auto-remediation', status: 'failed', trigger: 'event(service.error)', lastRun: '15m ago', runs: 34,
    steps: [
      { name: 'identify-failure', status: 'completed', duration: '50ms' },
      { name: 'attempt-restart', status: 'failed', duration: '5.0s' },
      { name: 'escalate', status: 'pending' },
    ],
  },
  {
    id: 'wf-4', name: 'config-backup', status: 'idle', trigger: 'cron(0 2 * * *)', lastRun: '18h ago', runs: 156,
    steps: [
      { name: 'snapshot-state', status: 'pending' },
      { name: 'compress-archive', status: 'pending' },
      { name: 'upload-storage', status: 'pending' },
    ],
  },
  {
    id: 'wf-5', name: 'pattern-promotion', status: 'completed', trigger: 'event(pattern.detected)', lastRun: '3h ago', runs: 12,
    steps: [
      { name: 'analyze-pattern', status: 'completed', duration: '1.2s' },
      { name: 'generate-workflow', status: 'completed', duration: '450ms' },
      { name: 'validate-dag', status: 'completed', duration: '80ms' },
      { name: 'register-workflow', status: 'completed', duration: '30ms' },
    ],
  },
];

const STATUS_MAP = {
  running: { dot: 'bg-success animate-pulse', badge: 'bg-success/10 text-success', icon: Play },
  completed: { dot: 'bg-success', badge: 'bg-success/10 text-success', icon: CheckCircle },
  failed: { dot: 'bg-destructive', badge: 'bg-destructive/10 text-destructive', icon: XCircle },
  idle: { dot: 'bg-muted-foreground', badge: 'bg-muted text-muted-foreground', icon: Clock },
};

const STEP_STATUS_MAP = {
  completed: { dot: 'bg-success', text: 'text-foreground' },
  running: { dot: 'bg-success animate-pulse', text: 'text-foreground' },
  pending: { dot: 'bg-muted-foreground/40', text: 'text-muted-foreground' },
  failed: { dot: 'bg-destructive', text: 'text-destructive' },
};

export default function Workflows() {
  const [search, setSearch] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(MOCK_WORKFLOWS[0]);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set([MOCK_WORKFLOWS[0].id]));

  const filtered = MOCK_WORKFLOWS.filter((w) =>
    !search || w.name.includes(search.toLowerCase()) || w.trigger.includes(search.toLowerCase())
  );

  const toggleSteps = (id: string) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const runningCount = MOCK_WORKFLOWS.filter((w) => w.status === 'running').length;
  const failedCount = MOCK_WORKFLOWS.filter((w) => w.status === 'failed').length;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="p-3 border-b border-border bg-card/50 shrink-0">
        <div className="flex items-center gap-3">
          <GitBranch className="h-4 w-4 text-primary" />
          <h1 className="text-sm font-semibold text-foreground">Workflows</h1>
          <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
            <span className="text-success">{runningCount} running</span>
            {failedCount > 0 && <span className="text-destructive">{failedCount} failed</span>}
            <span>· {MOCK_WORKFLOWS.length} total</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative w-52">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search workflows..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-7 text-xs" />
            </div>
            <Button size="sm" className="h-7 text-xs">
              <Plus className="h-3 w-3 mr-1" />New
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Workflow list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map((wf) => {
            const style = STATUS_MAP[wf.status];
            const isExpanded = expandedSteps.has(wf.id);
            return (
              <div key={wf.id} className="border-b border-border/50">
                <button
                  onClick={() => { setSelectedWorkflow(wf); toggleSteps(wf.id); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/30 transition-colors",
                    selectedWorkflow?.id === wf.id && "bg-primary/5"
                  )}
                >
                  {isExpanded ? <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" /> : <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />}
                  <div className={cn("w-2 h-2 rounded-full shrink-0", style.dot)} />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-mono text-foreground block truncate">{wf.name}</span>
                    <span className="text-[10px] text-muted-foreground">{wf.trigger}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{wf.lastRun}</span>
                  <Badge variant="outline" className="text-[9px] shrink-0">{wf.runs} runs</Badge>
                </button>

                {/* DAG steps */}
                {isExpanded && (
                  <div className="pl-12 pr-4 pb-2 space-y-0">
                    {wf.steps.map((step, i) => {
                      const stepStyle = STEP_STATUS_MAP[step.status];
                      return (
                        <div key={step.name} className="flex items-center gap-2 py-1">
                          <div className="flex flex-col items-center w-4">
                            <div className={cn("w-2 h-2 rounded-full", stepStyle.dot)} />
                            {i < wf.steps.length - 1 && <div className="w-px h-4 bg-border" />}
                          </div>
                          <span className={cn("text-[11px] font-mono flex-1", stepStyle.text)}>{step.name}</span>
                          {step.duration && <span className="text-[10px] text-muted-foreground">{step.duration}</span>}
                          {step.status === 'failed' && <AlertTriangle className="h-3 w-3 text-destructive" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        <div className="w-72 border-l border-border overflow-y-auto p-3 shrink-0">
          {selectedWorkflow ? (
            <div className="space-y-3">
              <div>
                <h2 className="text-sm font-semibold font-mono text-foreground">{selectedWorkflow.name}</h2>
                <Badge className={cn("text-[9px] mt-1", STATUS_MAP[selectedWorkflow.status].badge)}>{selectedWorkflow.status}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-background/50 border border-border/50 rounded p-2">
                  <div className="text-[10px] text-muted-foreground uppercase">Trigger</div>
                  <span className="text-[11px] font-mono text-foreground break-all">{selectedWorkflow.trigger}</span>
                </div>
                <div className="bg-background/50 border border-border/50 rounded p-2">
                  <div className="text-[10px] text-muted-foreground uppercase">Last Run</div>
                  <span className="text-xs font-mono text-foreground">{selectedWorkflow.lastRun}</span>
                </div>
                <div className="bg-background/50 border border-border/50 rounded p-2">
                  <div className="text-[10px] text-muted-foreground uppercase">Total Runs</div>
                  <span className="text-xs font-mono font-bold text-foreground">{selectedWorkflow.runs.toLocaleString()}</span>
                </div>
                <div className="bg-background/50 border border-border/50 rounded p-2">
                  <div className="text-[10px] text-muted-foreground uppercase">Steps</div>
                  <span className="text-xs font-mono font-bold text-foreground">{selectedWorkflow.steps.length}</span>
                </div>
              </div>

              <div className="flex gap-2">
                {selectedWorkflow.status === 'running' ? (
                  <Button variant="outline" size="sm" className="flex-1 h-7 text-xs">
                    <Pause className="h-3 w-3 mr-1" />Pause
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="flex-1 h-7 text-xs">
                    <Play className="h-3 w-3 mr-1" />Run Now
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
              Select a workflow
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

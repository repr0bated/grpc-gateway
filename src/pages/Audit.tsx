import { useState, useMemo } from 'react';
import { FileText, Search, Download, Link, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const LOG_LEVELS = [
  { level: 'emergency', label: 'EMERG', color: 'bg-destructive text-destructive-foreground' },
  { level: 'alert', label: 'ALERT', color: 'bg-destructive/80 text-destructive-foreground' },
  { level: 'critical', label: 'CRIT', color: 'bg-destructive/60 text-white' },
  { level: 'error', label: 'ERROR', color: 'bg-destructive/40 text-destructive' },
  { level: 'warning', label: 'WARN', color: 'bg-warning/30 text-warning' },
  { level: 'info', label: 'INFO', color: 'bg-primary/20 text-primary' },
  { level: 'debug', label: 'DEBUG', color: 'bg-muted text-muted-foreground' },
] as const;

type LogLevel = typeof LOG_LEVELS[number]['level'];

interface AuditLog {
  id: string;
  timestamp: Date;
  level: LogLevel;
  operation: string;
  service: string;
  message: string;
}

const mockAuditLogs: AuditLog[] = [
  { id: '1', timestamp: new Date(), level: 'info', operation: 'service.start', service: 'org.freedesktop.NetworkManager', message: 'Service started successfully' },
  { id: '2', timestamp: new Date(Date.now() - 30000), level: 'warning', operation: 'memory.threshold', service: 'system-monitor', message: 'Memory usage above 85%' },
  { id: '3', timestamp: new Date(Date.now() - 60000), level: 'error', operation: 'service.stop', service: 'org.bluez', message: 'Service failed to stop gracefully' },
  { id: '4', timestamp: new Date(Date.now() - 90000), level: 'debug', operation: 'dbus.introspect', service: 'org.freedesktop.DBus', message: 'Introspected 342 interfaces' },
  { id: '5', timestamp: new Date(Date.now() - 120000), level: 'info', operation: 'policy.update', service: 'admin-policy', message: 'Policy rules reloaded' },
  { id: '6', timestamp: new Date(Date.now() - 150000), level: 'critical', operation: 'disk.failure', service: 'storage-agent', message: 'Disk I/O errors detected on /dev/sda' },
  { id: '7', timestamp: new Date(Date.now() - 180000), level: 'alert', operation: 'security.breach', service: 'firewall-agent', message: 'Unauthorized access attempt blocked' },
  { id: '8', timestamp: new Date(Date.now() - 210000), level: 'emergency', operation: 'system.panic', service: 'kernel', message: 'Kernel panic - not syncing' },
  { id: '9', timestamp: new Date(Date.now() - 240000), level: 'info', operation: 'user.login', service: 'auth-service', message: 'User admin authenticated' },
  { id: '10', timestamp: new Date(Date.now() - 270000), level: 'debug', operation: 'agent.heartbeat', service: 'workflow-orchestrator', message: 'Heartbeat OK, 12 agents reporting' },
  { id: '11', timestamp: new Date(Date.now() - 300000), level: 'warning', operation: 'config.change', service: 'network-config', message: 'Interface eth0 MTU changed to 9000' },
  { id: '12', timestamp: new Date(Date.now() - 330000), level: 'error', operation: 'tool.timeout', service: 'dbus-introspector', message: 'Tool call timed out after 30s' },
];

function getLevelMeta(level: LogLevel) {
  return LOG_LEVELS.find((l) => l.level === level) ?? LOG_LEVELS[6];
}

export default function Audit() {
  const [search, setSearch] = useState('');
  const [activeLevels, setActiveLevels] = useState<Set<LogLevel>>(new Set(LOG_LEVELS.map((l) => l.level)));

  const toggleLevel = (level: LogLevel) => {
    setActiveLevels((prev) => {
      const next = new Set(prev);
      next.has(level) ? next.delete(level) : next.add(level);
      return next;
    });
  };

  const filtered = useMemo(
    () => mockAuditLogs.filter((log) =>
      activeLevels.has(log.level)
      && (!search || log.operation.includes(search) || log.service.includes(search) || log.message.includes(search)),
    ),
    [activeLevels, search],
  );

  const countByLevel = useMemo(() => {
    const map: Record<string, number> = {};
    for (const log of mockAuditLogs) map[log.level] = (map[log.level] || 0) + 1;
    return map;
  }, []);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="p-3 border-b border-border bg-card/50 shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h1 className="text-sm font-semibold text-foreground">Audit Logs</h1>
            <span className="text-[10px] font-mono text-muted-foreground">{filtered.length} entries</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-7 text-xs w-56" />
            </div>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              <Download className="h-3 w-3 mr-1" />Export
            </Button>
          </div>
        </div>

        {/* Level filter chips */}
        <div className="flex items-center gap-1.5">
          <Filter className="h-3 w-3 text-muted-foreground mr-1" />
          {LOG_LEVELS.map(({ level, label, color }) => {
            const active = activeLevels.has(level);
            const count = countByLevel[level] || 0;
            return (
              <button
                key={level}
                onClick={() => toggleLevel(level)}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border transition-all",
                  active ? `${color} border-transparent` : "bg-transparent text-muted-foreground border-border opacity-40"
                )}
              >
                {label}
                {count > 0 && <span className="opacity-70">({count})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Log entries */}
      <div className="flex-1 overflow-y-auto font-mono text-xs">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No log entries match filters</div>
        ) : (
          filtered.map((log) => {
            const meta = getLevelMeta(log.level);
            return (
              <div key={log.id} className="flex items-start gap-3 px-4 py-2 border-b border-border/50 hover:bg-muted/30 transition-colors">
                <span className="text-muted-foreground w-20 shrink-0 pt-0.5">
                  {log.timestamp.toLocaleTimeString()}
                </span>
                <span className={cn("shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold w-12 text-center", meta.color)}>
                  {meta.label}
                </span>
                <span className="text-primary shrink-0 w-36 truncate">{log.operation}</span>
                <span className="text-muted-foreground shrink-0 w-48 truncate">{log.service}</span>
                <span className="text-foreground flex-1 truncate">{log.message}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

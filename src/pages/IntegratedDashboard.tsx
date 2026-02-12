import { useEffect, useMemo, useState, useRef } from 'react';
import {
  SystemMonitor,
  SystemService,
  DbusService,
  SystemDiagnostics,
  ToolDefinition,
} from '@/components/dashboard/SystemMonitor';
import { MetricsOverview, SystemMetrics } from '@/components/dashboard/MetricsOverview';
import { apiGet, formatUptime } from '@/lib/backend';

interface StatusResponse {
  system: {
    hostname: string;
    kernel: string;
    uptime_secs: number;
    load_average: [number, number, number];
    memory_total_mb: number;
    memory_used_mb: number;
    memory_percent: number;
    cpu_count: number;
    cpu_usage: number;
  };
  tools: {
    total: number;
    by_category: Record<string, number>;
  };
  llm: {
    provider: string;
    model: string;
    available: boolean;
  };
  agents: {
    types_available: number;
    instances_running: number;
  };
  services: Array<{ name: string; status: string }>;
  network: {
    interfaces: Array<{ name: string; state: string; mac_address?: string | null }>;
  };
}

interface ToolsResponse {
  tools: Array<{ name: string; description: string }>;
}

function statusToServiceState(status: string): SystemService['status'] {
  const s = status.toLowerCase();
  if (s.includes('active') || s.includes('running') || s === 'ok') return 'active';
  if (s.includes('error') || s.includes('failed')) return 'error';
  return 'inactive';
}

export default function IntegratedDashboard() {
  const [statusData, setStatusData] = useState<StatusResponse | null>(null);
  const [toolData, setToolData] = useState<ToolsResponse | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [status, tools] = await Promise.all([
          apiGet<StatusResponse>('/api/status'),
          apiGet<ToolsResponse>('/api/tools'),
        ]);
        if (cancelled) return;
        setStatusData(status);
        setToolData(tools);
        setConnectionStatus('connected');
      } catch {
        if (cancelled) return;
        setConnectionStatus('disconnected');
      }
    };

    load();
    const timer = setInterval(load, 10000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const metrics = useMemo<SystemMetrics>(() => {
    if (!statusData) {
      return {
        hostname: 'loading...', kernel: 'loading...', uptime: '0d 0h 0m',
        loadAverage: [0, 0, 0], memoryUsedPercent: 0, memoryFormatted: '0 MB / 0 MB',
        cpuCores: 0, cpuUsage: 0, totalTools: 0, toolsByCategory: {},
        agentTypesAvailable: 0, agentInstancesRunning: 0, llmProvider: 'unknown',
        llmModel: 'unknown', llmAvailable: false, networkInterfaces: 0,
        interfacesUp: 0, servicesActive: 0, servicesTotal: 0,
        connectedUsers: 0, activeSessions: 0,
      };
    }

    const interfacesUp = statusData.network.interfaces.filter((i) => i.state === 'up').length;
    const servicesActive = statusData.services.filter((s) => statusToServiceState(s.status) === 'active').length;

    return {
      hostname: statusData.system.hostname, kernel: statusData.system.kernel,
      uptime: formatUptime(statusData.system.uptime_secs),
      loadAverage: statusData.system.load_average,
      memoryUsedPercent: statusData.system.memory_percent,
      memoryFormatted: `${statusData.system.memory_used_mb} MB / ${statusData.system.memory_total_mb} MB`,
      cpuCores: statusData.system.cpu_count, cpuUsage: statusData.system.cpu_usage,
      totalTools: statusData.tools.total, toolsByCategory: statusData.tools.by_category || {},
      agentTypesAvailable: statusData.agents.types_available,
      agentInstancesRunning: statusData.agents.instances_running,
      llmProvider: statusData.llm.provider, llmModel: statusData.llm.model,
      llmAvailable: statusData.llm.available,
      networkInterfaces: statusData.network.interfaces.length, interfacesUp,
      servicesActive, servicesTotal: statusData.services.length,
      connectedUsers: 0, activeSessions: 0,
    };
  }, [statusData]);

  const services = useMemo<SystemService[]>(
    () => (statusData?.services || []).map((svc, idx) => ({
      id: `${idx}-${svc.name}`, name: svc.name,
      status: statusToServiceState(svc.status), subState: svc.status,
    })),
    [statusData],
  );

  const dbusServices = useMemo<DbusService[]>(() => {
    const names = (toolData?.tools || []).map((t) => t.name).filter((n) => n.includes('.')).slice(0, 30);
    return names.map((name) => ({ name, category: name.includes('op-dbus') ? 'op-dbus' : 'system' }));
  }, [toolData]);

  const diagnostics = useMemo<SystemDiagnostics | null>(() => {
    if (!statusData) return null;
    return {
      hostname: statusData.system.hostname,
      uptime: { formatted: formatUptime(statusData.system.uptime_secs) },
      load: { oneMin: statusData.system.load_average[0], fiveMin: statusData.system.load_average[1], fifteenMin: statusData.system.load_average[2] },
      memory: { formatted: `${statusData.system.memory_used_mb} MB / ${statusData.system.memory_total_mb} MB`, percentUsed: statusData.system.memory_percent },
      cpuCores: statusData.system.cpu_count,
    };
  }, [statusData]);

  const tools = useMemo<ToolDefinition[]>(
    () => (toolData?.tools || []).slice(0, 40).map((t) => ({ name: t.name, description: t.description })),
    [toolData],
  );

  /* ── boot-up sequence ── */
  const [bootPhase, setBootPhase] = useState<'off' | 'power' | 'scan' | 'ready'>('off');
  const bootTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const t1 = setTimeout(() => setBootPhase('power'), 200);
    const t2 = setTimeout(() => setBootPhase('scan'), 1200);
    const t3 = setTimeout(() => setBootPhase('ready'), 2600);
    bootTimers.current = [t1, t2, t3];
    return () => bootTimers.current.forEach(clearTimeout);
  }, []);

  if (bootPhase === 'off') {
    return <div className="h-full w-full bg-black" />;
  }

  if (bootPhase === 'power') {
    return (
      <div className="h-full w-full bg-black flex items-center justify-center crt-screen">
        <div className="crt-powerline" />
      </div>
    );
  }

  if (bootPhase === 'scan') {
    return (
      <div className="h-full w-full bg-background crt-screen relative overflow-hidden">
        <div className="crt-boot-text">
          <p className="boot-line" style={{ animationDelay: '0ms' }}>BIOS v3.7.1 — OP-DBUS Control Plane</p>
          <p className="boot-line" style={{ animationDelay: '150ms' }}>Initializing D-Bus subsystem...</p>
          <p className="boot-line" style={{ animationDelay: '300ms' }}>Loading kernel modules... <span className="text-success">OK</span></p>
          <p className="boot-line" style={{ animationDelay: '450ms' }}>MCP protocol handshake... <span className="text-success">OK</span></p>
          <p className="boot-line" style={{ animationDelay: '600ms' }}>Enumerating tools &amp; agents... <span className="text-success">OK</span></p>
          <p className="boot-line" style={{ animationDelay: '750ms' }}>Mounting /sys/op-dbus... <span className="text-success">OK</span></p>
          <p className="boot-line" style={{ animationDelay: '900ms' }}>LLM engine online... <span className="text-primary">READY</span></p>
          <p className="boot-line" style={{ animationDelay: '1050ms' }}>Launching control plane <span className="crt-cursor">█</span></p>
        </div>
        <div className="crt-scanbar" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto crt-screen crt-fadein">
      <div className="p-4">
        <MetricsOverview metrics={metrics} />
      </div>
      <div className="p-4 pt-0">
        <SystemMonitor
          services={services}
          dbusServices={dbusServices}
          diagnostics={diagnostics}
          tools={tools}
          connectionStatus={connectionStatus}
        />
      </div>
    </div>
  );
}

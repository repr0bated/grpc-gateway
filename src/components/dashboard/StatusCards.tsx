import { Activity, Server, AlertTriangle, Cpu, HardDrive, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SystemStatus } from '@/types/opdbus';

interface StatusCardsProps {
  status: SystemStatus;
}

export function StatusCards({ status }: StatusCardsProps) {
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${mins}m`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Services</CardTitle>
          <Server className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{status.totalServices}</div>
          <p className="text-xs text-muted-foreground">
            {status.activeServices} active, {status.errorServices} errors
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Services</CardTitle>
          <Activity className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600">{status.activeServices}</div>
          <p className="text-xs text-muted-foreground">
            {((status.activeServices / status.totalServices) * 100).toFixed(0)}% healthy
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resource Usage</CardTitle>
          <Cpu className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{status.totalCpuPercent.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            <HardDrive className="inline h-3 w-3 mr-1" />
            {status.totalMemoryMb.toFixed(1)} MB RAM
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Status</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatUptime(status.uptime)}</div>
          <p className="text-xs text-muted-foreground">
            <Users className="inline h-3 w-3 mr-1" />
            {status.wireguardPeers} WireGuard peers
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

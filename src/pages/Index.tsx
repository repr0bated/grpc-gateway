import { useState } from 'react';
import { useServices } from '@/hooks/useServices';
import { StatusCards } from '@/components/dashboard/StatusCards';
import { ServiceTable } from '@/components/dashboard/ServiceTable';
import { ServiceDetailDialog } from '@/components/dashboard/ServiceDetailDialog';
import { DBusService } from '@/types/opdbus';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Server, Shield, Terminal } from 'lucide-react';

const Index = () => {
  const { services, loading, error, refetch, getSystemStatus } = useServices();
  const [selectedService, setSelectedService] = useState<DBusService | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleInspect = (service: DBusService) => {
    setSelectedService(service);
    setDialogOpen(true);
  };

  const status = getSystemStatus();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Terminal className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">OP-DBUS Control Plane</h1>
                <p className="text-sm text-muted-foreground">D-Bus Service Manager & Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium">Connected</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              Services
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <StatusCards status={status} />
            
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest service events and changes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {services.slice(0, 4).map((service, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            service.status === 'active' ? 'bg-emerald-500' :
                            service.status === 'error' ? 'bg-destructive' : 'bg-muted-foreground'
                          }`} />
                          <span className="font-mono text-sm">{service.busName}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {service.lastSeen.toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                  <CardDescription>System resource overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>CPU Usage</span>
                        <span>{status.totalCpuPercent.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ width: `${Math.min(status.totalCpuPercent * 10, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Memory Usage</span>
                        <span>{status.totalMemoryMb.toFixed(0)} MB</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ width: `${Math.min((status.totalMemoryMb / 500) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Service Health</span>
                        <span>{((status.activeServices / status.totalServices) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 transition-all"
                          style={{ width: `${(status.activeServices / status.totalServices) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="services">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : error ? (
              <Card className="border-destructive">
                <CardContent className="pt-6">
                  <p className="text-destructive">{error}</p>
                </CardContent>
              </Card>
            ) : (
              <ServiceTable 
                services={services} 
                onRefresh={refetch} 
                onInspect={handleInspect}
              />
            )}
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>WireGuard Authentication</CardTitle>
                <CardDescription>Manage keypair authentication and session access</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>WireGuard session management</p>
                  <p className="text-sm">Configure public key authentication for secure access</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <ServiceDetailDialog 
        service={selectedService}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
};

export default Index;

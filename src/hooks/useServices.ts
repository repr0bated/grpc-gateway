import { useState, useEffect, useCallback } from 'react';
import { DBusService, SystemStatus } from '@/types/opdbus';

// Mock data for development - will be replaced with real gRPC calls
const mockServices: DBusService[] = [
  {
    id: '1',
    busName: 'org.freedesktop.DBus',
    objectPath: '/org/freedesktop/DBus',
    status: 'active',
    pid: 1,
    memoryUsage: 12.5,
    cpuUsage: 0.2,
    lastSeen: new Date(),
    interfaces: ['org.freedesktop.DBus', 'org.freedesktop.DBus.Introspectable'],
  },
  {
    id: '2',
    busName: 'org.freedesktop.NetworkManager',
    objectPath: '/org/freedesktop/NetworkManager',
    status: 'active',
    pid: 892,
    memoryUsage: 45.2,
    cpuUsage: 1.5,
    lastSeen: new Date(),
    interfaces: ['org.freedesktop.NetworkManager', 'org.freedesktop.DBus.Properties'],
  },
  {
    id: '3',
    busName: 'org.freedesktop.systemd1',
    objectPath: '/org/freedesktop/systemd1',
    status: 'active',
    pid: 1,
    memoryUsage: 128.0,
    cpuUsage: 0.8,
    lastSeen: new Date(),
    interfaces: ['org.freedesktop.systemd1.Manager'],
  },
  {
    id: '4',
    busName: 'org.bluez',
    objectPath: '/org/bluez',
    status: 'inactive',
    lastSeen: new Date(Date.now() - 3600000),
    interfaces: ['org.bluez.Manager'],
  },
  {
    id: '5',
    busName: 'org.freedesktop.UPower',
    objectPath: '/org/freedesktop/UPower',
    status: 'error',
    pid: 1234,
    memoryUsage: 8.3,
    cpuUsage: 0.0,
    lastSeen: new Date(),
    interfaces: ['org.freedesktop.UPower'],
  },
];

export function useServices() {
  const [services, setServices] = useState<DBusService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual gRPC call
      await new Promise(resolve => setTimeout(resolve, 500));
      setServices(mockServices);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  }, []);

  const getSystemStatus = useCallback((): SystemStatus => {
    const active = services.filter(s => s.status === 'active').length;
    const errors = services.filter(s => s.status === 'error').length;
    const totalMemory = services.reduce((sum, s) => sum + (s.memoryUsage || 0), 0);
    const totalCpu = services.reduce((sum, s) => sum + (s.cpuUsage || 0), 0);

    return {
      totalServices: services.length,
      activeServices: active,
      errorServices: errors,
      totalMemoryMb: totalMemory,
      totalCpuPercent: totalCpu,
      uptime: 86400, // Mock uptime in seconds
      wireguardPeers: 3,
    };
  }, [services]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return { services, loading, error, refetch: fetchServices, getSystemStatus };
}

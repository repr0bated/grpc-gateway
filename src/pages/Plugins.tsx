import { useState } from 'react';
import { Puzzle, Upload, Settings, Check, X, FileJson, ChevronRight, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Plugin {
  name: string;
  version: string;
  status: 'active' | 'inactive';
  description: string;
  schemas: Schema[];
}

interface Schema {
  name: string;
  type: 'object' | 'array' | 'enum';
  fields: { name: string; type: string; required: boolean }[];
}

const mockPlugins: Plugin[] = [
  {
    name: 'network-manager', version: '1.2.0', status: 'active', description: 'Network configuration plugin',
    schemas: [
      { name: 'NetworkInterface', type: 'object', fields: [{ name: 'name', type: 'string', required: true }, { name: 'state', type: 'enum(up|down)', required: true }, { name: 'mac_address', type: 'string', required: false }, { name: 'mtu', type: 'number', required: false }] },
      { name: 'Route', type: 'object', fields: [{ name: 'destination', type: 'string', required: true }, { name: 'gateway', type: 'string', required: true }, { name: 'metric', type: 'number', required: false }] },
    ],
  },
  {
    name: 'auth-ldap', version: '2.1.3', status: 'active', description: 'LDAP authentication backend',
    schemas: [
      { name: 'LdapUser', type: 'object', fields: [{ name: 'dn', type: 'string', required: true }, { name: 'cn', type: 'string', required: true }, { name: 'uid', type: 'string', required: true }, { name: 'groups', type: 'string[]', required: false }] },
      { name: 'LdapGroup', type: 'object', fields: [{ name: 'cn', type: 'string', required: true }, { name: 'members', type: 'string[]', required: true }] },
    ],
  },
  {
    name: 'metrics-collector', version: '0.9.1', status: 'inactive', description: 'System metrics gathering',
    schemas: [
      { name: 'MetricSample', type: 'object', fields: [{ name: 'name', type: 'string', required: true }, { name: 'value', type: 'number', required: true }, { name: 'timestamp', type: 'datetime', required: true }, { name: 'labels', type: 'Record<string,string>', required: false }] },
    ],
  },
  {
    name: 'log-aggregator', version: '1.0.0', status: 'active', description: 'Centralized log collection',
    schemas: [
      { name: 'LogEntry', type: 'object', fields: [{ name: 'level', type: 'enum(emerg|alert|crit|error|warn|info|debug)', required: true }, { name: 'message', type: 'string', required: true }, { name: 'source', type: 'string', required: true }, { name: 'timestamp', type: 'datetime', required: true }] },
      { name: 'LogFilter', type: 'object', fields: [{ name: 'levels', type: 'string[]', required: false }, { name: 'sources', type: 'string[]', required: false }, { name: 'since', type: 'datetime', required: false }] },
    ],
  },
];

const totalSchemas = mockPlugins.reduce((sum, p) => sum + p.schemas.length, 0);
const activePlugins = mockPlugins.filter((p) => p.status === 'active').length;

export default function Plugins() {
  const [expandedSchemas, setExpandedSchemas] = useState<Set<string>>(new Set());

  const toggleSchema = (key: string) => {
    setExpandedSchemas((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-3 border-b border-border bg-card/50 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Puzzle className="h-4 w-4 text-primary" />
          <h1 className="text-sm font-semibold text-foreground">Plugin & Schema Manager</h1>
          <span className="text-[10px] font-mono text-muted-foreground">{mockPlugins.length} plugins · {totalSchemas} schemas</span>
        </div>
        <Button size="sm" className="h-7 text-xs">
          <Upload className="h-3 w-3 mr-1" />Install Plugin
        </Button>
      </div>

      <Tabs defaultValue="plugins" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-3 pt-2 shrink-0">
          <TabsList className="w-fit">
            <TabsTrigger value="plugins" className="gap-1.5 text-xs">
              <Puzzle className="h-3.5 w-3.5" /> Plugins
              <Badge variant="secondary" className="text-[9px] px-1 py-0">{mockPlugins.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="schemas" className="gap-1.5 text-xs">
              <FileJson className="h-3.5 w-3.5" /> Schemas
              <Badge variant="secondary" className="text-[9px] px-1 py-0">{totalSchemas}</Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Plugins Tab */}
        <TabsContent value="plugins" className="flex-1 overflow-y-auto mt-0 p-3">
          <div className="grid grid-cols-4 gap-2 mb-3">
            <div className="bg-background/50 border border-border/50 rounded p-2">
              <div className="text-[10px] text-muted-foreground uppercase">Installed</div>
              <div className="text-lg font-bold font-mono text-foreground">{mockPlugins.length}</div>
            </div>
            <div className="bg-background/50 border border-border/50 rounded p-2">
              <div className="text-[10px] text-muted-foreground uppercase">Active</div>
              <div className="text-lg font-bold font-mono text-success">{activePlugins}</div>
            </div>
            <div className="bg-background/50 border border-border/50 rounded p-2">
              <div className="text-[10px] text-muted-foreground uppercase">Schemas</div>
              <div className="text-lg font-bold font-mono text-foreground">{totalSchemas}</div>
            </div>
            <div className="bg-background/50 border border-border/50 rounded p-2">
              <div className="text-[10px] text-muted-foreground uppercase">Updates</div>
              <div className="text-lg font-bold font-mono text-warning">3</div>
            </div>
          </div>

          <div className="space-y-2">
            {mockPlugins.map((plugin) => (
              <div key={plugin.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-border transition-colors">
                <div className="flex items-center gap-3">
                  <Puzzle className="h-4 w-4 text-primary" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium text-foreground">{plugin.name}</span>
                      <span className="text-[10px] text-muted-foreground">v{plugin.version}</span>
                      <Badge variant="outline" className="text-[9px]">{plugin.schemas.length} schemas</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{plugin.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full",
                    plugin.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                  )}>
                    {plugin.status === 'active' ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                    {plugin.status}
                  </span>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Settings className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Schemas Tab */}
        <TabsContent value="schemas" className="flex-1 overflow-y-auto mt-0">
          <div className="divide-y divide-border">
            {mockPlugins.map((plugin) => (
              <div key={plugin.name}>
                <div className="px-4 py-2 bg-muted/20 flex items-center gap-2">
                  <Puzzle className="h-3 w-3 text-primary" />
                  <span className="text-xs font-semibold text-foreground font-mono">{plugin.name}</span>
                  <Badge variant="outline" className="text-[9px]">{plugin.schemas.length}</Badge>
                </div>
                {plugin.schemas.map((schema) => {
                  const key = `${plugin.name}.${schema.name}`;
                  const isExpanded = expandedSchemas.has(key);
                  return (
                    <div key={key}>
                      <button
                        onClick={() => toggleSchema(key)}
                        className="w-full flex items-center gap-2 px-4 pl-8 py-1.5 hover:bg-muted/30 transition-colors text-left"
                      >
                        {isExpanded ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                        <FileJson className="h-3 w-3 text-primary" />
                        <span className="text-xs font-mono text-foreground">{schema.name}</span>
                        <Badge variant="secondary" className="text-[9px] ml-1">{schema.type}</Badge>
                        <span className="text-[10px] text-muted-foreground ml-auto">{schema.fields.length} fields</span>
                      </button>
                      {isExpanded && (
                        <div className="bg-background/50 border-y border-border/30">
                          <div className="px-4 pl-16 py-1 grid grid-cols-3 text-[9px] uppercase text-muted-foreground font-semibold border-b border-border/30">
                            <span>Field</span><span>Type</span><span>Required</span>
                          </div>
                          {schema.fields.map((field) => (
                            <div key={field.name} className="px-4 pl-16 py-1 grid grid-cols-3 text-xs font-mono hover:bg-muted/20">
                              <span className="text-foreground">{field.name}</span>
                              <span className="text-primary">{field.type}</span>
                              <span className={field.required ? 'text-warning' : 'text-muted-foreground'}>{field.required ? 'yes' : 'no'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

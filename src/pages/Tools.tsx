import { useEffect, useMemo, useState } from 'react';
import { Wrench, Search, ChevronRight, ChevronDown, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { apiGet } from '@/lib/backend';
import { cn } from '@/lib/utils';

interface ToolItem {
  name: string;
  category: string;
  description: string;
  plugin?: string;
}

interface ToolsResponse {
  tools: ToolItem[];
  count: number;
}

function derivePlugin(tool: ToolItem): string {
  if (tool.plugin) return tool.plugin;
  const name = tool.name;
  if (name.startsWith('dbus.') || name.includes('org.')) return 'dbus';
  if (name.startsWith('systemd.') || name.includes('service')) return 'systemd';
  if (name.startsWith('ovs.') || name.includes('bridge')) return 'ovs';
  if (name.startsWith('net.') || name.includes('network') || name.includes('wireguard')) return 'network';
  if (name.startsWith('file.') || name.includes('read') || name.includes('write')) return 'filesystem';
  if (name.startsWith('agent.') || name.includes('agent')) return 'agents';
  return tool.category || 'other';
}

export default function Tools() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPlugins, setExpandedPlugins] = useState<Set<string>>(new Set());
  const [selectedTool, setSelectedTool] = useState<ToolItem | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await apiGet<ToolsResponse>('/api/tools');
        setTools(data.tools || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tools');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredTools = useMemo(
    () => tools.filter((t) =>
      !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase())
      || t.description.toLowerCase().includes(searchQuery.toLowerCase())
      || derivePlugin(t).toLowerCase().includes(searchQuery.toLowerCase()),
    ),
    [tools, searchQuery],
  );

  const grouped = useMemo(() => {
    const map: Record<string, ToolItem[]> = {};
    for (const t of filteredTools) {
      const plugin = derivePlugin(t);
      (map[plugin] ??= []).push(t);
    }
    return Object.entries(map).sort((a, b) => b[1].length - a[1].length);
  }, [filteredTools]);

  const togglePlugin = (plugin: string) => {
    setExpandedPlugins(prev => {
      const next = new Set(prev);
      next.has(plugin) ? next.delete(plugin) : next.add(plugin);
      return next;
    });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top bar: search + selected tool detail */}
      <div className="border-b border-border bg-card p-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0 w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tools..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="text-xs text-muted-foreground font-mono shrink-0">
            {filteredTools.length} / {tools.length} tools
          </div>

          {/* Selected tool info */}
          {selectedTool && (
            <div className="flex-1 flex items-center gap-3 ml-4 min-w-0">
              <div className="h-5 w-px bg-border shrink-0" />
              <Wrench className="h-4 w-4 text-primary shrink-0" />
              <span className="font-mono text-sm text-foreground truncate">{selectedTool.name}</span>
              <Badge variant="secondary" className="text-[10px] shrink-0">{derivePlugin(selectedTool)}</Badge>
              <span className="text-xs text-muted-foreground truncate flex-1">{selectedTool.description}</span>
              <button onClick={() => setSelectedTool(null)} className="text-muted-foreground hover:text-foreground shrink-0">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main content: expandable plugin groups */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading tools...</div>
        ) : error ? (
          <div className="p-6 text-sm text-destructive">{error}</div>
        ) : grouped.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">No tools found</div>
        ) : (
          <div className="divide-y divide-border">
            {grouped.map(([plugin, pluginTools]) => {
              const isExpanded = expandedPlugins.has(plugin);
              return (
                <div key={plugin}>
                  {/* Plugin header */}
                  <button
                    onClick={() => togglePlugin(plugin)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors text-left"
                  >
                    {isExpanded
                      ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                      : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    }
                    <span className="text-sm font-semibold text-foreground capitalize">{plugin}</span>
                    <Badge variant="outline" className="text-[10px] font-mono">{pluginTools.length}</Badge>
                  </button>

                  {/* Expanded tool list */}
                  {isExpanded && (
                    <div className="bg-background/50">
                      {pluginTools.map((tool) => (
                        <button
                          key={tool.name}
                          onClick={() => setSelectedTool(tool)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 pl-10 py-1.5 text-left hover:bg-muted/50 transition-colors",
                            selectedTool?.name === tool.name && "bg-primary/10 border-l-2 border-primary"
                          )}
                        >
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full shrink-0",
                            selectedTool?.name === tool.name ? "bg-primary" : "bg-muted-foreground/50"
                          )} />
                          <span className="font-mono text-xs text-foreground truncate">{tool.name}</span>
                          <span className="text-[10px] text-muted-foreground truncate flex-1">{tool.description}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

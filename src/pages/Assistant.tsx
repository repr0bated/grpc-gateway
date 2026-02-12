import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  method: string;
  status: 'pending' | 'success' | 'error';
  duration?: number;
}

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I\'m your OP-DBUS assistant. I can help you manage services, configure policies, and navigate the system. What would you like to do?' }
  ]);
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const methods = ['tools/list', 'tools/call', 'dbus.inspect', 'systemd.status', 'agent.run', 'network.scan'];
    const interval = setInterval(() => {
      const method = methods[Math.floor(Math.random() * methods.length)];
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setLogs(prev => [...prev.slice(-100), { id, timestamp: new Date(), method, status: 'pending' }]);
      setTimeout(() => {
        setLogs(prev => prev.map(l => l.id === id ? {
          ...l, status: Math.random() > 0.1 ? 'success' as const : 'error' as const,
          duration: Math.floor(Math.random() * 500) + 10,
        } : l));
      }, Math.random() * 2000 + 200);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I understand you want to: ' + input + '. Let me help you with that. This feature is coming soon!'
      }]);
    }, 500);
    setInput('');
  };

  const successCount = logs.filter(l => l.status === 'success').length;
  const errorCount = logs.filter(l => l.status === 'error').length;

  return (
    <div className="p-4 h-full flex flex-col">
      <Tabs defaultValue="chat" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-fit mb-3">
          <TabsTrigger value="chat" className="gap-2">
            <Bot className="h-4 w-4" /> Chat
          </TabsTrigger>
          <TabsTrigger value="log" className="gap-2">
            <Activity className="h-4 w-4" /> Streaming Log
            {logs.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">{logs.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden mt-0">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader className="border-b border-border py-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">OP-DBUS Assistant</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((message, idx) => (
                  <div key={idx} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Bot className="h-3.5 w-3.5 text-primary" />
                      </div>
                    )}
                    <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                      message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      {message.content}
                    </div>
                    {message.role === 'user' && (
                      <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center shrink-0">
                        <User className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Ask me anything about your system..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="flex-1"
                  />
                  <Button onClick={handleSend} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="log" className="flex-1 flex flex-col overflow-hidden mt-0">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader className="border-b border-border py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">JSON-RPC Streaming Log</CardTitle>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-success">✓ {successCount}</span>
                  <span className="text-destructive">✗ {errorCount}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0 font-mono text-xs">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center gap-3 px-4 py-1.5 border-b border-border/50 hover:bg-muted/50">
                  <span className="text-muted-foreground w-20 shrink-0">{log.timestamp.toLocaleTimeString()}</span>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    log.status === 'success' ? 'bg-success' : log.status === 'error' ? 'bg-destructive' : 'bg-warning animate-pulse'
                  }`} />
                  <span className="text-foreground flex-1 truncate">{log.method}</span>
                  {log.duration && <span className="text-muted-foreground shrink-0">{log.duration}ms</span>}
                </div>
              ))}
              <div ref={logEndRef} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

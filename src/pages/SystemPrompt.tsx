import { useState } from "react";
import { FileText } from "lucide-react";

const mockImmutablePrompt = `## Core Identity
You are OP-DBUS, a Linux system administration assistant with direct D-Bus access.

## Safety Invariants
- NEVER execute destructive commands without explicit confirmation
- ALWAYS verify service states before modification
- REFUSE to disable security-critical services
- LOG all tool executions for audit

## Tool Access
You have access to systemd, NetworkManager, OVS, and WireGuard via D-Bus.`;

const mockTunablePrompt = `## Current Context
- Environment: Production
- Verbosity: Normal
- Confirmation required for: service restarts, network changes

## Active Plugins
- systemd-manager
- network-controller
- ovs-bridge-manager
- wireguard-tunnel`;

export default function SystemPrompt() {
  const [immutable] = useState(mockImmutablePrompt);
  const [tunable, setTunable] = useState(mockTunablePrompt);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSave = () => {
    setIsSaving(true);
    setSaveStatus(null);

    // Simulate save
    setTimeout(() => {
      setSaveStatus("✓ Saved");
      setIsSaving(false);

      setTimeout(() => setSaveStatus(null), 2000);
    }, 500);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-card/50">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-3">
          <FileText className="h-5 w-5 text-primary" />
          System Prompt Configuration
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          The cognitive contract governing OP-DBUS chatbot behavior
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Immutable Section */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-background/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              <h3 className="text-sm font-semibold text-foreground">
                Immutable Core
              </h3>
            </div>
            <span className="text-[10px] bg-destructive/20 text-destructive px-2 py-0.5 rounded border border-destructive/30">
              READ-ONLY
            </span>
          </div>
          <div className="p-4">
            <div className="text-xs text-muted-foreground mb-2">
              These invariants cannot be modified at runtime. They define the
              fundamental contract.
            </div>
            <pre className="bg-background border border-border rounded p-4 text-xs font-mono text-foreground/80 whitespace-pre-wrap overflow-x-auto">
              {immutable}
            </pre>
          </div>
        </div>

        {/* Tunable Section */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-background/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success" />
              <h3 className="text-sm font-semibold text-foreground">
                Tunable Context
              </h3>
            </div>
            <span className="text-[10px] bg-success/20 text-success px-2 py-0.5 rounded border border-success/30">
              EDITABLE
            </span>
          </div>
          <div className="p-4">
            <div className="text-xs text-muted-foreground mb-2">
              Runtime context that can be adjusted. Changes take effect on next
              chat session.
            </div>
            <textarea
              className="w-full bg-background border border-border rounded p-4 text-xs font-mono text-foreground resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              rows={10}
              value={tunable}
              onChange={(e) => setTunable(e.target.value)}
            />
            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Supports markdown formatting
              </div>
              <div className="flex items-center gap-3">
                {saveStatus && (
                  <span className="text-xs text-success">{saveStatus}</span>
                )}
                <button
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium rounded transition-colors disabled:opacity-50"
                  disabled={isSaving}
                  onClick={handleSave}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-background/50">
            <h3 className="text-sm font-semibold text-foreground">
              Combined Prompt Preview
            </h3>
          </div>
          <div className="p-4">
            <div className="bg-background border border-border rounded p-4 text-xs font-mono text-muted-foreground whitespace-pre-wrap max-h-48 overflow-y-auto">
              {immutable}
              {"\n\n---\n\n"}
              {tunable}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

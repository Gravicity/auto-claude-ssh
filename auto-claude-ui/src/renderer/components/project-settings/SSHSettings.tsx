import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Server,
  CheckCircle2,
  AlertCircle,
  Loader2,
  HelpCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '../ui/tooltip';
import type {
  Project,
  ProjectSettings as ProjectSettingsType,
  SSHConnectionStatus
} from '../../../shared/types';

interface SSHSettingsProps {
  project: Project;
  settings: ProjectSettingsType;
  setSettings: React.Dispatch<React.SetStateAction<ProjectSettingsType>>;
  expanded: boolean;
  onToggle: () => void;
}

export function SSHSettings({
  project,
  settings,
  setSettings,
  expanded,
  onToggle
}: SSHSettingsProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<SSHConnectionStatus | null>(null);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setConnectionStatus(null);
    try {
      const result = await window.electronAPI.testSSHConnection(project.path);
      setConnectionStatus(result);
    } catch (err) {
      setConnectionStatus({
        connected: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const updateSSHConfig = (field: string, value: string | number) => {
    setSettings({
      ...settings,
      sshConfig: {
        host: settings.sshConfig?.host || '',
        remotePath: settings.sshConfig?.remotePath || '',
        ...settings.sshConfig,
        [field]: value
      }
    });
    // Clear status when config changes
    setConnectionStatus(null);
  };

  return (
    <section className="space-y-4">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 w-full text-left"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        <Server className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">
          SSH Remote Execution
        </h3>
        {settings.sshEnabled && settings.sshConfig?.host && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-2">
            {settings.sshConfig.host}
          </span>
        )}
      </button>

      {expanded && (
        <div className="space-y-4 pl-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="font-medium text-foreground">Enable SSH Remote Execution</Label>
              <p className="text-xs text-muted-foreground">
                Run agent tasks on a remote server via SSH
              </p>
            </div>
            <Switch
              checked={settings.sshEnabled || false}
              onCheckedChange={(checked) => {
                setSettings({ ...settings, sshEnabled: checked });
                setConnectionStatus(null);
              }}
            />
          </div>

          {settings.sshEnabled && (
            <div className="space-y-4 rounded-lg border border-border bg-muted/50 p-4">
              {/* SSH Host */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="ssh-host" className="text-sm font-medium">
                    SSH Host
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-xs">
                          SSH host alias (e.g., "my-server", "build-box") or full address (e.g., "user@server.com")
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="ssh-host"
                  placeholder="my-server, build-box, or user@hostname"
                  value={settings.sshConfig?.host || ''}
                  onChange={(e) => updateSSHConfig('host', e.target.value)}
                />
              </div>

              {/* Remote Project Path */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="remote-path" className="text-sm font-medium">
                    Remote Project Path
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-xs">
                          Absolute path to the project on the remote server
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="remote-path"
                  placeholder="/home/user/projects/my-app"
                  value={settings.sshConfig?.remotePath || ''}
                  onChange={(e) => updateSSHConfig('remotePath', e.target.value)}
                />
              </div>

              {/* Advanced Settings - collapsed by default */}
              <details className="text-sm">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  Advanced Settings
                </summary>
                <div className="mt-3 space-y-4 pl-2 border-l-2 border-border">
                  {/* SSH Port */}
                  <div className="space-y-2">
                    <Label htmlFor="ssh-port" className="text-sm font-medium">
                      SSH Port
                    </Label>
                    <Input
                      id="ssh-port"
                      type="number"
                      placeholder="22"
                      value={settings.sshConfig?.port || ''}
                      onChange={(e) => updateSSHConfig('port', parseInt(e.target.value) || 22)}
                      className="w-24"
                    />
                  </div>

                  {/* Identity File */}
                  <div className="space-y-2">
                    <Label htmlFor="identity-file" className="text-sm font-medium">
                      Identity File
                    </Label>
                    <Input
                      id="identity-file"
                      placeholder="~/.ssh/id_ed25519"
                      value={settings.sshConfig?.identityFile || ''}
                      onChange={(e) => updateSSHConfig('identityFile', e.target.value)}
                    />
                  </div>

                  {/* Remote Python Command */}
                  <div className="space-y-2">
                    <Label htmlFor="remote-python" className="text-sm font-medium">
                      Remote Python Command
                    </Label>
                    <Input
                      id="remote-python"
                      placeholder="python3"
                      value={settings.sshConfig?.remotePythonCommand || ''}
                      onChange={(e) => updateSSHConfig('remotePythonCommand', e.target.value)}
                    />
                  </div>

                  {/* Connection Timeout */}
                  <div className="space-y-2">
                    <Label htmlFor="timeout" className="text-sm font-medium">
                      Connection Timeout (seconds)
                    </Label>
                    <Input
                      id="timeout"
                      type="number"
                      placeholder="10"
                      value={settings.sshConfig?.connectionTimeout || ''}
                      onChange={(e) => updateSSHConfig('connectionTimeout', parseInt(e.target.value) || 10)}
                      className="w-24"
                    />
                  </div>
                </div>
              </details>

              {/* Test Connection Button */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestConnection}
                  disabled={isTesting || !settings.sshConfig?.host || !settings.sshConfig?.remotePath}
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    'Test Connection'
                  )}
                </Button>

                {/* Connection Status */}
                {connectionStatus && (
                  <div className={`flex items-center gap-2 text-sm ${
                    connectionStatus.connected ? 'text-success' : 'text-destructive'
                  }`}>
                    {connectionStatus.connected ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>
                          Connected to {connectionStatus.host}
                          {connectionStatus.latencyMs && ` (${connectionStatus.latencyMs}ms)`}
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4" />
                        <span>{connectionStatus.error}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

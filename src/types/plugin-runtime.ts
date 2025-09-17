import { PluginConfigField, PluginManifest } from "./schemas";

export interface PluginRuntime {
  id: string;
  manifest: PluginManifest;
  files: Map<string, string>; // filename -> file content
  component?: React.ComponentType<any>;
  apiHandlers?: Map<string, (...args: any[]) => any>;
  configSchema?: Record<string, PluginConfigField>;
  status: 'loading' | 'ready' | 'error';
  error?: string;
  loadedAt?: string; // ISO timestamp when plugin was loaded
}

export interface PluginWidgetProps {
  config: Record<string, any>;
  onConfigChange?: (config: Record<string, any>) => void;
  onRemove?: () => void;
  size: 'small' | 'medium' | 'large';
  pluginApi: PluginAPI;
}

export interface PluginAPI {
  // Storage API for plugin data
  storage: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<void>;
    delete: (key: string) => Promise<void>;
  };

  // HTTP API for external requests
  http: {
    get: (url: string, options?: RequestInit) => Promise<Response>;
    post: (url: string, data: any, options?: RequestInit) => Promise<Response>;
  };

  // Notifications API
  notifications: {
    show: (notification: {
      title: string;
      message: string;
      color?: string;
    }) => void;
  };

  // User context
  user: {
    id: string;
    email: string;
    token: string;
  };
}

export interface PluginUploadResult {
  success: boolean;
  pluginId?: string;
  manifest?: PluginManifest;
  error?: string;
  requiresApproval?: boolean;
}

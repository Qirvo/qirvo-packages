/**
 * Runtime Environment Detection and Plugin Execution Strategy
 *
 * Handles the differences between Edge Runtime (Vercel) and Node.js Runtime
 * for plugin execution and dynamic code evaluation.
 */

export type RuntimeEnvironment = 'edge' | 'nodejs' | 'unknown';

/**
 * Detect the current runtime environment
 */
export function detectRuntime(): RuntimeEnvironment {
  // Check Next.js runtime environment variable first
  if (process.env.NEXT_RUNTIME === 'edge') {
    return 'edge';
  }

  // Check for Edge Runtime indicators
  if (typeof globalThis !== 'undefined' && 'EdgeRuntime' in globalThis) {
    return 'edge';
  }

  // Check for Node.js specific globals
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    return 'nodejs';
  }

  // Fallback for browser/unknown environments
  return 'unknown';
}

/**
 * Check if dynamic code evaluation is supported
 */
export function isDynamicCodeSupported(): boolean {
  const runtime = detectRuntime();
  return runtime === 'nodejs';
}

/**
 * Plugin execution capabilities based on runtime
 */
export interface RuntimeCapabilities {
  canExecutePlugins: boolean;
  canLoadDynamicComponents: boolean;
  canUseEval: boolean;
  supportedFeatures: string[];
  limitations: string[];
}

/**
 * Get runtime capabilities for plugin system
 */
export function getRuntimeCapabilities(): RuntimeCapabilities {
  const runtime = detectRuntime();

  switch (runtime) {
    case 'nodejs':
      return {
        canExecutePlugins: true,
        canLoadDynamicComponents: true,
        canUseEval: true,
        supportedFeatures: [
          'Dynamic plugin loading',
          'Component evaluation',
          'Hot reloading',
          'Plugin sandboxing',
          'Full marketplace functionality'
        ],
        limitations: []
      };

    case 'edge':
      return {
        canExecutePlugins: false,
        canLoadDynamicComponents: false,
        canUseEval: false,
        supportedFeatures: [
          'Plugin metadata access',
          'Static plugin information',
          'Plugin marketplace browsing',
          'Installation management'
        ],
        limitations: [
          'No dynamic code execution',
          'No component rendering',
          'No plugin sandboxing',
          'Limited to static operations'
        ]
      };

    default:
      return {
        canExecutePlugins: false,
        canLoadDynamicComponents: false,
        canUseEval: false,
        supportedFeatures: ['Basic plugin metadata'],
        limitations: ['Unknown runtime environment']
      };
  }
}

/**
 * Runtime-aware plugin execution wrapper
 */
export class RuntimeAwarePluginExecutor {
  private capabilities: RuntimeCapabilities;

  constructor() {
    this.capabilities = getRuntimeCapabilities();
  }

  /**
   * Check if plugin execution is supported
   */
  canExecute(): boolean {
    return this.capabilities.canExecutePlugins;
  }

  /**
   * Get execution error message for unsupported runtime
   */
  getUnsupportedMessage(): string {
    const runtime = detectRuntime();
    return `Plugin execution not supported in ${runtime} runtime. Limitations: ${this.capabilities.limitations.join(', ')}`;
  }

  /**
   * Execute plugin with runtime awareness
   */
  async executePlugin<T>(
    pluginCode: string,
    context: any,
    fallback?: () => Promise<T>
  ): Promise<T> {
    if (!this.canExecute()) {
      if (fallback) {
        return await fallback();
      }
      throw new Error(this.getUnsupportedMessage());
    }

    // Only execute in Node.js runtime
    return eval(pluginCode)(context);
  }

  /**
   * Get supported operations for current runtime
   */
  getSupportedOperations(): string[] {
    return this.capabilities.supportedFeatures;
  }
}

export const runtimeExecutor = new RuntimeAwarePluginExecutor();

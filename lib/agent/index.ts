import { claudeProvider } from './claude';

/**
 * Lazily-loaded providers — only imported when their env var is set.
 * This keeps the default qwen path lean.
 */

let _qwenProvider: import('./types').AgentProvider | null = null;
async function loadQwenProvider(): Promise<import('./types').AgentProvider> {
  if (!_qwenProvider) {
    const mod = await import('./qwen');
    _qwenProvider = mod.qwenProvider;
  }
  return _qwenProvider;
}

let _provider: import('./types').AgentProvider | null = null;

/**
 * Returns the configured agent provider (singleton).
 *
 * Provider selection order:
 *   1. AGENT_PROVIDER env var (qwen | claude | openai)
 *   2. Default: qwen
 */
export async function getAgent(): Promise<import('./types').AgentProvider> {
  if (_provider) return _provider;

  const providerName = (process.env.AGENT_PROVIDER ?? 'qwen').toLowerCase();

  switch (providerName) {
    case 'claude': {
      const { claudeProvider } = await import('./claude');
      _provider = claudeProvider;
      break;
    }
    case 'openai': {
      const { openaiProvider } = await import('./openai');
      _provider = openaiProvider;
      break;
    }
    case 'qwen': {
      _provider = await loadQwenProvider();
      break;
    }
    default:
      throw new Error(
        `Unknown AGENT_PROVIDER "${providerName}". Supported: claude, openai, qwen. ` +
          `Set AGENT_PROVIDER in .env.local.`
      );
  }
  return _provider;
}

/**
 * Synchronous variant — works only when the provider is already cached
 * (after the first async getAgent() call) or falls back to claude.
 * For cold starts (serverless / first request), always use getAgent().
 */
export function getAgentSync(): import('./types').AgentProvider {
  if (_provider) return _provider;
  _provider = claudeProvider;
  return _provider;
}

export type {
  AgentProvider,
  AgentMessage,
  AgentStreamCallbacks,
  RunStreamParams,
  ToolSpec,
  ToolExecutor,
  ToolExecutionResult,
} from './types';

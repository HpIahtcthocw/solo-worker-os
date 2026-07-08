import type { AgentProvider, RunStreamParams } from './types';

/**
 * Example stub for an OpenAI (or any OpenAI-compatible) provider.
 *
 * This is intentionally left unimplemented to demonstrate the provider seam.
 * To activate:
 *   1. `npm install openai`
 *   2. Implement `runStream` below following the Claude provider pattern:
 *      - stream `chat.completions.create({ stream: true, tools: [...] })`
 *      - on `tool_calls`, call `params.executeTool(name, args)`
 *      - append the tool result as a `{ role: 'tool', tool_call_id, content }` message
 *      - loop until no more tool calls
 *      - forward text deltas via `params.callbacks.onText`
 *   3. Set `AGENT_PROVIDER=openai` (and `OPENAI_API_KEY`) in your env.
 */
export const openaiProvider: AgentProvider = {
  name: 'openai',
  async runStream(_params: RunStreamParams): Promise<string> {
    throw new Error(
      'OpenAI agent provider is not implemented yet. See lib/agent/openai.ts for instructions. ' +
        'Set AGENT_PROVIDER=claude (default) to use the Claude provider.'
    );
  },
};

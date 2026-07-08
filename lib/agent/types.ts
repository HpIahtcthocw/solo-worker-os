/**
 * Provider-neutral agent abstraction.
 *
 * Any LLM provider (Claude, OpenAI, a local model, etc.) implements the
 * `AgentProvider` interface and is wired in via `lib/agent/index.ts`.
 * The provider owns its own message format and agentic tool-call loop, and
 * invokes the shared `executeTool` callback (injected per call) to actually
 * run tools — so tool definitions and database side effects stay provider-neutral.
 */

/** Provider-neutral tool definition (JSON-schema based input). */
export interface ToolSpec {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

/** A simple user/assistant text message. */
export interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** Result returned by executing a tool, consumed by both UI and provider. */
export interface ToolExecutionResult {
  /** Text fed back to the model as the tool result. */
  toolResult: string;
  /** Short human label shown in the UI tool chip. */
  clientSummary: string;
  /** Optional long text streamed to the user (contracts / follow-ups). */
  displayText?: string;
}

/** Function that actually runs a tool (DB writes, template generation, etc.). */
export type ToolExecutor = (
  name: string,
  input: Record<string, unknown>
) => Promise<ToolExecutionResult>;

/** Callbacks used to stream output to the UI while the agent runs. */
export interface AgentStreamCallbacks {
  onText: (delta: string) => void;
  onTool?: (name: string, summary: string) => void;
}

export interface RunStreamParams {
  system: string;
  messages: AgentMessage[];
  tools: ToolSpec[];
  executeTool: ToolExecutor;
  callbacks: AgentStreamCallbacks;
}

/** A pluggable agent provider. */
export interface AgentProvider {
  readonly name: string;
  /**
   * Run the agentic streaming loop: stream tokens to `callbacks.onText`,
   * execute any tool calls via `params.executeTool`, feed results back to the
   * model, and repeat until the model stops calling tools. Returns the full
   * text that was shown to the user (for persistence).
   */
  runStream(params: RunStreamParams): Promise<string>;
}

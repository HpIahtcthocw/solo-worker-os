import type { AgentProvider, RunStreamParams } from './types';

/**
 * Qwen Cloud (DashScope) agent provider.
 *
 * Uses DashScope's OpenAI-compatible mode:
 *   POST https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
 *
 * Supported models: qwen-turbo, qwen-plus, qwen-max, etc.
 *
 * This file is ONLY loaded when AGENT_PROVIDER=qwen.
 * The existing claude.ts and all downstream code remain untouched.
 */

const MODEL = process.env.QWEN_MODEL ?? 'qwen-plus';
const MAX_TOKENS = 4096;
const MAX_ITERATIONS = 6;
const API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

let _client: { apiKey: string } | null = null;

function getClient(): { apiKey: string } {
  if (_client) return _client;
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Missing DASHSCOPE_API_KEY. Set it in your .env.local or .env.competition file.'
    );
  }
  _client = { apiKey };
  return _client;
}

// ──────────────────────────────────────────────────────────────
// Message format helpers
// ──────────────────────────────────────────────────────────────

interface QwenMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string | QwenContentPart[];
  tool_calls?: QwenToolCallPart[];
}

interface QwenContentPart {
  type: 'text';
  text: string;
}

interface QwenToolCallPart {
  type: 'function';
  id: string;
  function: {
    name: string;
    arguments: string;
  };
}

/**
 * Normalize a provider-neutral message into Qwen/OpenAI format.
 *
 * The agent layer sends messages with:
 *   - role: 'user' | 'assistant'
 *   - content: string  (for user turns)
 *   - content: Anthropic-style content[] (for assistant turns with tool calls)
 *
 * This function converts both to the OpenAI chat.completions format:
 *   - user: { role: 'user', content: string }
 *   - assistant with text: { role: 'assistant', content: string }
 *   - assistant with tool calls: { role: 'assistant', content: [{type:'text'},...], tool_calls: [...] }
 *   - tool results: { role: 'tool', content: [{type:'text', text: '...', tool_call_id: '...'}] }
 */
function toQwenMessage(msg: { role: string; content: unknown }): QwenMessage {
  if (msg.role === 'user') {
    return { role: 'user', content: String(msg.content ?? '') };
  }

  if (msg.role === 'assistant') {
    const raw = msg.content;

    // Plain string → simple assistant message
    if (typeof raw === 'string') {
      return { role: 'assistant', content: raw };
    }

    // Anthropic content blocks array → OpenAI format
    if (Array.isArray(raw)) {
      const textParts: string[] = [];
      const toolCalls: QwenToolCallPart[] = [];

      for (const block of raw as Array<Record<string, unknown>>) {
        if (block.type === 'text' && typeof block.text === 'string') {
          textParts.push(block.text);
        } else if (block.type === 'tool_use') {
          toolCalls.push({
            type: 'function',
            id: String(block.id ?? ''),
            function: {
              name: String(block.name ?? ''),
              arguments: JSON.stringify((block.input as Record<string, unknown>) ?? {}),
            },
          });
        }
      }

      const content = textParts.length > 0 ? textParts.join('') : '';

      if (toolCalls.length > 0) {
        return { role: 'assistant', content, tool_calls: toolCalls };
      }
      return { role: 'assistant', content };
    }

    return { role: 'assistant', content: String(raw) };
  }

  // tool role — convert from Anthropic tool_result blocks
  if (msg.role === 'tool') {
    const raw = msg.content;
    let text = '';

    if (typeof raw === 'string') {
      text = raw;
    } else if (Array.isArray(raw)) {
      // Anthropic tool_result blocks: { type: 'tool_result', content: '...', tool_use_id: '...' }
      text = (raw as Array<Record<string, unknown>>)
        .map((block) => {
          if (typeof block.content === 'string') return block.content;
          if (block.content && typeof block.content === 'object') {
            const cb = block.content as Record<string, unknown>;
            if (cb.type === 'text') return String(cb.text ?? '');
          }
          return JSON.stringify(block);
        })
        .join('\n');
    }

    return {
      role: 'tool',
      content: [{ type: 'text', text } as QwenContentPart],
    };
  }

  // system or unknown
  return { role: 'user' as const, content: String(msg.content ?? '') };
}

// ──────────────────────────────────────────────────────────────
// Streaming
// ──────────────────────────────────────────────────────────────

interface QwenStreamChoice {
  delta: {
    content?: string;
    tool_calls?: Array<{
      index: number;
      id?: string;
      type?: string;
      function?: { name?: string; arguments?: string };
    }>;
  };
  finish_reason?: string;
}

interface QwenStreamEvent {
  choices: QwenStreamChoice[];
}

/**
 * Stream a single chat.completions call to Qwen.
 * Accumulates text deltas and buffers tool_calls across chunks.
 */
async function streamMessage(
  system: string,
  messages: QwenMessage[],
  tools: { name: string; description: string; input_schema: Record<string, unknown> }[],
  onText: (delta: string) => void
): Promise<{
  text: string;
  toolUses: { id: string; name: string; input: Record<string, unknown> }[];
  finishReason: string | null;
}> {
  const { apiKey } = getClient();

  const openaiTools = tools.map((t) => ({
    type: 'function' as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.input_schema,
    },
  }));

  // Build OpenAI-format messages
  const serializedMessages = messages.map((m) => {
    const msgWithCalls = m as QwenMessage & { tool_calls?: QwenToolCallPart[] };
    const hasToolCalls = Array.isArray(msgWithCalls.tool_calls) && msgWithCalls.tool_calls.length > 0;

    // Extract text from content (handles both string and content-block array)
    let contentStr: string;
    if (typeof m.content === 'string') {
      contentStr = m.content;
    } else if (Array.isArray(m.content)) {
      contentStr = (m.content as unknown as Array<Record<string, unknown>>)
        .filter((b) => b.type === 'text' && typeof b.text === 'string')
        .map((b) => b.text as string)
        .join('');
    } else {
      contentStr = '';
    }

    const base: Record<string, unknown> = {
      role: m.role,
      content: hasToolCalls ? (contentStr || null) : contentStr,
    };
    if (hasToolCalls) {
      base.tool_calls = msgWithCalls.tool_calls;
    }
    return base;
  });

  const body = {
    model: MODEL,
    max_tokens: MAX_TOKENS,
    stream: true,
    system,
    messages: serializedMessages,
    tools: openaiTools.length > 0 ? openaiTools : undefined,
  };

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => 'Unknown error');
    throw new Error(`Qwen API error ${res.status}: ${errText}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body from Qwen API');

  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';
  const toolCallsMap = new Map<number, { id: string; name: string; args: string }>();
  let finishReason: string | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const payload = trimmed.slice(6);
      if (payload === '[DONE]') continue;

      try {
        const event = JSON.parse(payload) as QwenStreamEvent;
        const choice = event.choices?.[0];
        if (!choice) continue;

        const delta = choice.delta;

        // Text delta
        if (delta.content) {
          fullText += delta.content;
          onText(delta.content);
        }

        // Tool call delta — accumulate by index
        if (delta.tool_calls) {
          for (const tc of delta.tool_calls) {
            const idx = tc.index;
            if (!toolCallsMap.has(idx)) {
              toolCallsMap.set(idx, {
                id: tc.id ?? '',
                name: tc.function?.name ?? '',
                args: tc.function?.arguments ?? '',
              });
            } else {
              const existing = toolCallsMap.get(idx)!;
              if (tc.id) existing.id = tc.id;
              if (tc.function?.name) existing.name = tc.function.name;
              if (tc.function?.arguments) existing.args += tc.function.arguments;
            }
          }
        }

        if (choice.finish_reason) finishReason = choice.finish_reason;
      } catch {
        // Skip unparseable lines (heartbeats, comments, etc.)
      }
    }
  }

  const toolUses = [...toolCallsMap.values()]
    .filter((tc) => tc.id && tc.name)
    .map((tc) => ({
      id: tc.id,
      name: tc.name,
      input: (() => {
        try { return JSON.parse(tc.args || '{}'); }
        catch { return {}; }
      })(),
    }));

  return { text: fullText, toolUses, finishReason };
}

// ──────────────────────────────────────────────────────────────
// AgentProvider implementation
// ──────────────────────────────────────────────────────────────

/** Qwen implementation of the AgentProvider interface. */
export const qwenProvider: AgentProvider = {
  name: 'qwen',

  async runStream({ system, messages, tools, executeTool, callbacks }: RunStreamParams) {
    // Convert provider-neutral messages to Qwen/OpenAI format
    const qwenMessages: QwenMessage[] = messages.map(toQwenMessage);

    let allText = '';
    const onText = (delta: string) => {
      allText += delta;
      callbacks.onText(delta);
    };

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const res = await streamMessage(system, qwenMessages, tools, onText);

      // ── Build assistant turn in Anthropic content-block format ──
      // (toQwenMessage converts it for the next API call)
      const assistantBlocks: Array<Record<string, unknown>> = [];

      if (res.text) {
        assistantBlocks.push({ type: 'text', text: res.text });
      }

      for (const tu of res.toolUses) {
        assistantBlocks.push({
          type: 'tool_use',
          id: tu.id,
          name: tu.name,
          input: tu.input,
        });
      }

      // Append to conversation in Anthropic content-block format
      // (toQwenMessage converts it for the next API call)
      qwenMessages.push({ role: 'assistant', content: assistantBlocks } as any);

      // If no tool calls, we're done
      if (res.finishReason !== 'tool_calls' || res.toolUses.length === 0) {
        return allText;
      }

      // ── Execute tools and append results ──
      const toolResultBlocks: Array<{ type: string; content: string; tool_use_id: string }> = [];
      for (const tu of res.toolUses) {
        try {
          const out = await executeTool(tu.name, tu.input);
          callbacks.onTool?.(tu.name, out.clientSummary);
          // Do NOT call onText for tool displayText — causes duplicate messages in chat
          toolResultBlocks.push({
            type: 'tool_result',
            content: out.toolResult,
            tool_use_id: tu.id,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          callbacks.onTool?.(tu.name, `Error: ${message}`);
          toolResultBlocks.push({
            type: 'tool_result',
            content: `Error: ${message}`,
            tool_use_id: tu.id,
          });
        }
      }

      // Append tool results in Anthropic format (toQwenMessage converts for the API)
      qwenMessages.push({ role: 'tool', content: toolResultBlocks } as any);
    }

    return allText;
  },
};

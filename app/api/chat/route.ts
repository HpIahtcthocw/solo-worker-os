import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createServiceClient } from '@/lib/supabase-service';
import { getAgent } from '@/lib/agent';
import type { ToolExecutor } from '@/lib/agent/types';
import { buildSystemPrompt } from '@/lib/agent/prompt';
import {
  executeToolForMode,
  getToolSpecsForMode,
  type CompetitionMode,
} from '@/lib/tools';
import { todayISO } from '@/lib/utils';
import type { Project } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// In-memory rate limiter: max 20 requests per minute per IP
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true, retryAfterMs: 0 };
  }
  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }
  entry.count++;
  return { allowed: true, retryAfterMs: 0 };
}

interface ChatRequestBody {
  messages: { role: 'user' | 'assistant'; content: string }[];
  persist?: boolean;
}

function resolveCompetitionMode(body: ChatRequestBody): CompetitionMode {
  const raw = (body as unknown as { competition_mode?: string }).competition_mode
    ?? process.env.COMPETITION_MODE
    ?? 'default';
  const normalized = raw.toLowerCase();
  if (normalized === 'qwen' || normalized === 'casper') return normalized;
  return 'default';
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';
  const rl = checkRateLimit(ip);
  if (!rl.allowed) {
    return new Response(JSON.stringify({ error: 'Too many requests. Please wait before sending another message.' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)),
      },
    });
  }

  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const incoming = body.messages ?? [];
  const persist = body.persist !== false;
  const competitionMode = resolveCompetitionMode(body);

  // Try to get the authenticated user; fall back to service client for demo mode
  const userClient = createSupabaseServerClient();
  const { data: { user } } = await userClient.auth.getUser().catch(() => ({ data: { user: null } }));
  // Use user client (respects RLS) when logged in, service client otherwise
  const supabase = user ? userClient : createServiceClient();

  const agent = await getAgent();

  // Load current user's projects for system prompt context
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  const system = buildSystemPrompt((projects as Project[]) ?? [], todayISO(), competitionMode);

  const toolSpecs = getToolSpecsForMode(competitionMode);
  const executeToolFn: ToolExecutor = async (name: string, input: Record<string, unknown>): Promise<import('@/lib/agent/types').ToolExecutionResult> => {
    const result = await executeToolForMode(competitionMode, name, input, supabase);
    return result;
  };

  // Persist the latest user message
  const lastUser = [...incoming].reverse().find((m) => m.role === 'user');
  if (persist && lastUser) {
    await supabase.from('messages').insert({
      role: 'user',
      content: lastUser.content,
      project_id: null,
      ...(user && { user_id: user.id }),
    });
  }

  const agentMessages = incoming.map((m) => ({ role: m.role, content: m.content }));

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: unknown) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      try {
        const finalText = await agent.runStream({
          system,
          messages: agentMessages,
          tools: toolSpecs,
          executeTool: executeToolFn,
          callbacks: {
            onText: (delta) => send({ type: 'text', delta }),
            onTool: (name, summary) => send({ type: 'tool', name, summary }),
          },
        });

        if (persist && finalText.trim()) {
          await supabase.from('messages').insert({
            role: 'assistant',
            content: finalText,
            project_id: null,
            ...(user && { user_id: user.id }),
          });
        }
        send({ type: 'done' });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        send({ type: 'error', message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}

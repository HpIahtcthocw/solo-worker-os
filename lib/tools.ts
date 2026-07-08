import { z } from 'zod';
import { SupabaseClient } from '@supabase/supabase-js';
import { createServiceClient } from './supabase-service';
import type { Project } from './types';
import type { ToolSpec, ToolExecutionResult } from './agent/types';
import { searchKnowledge } from './rag';
import { getExchangeRates, getIndustryBenchmarks } from './market-data';

// ─── Zod schemas for every tool input ────────────────────────────────────────
const CreateProjectSchema = z.object({
  client_name:     z.string().min(1).max(100),
  project_type:    z.string().min(1).max(200),
  budget:          z.number().positive().max(10_000_000),
  currency:        z.string().min(2).max(5),
  deadline:        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'deadline must be YYYY-MM-DD'),
  casper_address:  z.string().optional(),
});

const UpdateStatusSchema = z.object({
  project_id: z.string().uuid(),
  status:     z.enum(['active', 'delivered', 'invoiced', 'paid']),
});

const ProjectIdSchema = z.object({
  project_id: z.string().uuid(),
});

const FollowupSchema = z.object({
  project_id: z.string().uuid(),
  tone:       z.enum(['polite', 'firm', 'final_notice']),
});

const SearchKnowledgeSchema = z.object({
  query: z.string().min(1).max(500),
});

const ExchangeRatesSchema = z.object({
  base:    z.string().min(2).max(5),
  targets: z.array(z.string()).optional(),
});

const PricingBenchmarkSchema = z.object({
  category: z.string().min(1).max(200),
});


export const TOOL_SPECS: ToolSpec[] = [
  {
    name: 'create_project',
    description:
      'Create a new project record for a client. Confirm the extracted details with the user before calling this tool.',
    input_schema: {
      type: 'object',
      properties: {
        client_name: { type: 'string', description: "Client's full name." },
        project_type: { type: 'string', description: 'e.g. Logo Design, Website, Consulting.' },
        budget: { type: 'number', description: 'Project budget as a number.' },
        currency: { type: 'string', description: 'ISO 4217 code, e.g. SGD, USD, EUR.' },
        deadline: { type: 'string', description: 'Absolute ISO date YYYY-MM-DD.' },
      },
      required: ['client_name', 'project_type', 'budget', 'currency', 'deadline'],
    },
  },
  {
    name: 'update_project_status',
    description: "Update a project's status. Use the project id from the database context.",
    input_schema: {
      type: 'object',
      properties: {
        project_id: { type: 'string', description: 'UUID of the project (from database context).' },
        status: { type: 'string', enum: ['active', 'delivered', 'invoiced', 'paid'] },
      },
      required: ['project_id', 'status'],
    },
  },
  {
    name: 'generate_contract',
    description: 'Generate a markdown services contract for a project.',
    input_schema: {
      type: 'object',
      properties: {
        project_id: { type: 'string', description: 'UUID of the project (from database context).' },
      },
      required: ['project_id'],
    },
  },
  {
    name: 'generate_followup_message',
    description:
      'Generate a follow-up message to send to a client about an unpaid or overdue project.',
    input_schema: {
      type: 'object',
      properties: {
        project_id: { type: 'string', description: 'UUID of the project (from database context).' },
        tone: { type: 'string', enum: ['polite', 'firm', 'final_notice'] },
      },
      required: ['project_id', 'tone'],
    },
  },
  {
    name: 'search_knowledge_base',
    description:
      'Search the user\'s private knowledge base (past contracts, email templates, pricing notes, client records). Use when the user asks about historical data, e.g. "what did I charge Zhang Zong?" or "find my logo contract template".',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Natural language search query.' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_exchange_rates',
    description:
      'Get live currency exchange rates. Use when helping price a project in a foreign currency or convert between currencies.',
    input_schema: {
      type: 'object',
      properties: {
        base:    { type: 'string', description: 'Base currency ISO code, e.g. USD, CNY, SGD.' },
        targets: {
          type: 'array',
          items: { type: 'string' },
          description: 'Target currency codes to convert to, e.g. ["CNY","EUR","SGD"].',
        },
      },
      required: ['base'],
    },
  },
  {
    name: 'get_pricing_benchmark',
    description:
      'Get industry benchmark rates for freelance services (low / mid / high price ranges). Use when helping the user decide on a project price or validate their quote.',
    input_schema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Service type keyword, e.g. "logo", "website", "copywriting".' },
      },
      required: ['category'],
    },
  },
];

export { ToolExecutionResult };

// ──────────────────────────────────────────────────────────────
// Competition mode extensions (Qwen / Casper hackathons)
// ──────────────────────────────────────────────────────────────

import { executeCasperTool, CASPER_TOOL_SPECS } from './agent/casper/tools';

export type CompetitionMode = 'default' | 'qwen' | 'casper';

export function getToolSpecsForMode(mode: CompetitionMode): ToolSpec[] {
  const base: ToolSpec[] = TOOL_SPECS;
  switch (mode) {
    case 'qwen':   return [...base];
    case 'casper': return [...base, ...CASPER_TOOL_SPECS];
    default:       return base;
  }
}

export async function executeToolForMode(
  mode: CompetitionMode,
  name: string,
  input: Record<string, unknown>,
  supabaseClient?: SupabaseClient,
): Promise<ToolExecutionResult> {
  if (mode === 'casper' && CASPER_TOOL_SPECS.some((t) => t.name === name)) {
    const result = await executeCasperTool(name, input);
    return result;
  }
  return executeTool(name, input, supabaseClient);
}

export async function executeTool(
  name: string,
  input: Record<string, unknown>,
  supabaseClient?: SupabaseClient,
): Promise<ToolExecutionResult> {
  const supabase = supabaseClient ?? createServiceClient();
  // Resolve user ID for attribution; undefined when using service client
  const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
  const userId = authData?.user?.id;

  switch (name) {
    case 'create_project': {
      const parsed = CreateProjectSchema.safeParse(input);
      if (!parsed.success) throw new Error(`Invalid input: ${parsed.error.message}`);
      const row = { ...parsed.data, status: 'active' as const, ...(userId && { user_id: userId }) };
      const { data, error } = await supabase.from('projects').insert(row).select().single();
      if (error) throw new Error(error.message);
      await supabase.from('agent_actions').insert({
        project_id: data.id,
        action_type: 'project_created',
        payload: { ...row, project_id: data.id },
        ...(userId && { user_id: userId }),
      });
      return {
        toolResult: `Project created. project_id=${data.id}. client=${data.client_name}, type=${data.project_type}, budget=${data.budget} ${data.currency}, deadline=${data.deadline}, status=active.`,
        clientSummary: `Created project “${data.project_type}” for ${data.client_name} (${data.budget} ${data.currency}, due ${data.deadline}).`,
      };
    }

    case 'update_project_status': {
      const parsed = UpdateStatusSchema.safeParse(input);
      if (!parsed.success) throw new Error(`Invalid input: ${parsed.error.message}`);
      const { project_id: projectId, status } = parsed.data;
      const { data, error } = await supabase.from('projects').update({ status }).eq('id', projectId).select().single();
      if (error) throw new Error(error.message);
      await supabase.from('agent_actions').insert({
        project_id: data.id,
        action_type: 'status_updated',
        payload: { status },
        ...(userId && { user_id: userId }),
      });
      return {
        toolResult: `Project ${data.id} status updated to ${status}.`,
        clientSummary: `Marked “${data.project_type}” for ${data.client_name} as ${status}.`,
      };
    }

    case 'generate_contract': {
      const parsed = ProjectIdSchema.safeParse(input);
      if (!parsed.success) throw new Error(`Invalid input: ${parsed.error.message}`);
      const { data: p, error } = await supabase.from('projects').select('*').eq('id', parsed.data.project_id).single();
      if (error) throw new Error(error.message);
      const contract = buildContract(p as Project);
      await supabase.from('agent_actions').insert({
        project_id: p.id,
        action_type: 'contract_generated',
        payload: { contract },
        ...(userId && { user_id: userId }),
      });
      return {
        toolResult: 'Contract generated and already displayed to the user verbatim. Do NOT repeat the contract; just confirm in one short sentence.',
        clientSummary: `Drafted a contract for “${p.project_type}” for ${p.client_name}.`,
        displayText: contract,
      };
    }

    case 'generate_followup_message': {
      const parsed = FollowupSchema.safeParse(input);
      if (!parsed.success) throw new Error(`Invalid input: ${parsed.error.message}`);
      const { project_id: projectId, tone } = parsed.data;
      const { data: p, error } = await supabase.from('projects').select('*').eq('id', projectId).single();
      if (error) throw new Error(error.message);
      const message = buildFollowup(p as Project, tone);
      await supabase.from('agent_actions').insert({
        project_id: p.id,
        action_type: 'followup_generated',
        payload: { tone, message },
        ...(userId && { user_id: userId }),
      });
      return {
        toolResult: 'Follow-up message generated and already displayed to the user verbatim. Do NOT repeat it; just confirm in one short sentence.',
        clientSummary: `Generated a ${tone} follow-up for ${p.client_name}.`,
        displayText: message,
      };
    }

    case 'search_knowledge_base': {
      const parsed = SearchKnowledgeSchema.safeParse(input);
      if (!parsed.success) throw new Error(`Invalid input: ${parsed.error.message}`);
      const docs = await searchKnowledge(parsed.data.query, 4, supabase);
      if (docs.length === 0) {
        return {
          toolResult: 'No matching documents found in the knowledge base.',
          clientSummary: `Searched knowledge base for: “${parsed.data.query}” — no results.`,
        };
      }
      const summary = docs.map((d) => `[${d.doc_type}] ${d.title}\n${d.content.slice(0, 500)}`).join('\n\n---\n\n');
      return {
        toolResult: `Found ${docs.length} relevant document(s):\n\n${summary}`,
        clientSummary: `Found ${docs.length} knowledge base entry(ies) for: “${parsed.data.query}”.`,
      };
    }

    case 'get_exchange_rates': {
      const parsed = ExchangeRatesSchema.safeParse(input);
      if (!parsed.success) throw new Error(`Invalid input: ${parsed.error.message}`);
      const base = parsed.data.base.toUpperCase();
      const targets = (parsed.data.targets ?? ['CNY', 'EUR', 'GBP', 'SGD']).map((t) => t.toUpperCase());
      const rates = await getExchangeRates(base, targets);
      const lines = Object.entries(rates.rates).map(([cur, rate]) => `1 ${base} = ${rate.toFixed(4)} ${cur}`).join('\n');
      return {
        toolResult: `Live exchange rates (${rates.date}):\n${lines}`,
        clientSummary: `Fetched ${base} exchange rates vs ${targets.join(', ')}.`,
      };
    }

    case 'get_pricing_benchmark': {
      const parsed = PricingBenchmarkSchema.safeParse(input);
      if (!parsed.success) throw new Error(`Invalid input: ${parsed.error.message}`);
      const benchmarks = getIndustryBenchmarks(parsed.data.category);
      const lines = benchmarks.slice(0, 5).map(
        (b) => `${b.category}: ${b.currency} ${b.low}–${b.mid}–${b.high} per ${b.unit} (${b.notes})`
      ).join('\n');
      return {
        toolResult: `Industry pricing benchmarks for “${parsed.data.category}”:\n${lines}`,
        clientSummary: `Fetched pricing benchmarks for: “${parsed.data.category}”.`,
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function buildContract(p: Project): string {
  const today = new Date().toISOString().slice(0, 10);
  return `# Services Agreement

**Between** the Service Provider (Freelancer) and **${p.client_name}** (Client).

## Project
${p.project_type}

## Compensation
Total fee: **${p.currency} ${Number(p.budget).toFixed(2)}**.

## Timeline
Final delivery / deadline: **${p.deadline}**.

## Terms
1. Scope of work covers the deliverables described as “${p.project_type}”.
2. A 50% deposit may be required before work begins; the balance is due upon delivery.
3. Revisions beyond two rounds are billable at an agreed hourly rate.
4. Either party may terminate with 7 days written notice; work completed up to that point remains billable.
5. Final deliverables transfer to the Client upon receipt of full payment.

## Agreement
This agreement is effective as of ${today}.

— Signed electronically via Solo Worker OS.
`;
}

function buildFollowup(
  p: Project,
  tone: 'polite' | 'firm' | 'final_notice'
): string {
  const opener =
    tone === 'polite'
      ? `Hi ${p.client_name},`
      : tone === 'firm'
        ? `Hello ${p.client_name},`
        : `Dear ${p.client_name},`;

  const body =
    tone === 'polite'
      ? `I hope you're doing well. Just a gentle reminder regarding our project “${p.project_type}” (agreed fee ${p.currency} ${Number(p.budget).toFixed(2)}, due ${p.deadline}). When you have a moment, could you confirm the payment status? Happy to answer any questions. Thanks so much!`
      : tone === 'firm'
        ? `Following up on the project “${p.project_type}” (fee ${p.currency} ${Number(p.budget).toFixed(2)}, due ${p.deadline}). Payment is now overdue. Please arrange payment at your earliest convenience and let me know if there is an issue I should be aware of. I would like to resolve this promptly.`
        : `This is a final notice regarding the outstanding payment of ${p.currency} ${Number(p.budget).toFixed(2)} for “${p.project_type}” (due ${p.deadline}). Despite previous reminders, payment has not been received. Please settle this within 7 days to avoid further action. Contact me immediately if you wish to discuss.`;

  const closer =
    tone === 'polite'
      ? `Warm regards,\nYour Freelancer`
      : `Regards,\nYour Freelancer`;

  return `${opener}\n\n${body}\n\n${closer}`;
}

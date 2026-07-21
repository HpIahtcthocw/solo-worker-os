/**
 * In-memory mock Supabase client for demo mode.
 *
 * Used when DEMO_MODE=true is set in .env.local.
 * Pre-seeds with demo data from supabase/seed.sql.
 * All data is in-memory and resets on server restart.
 */

// ─── In-memory data store ────────────────────────────────────────────────────

const now = new Date().toISOString();
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

interface MockRow {
  [key: string]: unknown;
}

const tables: Record<string, MockRow[]> = {
  projects: [
    { id: 'a1000000-0000-0000-0000-000000000001', client_name: 'Sarah Chen', project_type: 'SaaS Dashboard UI Kit', budget: 4800, currency: 'USD', deadline: '2026-07-20', status: 'invoiced', casper_address: '0106ca7c39cd272dbf21a86eeb3b36b7c26e2e9b94af64292419f7862936bca2', created_at: daysAgo(50), updated_at: daysAgo(11) },
    { id: 'a1000000-0000-0000-0000-000000000002', client_name: 'Marcus Rivera', project_type: 'E-commerce Platform', budget: 15000, currency: 'USD', deadline: '2026-08-15', status: 'active', casper_address: null, created_at: daysAgo(31), updated_at: daysAgo(16) },
    { id: 'a1000000-0000-0000-0000-000000000003', client_name: 'Aiko Tanaka', project_type: 'Brand Identity & Website', budget: 6200, currency: 'USD', deadline: '2026-06-30', status: 'paid', casper_address: null, created_at: daysAgo(67), updated_at: daysAgo(23) },
    { id: 'a1000000-0000-0000-0000-000000000004', client_name: 'James Okafor', project_type: 'Mobile App Backend API', budget: 9000, currency: 'USD', deadline: '2026-07-01', status: 'delivered', casper_address: null, created_at: daysAgo(81), updated_at: daysAgo(22) },
    { id: 'a1000000-0000-0000-0000-000000000005', client_name: 'Elena Volkov', project_type: 'Newsletter Platform MVP', budget: 7500, currency: 'USD', deadline: '2026-09-01', status: 'active', casper_address: null, created_at: daysAgo(20), updated_at: daysAgo(20) },
    { id: 'a1000000-0000-0000-0000-000000000006', client_name: 'Raj Patel', project_type: 'DeFi Analytics Dashboard', budget: 11000, currency: 'USD', deadline: '2026-08-30', status: 'active', casper_address: null, created_at: daysAgo(13), updated_at: daysAgo(13) },
  ],
  messages: [],
  agent_actions: [
    { id: 'act-001', project_id: 'a1000000-0000-0000-0000-000000000001', action_type: 'project_created', payload: { client: 'Sarah Chen', type: 'SaaS Dashboard UI Kit', budget: 4800, currency: 'USD' }, created_at: daysAgo(50) },
    { id: 'act-002', project_id: 'a1000000-0000-0000-0000-000000000001', action_type: 'contract_generated', payload: { contract: 'Service Agreement for Sarah Chen' }, created_at: daysAgo(49) },
    { id: 'act-003', project_id: 'a1000000-0000-0000-0000-000000000001', action_type: 'status_updated', payload: { status: 'invoiced' }, created_at: daysAgo(11) },
    { id: 'act-004', project_id: 'a1000000-0000-0000-0000-000000000002', action_type: 'project_created', payload: { client: 'Marcus Rivera', type: 'E-commerce Platform', budget: 15000, currency: 'USD' }, created_at: daysAgo(31) },
    { id: 'act-005', project_id: 'a1000000-0000-0000-0000-000000000003', action_type: 'project_created', payload: { client: 'Aiko Tanaka', type: 'Brand Identity & Website', budget: 6200, currency: 'USD' }, created_at: daysAgo(67) },
  ],
  knowledge_docs: [
    {
      id: 'b1000000-0000-0000-0000-000000000001',
      title: 'Standard Service Agreement Template',
      content: '# Service Agreement Template\n\n## Terms\n- 50% deposit required before work begins\n- Final 50% due upon delivery\n- 2 rounds of revisions included\n- Additional revisions billed at $150/hr\n\n## Cancellation\nEither party may cancel with 7 days notice. Deposit is non-refundable once work has started.\n\n## Intellectual Property\nClient receives full ownership upon final payment. I retain the right to display work in my portfolio.',
      doc_type: 'template',
      tags: ['contract', 'legal', 'standard'],
      created_at: daysAgo(80),
    },
    {
      id: 'b1000000-0000-0000-0000-000000000002',
      title: 'Email Template: New Project Inquiry',
      content: 'Subject: Re: Project Inquiry — Next Steps\n\nHi [Client Name],\n\nThank you for reaching out! I would love to discuss your project.\n\nTo provide an accurate quote, could you share:\n- Project scope and deliverables\n- Target timeline\n- Budget range\n- Any reference designs or examples you like\n\nI typically respond to inquiries within 24 hours.\n\nBest,\n[Your Name]',
      doc_type: 'email',
      tags: ['template', 'inquiry', 'response'],
      created_at: daysAgo(80),
    },
    {
      id: 'b1000000-0000-0000-0000-000000000003',
      title: 'Payment Reminder Templates',
      content: '# Payment Reminders\n\n## Friendly (7 days overdue)\nSubject: Quick nudge — Invoice #[NUMBER] for [PROJECT]\n\nHi [Client],\nJust a friendly reminder that invoice #[NUMBER] was due on [DATE]. No rush — let me know if you have any questions.\n\n## Firm (14 days overdue)\nSubject: Overdue Invoice #[NUMBER]\n\nHi [Client],\nThis is a follow-up on invoice #[NUMBER], due on [DATE]. As of today, it is [DAYS] days overdue. Please arrange payment at your earliest convenience.\n\n## Final Notice (30 days overdue)\nSubject: FINAL NOTICE — Invoice #[NUMBER]\n\nHi [Client],\nThis is the final notice. If payment is not received within 7 days, I will need to pause all active work.',
      doc_type: 'template',
      tags: ['payment', 'reminder', 'invoice'],
      created_at: daysAgo(80),
    },
    {
      id: 'b1000000-0000-0000-0000-000000000004',
      title: 'Client Preferences & Notes',
      content: '# Client Notes\n\n## Sarah Chen\n- Prefers email over Slack\n- Likes minimal, clean design\n- Payment: always on time\n\n## Marcus Rivera\n- Fast decision maker\n- Wants aggressive timelines\n- Weekly check-ins on Monday\n\n## Aiko Tanaka\n- Detail-oriented\n- Needs Japanese + English deliverables\n- Prefers Wise transfer',
      doc_type: 'note',
      tags: ['clients', 'preferences', 'personal'],
      created_at: daysAgo(20),
    },
    {
      id: 'b1000000-0000-0000-0000-000000000005',
      title: 'Casper Network Integration Guide',
      content: '# Casper Network — Quick Reference\n\n## Testnet RPC Endpoints\n- Primary: https://node.testnet.casper.network/rpc\n- Backup: https://node.testnet.cspr.cloud/rpc\n\n## Key Concepts\n- CSPR: Native token of Casper Network\n- Public Key: 01-prefix (Ed25519) or 02-prefix (Secp256k1)\n\n## When to Check On-Chain\n- After invoicing a client with a Casper address\n- When a client says "I sent the payment"\n- Before marking a project as paid',
      doc_type: 'note',
      tags: ['casper', 'blockchain', 'reference'],
      created_at: daysAgo(20),
    },
  ],
  notifications: [],
  workflow_steps: [],
};

let idCounter = 100;
function genId(table: string): string {
  return `${table}-${Date.now()}-${idCounter++}`;
}

// ─── Mock Query Builder ──────────────────────────────────────────────────────

type Operation = 'select' | 'insert' | 'update' | 'delete';

interface Filter {
  field: string;
  value: unknown;
  op: 'eq' | 'textsearch';
}

class MockQueryBuilder {
  private tableName: string;
  private op: Operation = 'select';
  private insertData: MockRow | null = null;
  private updateData: Partial<MockRow> | null = null;
  private filters: Filter[] = [];
  private orderField: string | null = null;
  private orderAscending = true;
  private limitN: number | null = null;
  private returnRows = false;

  constructor(table: string) {
    this.tableName = table;
  }

  // Make this thenable so `await builder` works (without .single())
  then(resolve: (v: { data: unknown; error: unknown }) => void, reject?: (e: unknown) => void): void {
    try {
      resolve(this.execute());
    } catch (e) {
      reject?.(e);
    }
  }

  // ── Chainable methods ──

  select(columns?: string): this {
    if (this.op === 'insert' || this.op === 'update' || this.op === 'delete') {
      // Modifier: return affected rows
      this.returnRows = true;
    } else {
      this.op = 'select';
    }
    // columns is ignored — we return all columns
    void columns;
    return this;
  }

  insert(data: MockRow): this {
    this.op = 'insert';
    this.insertData = data;
    return this;
  }

  update(data: Partial<MockRow>): this {
    this.op = 'update';
    this.updateData = data;
    return this;
  }

  delete(): this {
    this.op = 'delete';
    return this;
  }

  eq(field: string, value: unknown): this {
    this.filters.push({ field, value, op: 'eq' });
    return this;
  }

  order(field: string, options?: { ascending?: boolean }): this {
    this.orderField = field;
    this.orderAscending = options?.ascending ?? true;
    return this;
  }

  limit(count: number): this {
    this.limitN = count;
    return this;
  }

  textSearch(_field: string, query: string, _opts?: unknown): this {
    this.filters.push({ field: _field, value: query, op: 'textsearch' });
    return this;
  }

  // ── Terminal method ──

  async single(): Promise<{ data: MockRow | null; error: { message: string } | null }> {
    const result = this.execute();
    const rows = result.data as MockRow[];
    if (rows && Array.isArray(rows) && rows.length > 0) {
      return { data: rows[0], error: null };
    }
    return { data: null, error: { message: 'No rows found' } };
  }

  // ─── Execution ───

  private execute(): { data: unknown; error: unknown } {
    const tableData = tables[this.tableName] ?? [];

    // INSERT
    if (this.op === 'insert' && this.insertData) {
      const newRow: MockRow = {
        id: genId(this.tableName),
        created_at: now,
        updated_at: now,
        ...this.insertData,
      };
      tables[this.tableName] = [...tableData, newRow];
      return { data: this.returnRows ? [newRow] : null, error: null };
    }

    // Filter rows for SELECT, UPDATE, DELETE
    let rows = [...tableData];
    for (const f of this.filters) {
      if (f.op === 'textsearch') {
        const query = String(f.value).toLowerCase();
        const terms = query.split(/\s+/).filter((t) => t.length > 0);
        rows = rows.filter((row) => {
          const text = `${row.title ?? ''} ${row.content ?? ''} ${row.doc_type ?? ''}`.toLowerCase();
          return terms.some((term) => text.includes(term));
        });
      } else {
        rows = rows.filter((row) => row[f.field] === f.value);
      }
    }

    // UPDATE
    if (this.op === 'update' && this.updateData) {
      const updatedRows = rows.map((row) => ({
        ...row,
        ...this.updateData,
        updated_at: now,
      }));
      // Write back to table
      tables[this.tableName] = tableData.map((row) => {
        const match = updatedRows.find((u) => u.id === row.id);
        return match ?? row;
      });
      return { data: this.returnRows ? updatedRows : null, error: null };
    }

    // DELETE
    if (this.op === 'delete') {
      tables[this.tableName] = tableData.filter((row) => !rows.includes(row));
      return { data: this.returnRows ? rows : null, error: null };
    }

    // SELECT — apply ordering
    if (this.orderField) {
      const field = this.orderField;
      const asc = this.orderAscending;
      rows.sort((a, b) => {
        const av = a[field] as string | number | undefined;
        const bv = b[field] as string | number | undefined;
        if (av === undefined && bv === undefined) return 0;
        if (av === undefined) return 1;
        if (bv === undefined) return -1;
        if (av < bv) return asc ? -1 : 1;
        if (av > bv) return asc ? 1 : -1;
        return 0;
      });
    }

    // Apply limit
    if (this.limitN !== null) {
      rows = rows.slice(0, this.limitN);
    }

    return { data: rows, error: null };
  }
}

// ─── Mock Auth ───────────────────────────────────────────────────────────────

const mockAuth = {
  getUser: async () => ({ data: { user: null }, error: null }),
  getSession: async () => ({ data: { session: null }, error: null }),
  signInWithPassword: async () => ({ data: { user: null }, error: null }),
  signOut: async () => ({ error: null }),
};

// ─── Mock Channel (for realtime — no-op) ─────────────────────────────────────

const mockChannel = {
  on: () => mockChannel,
  subscribe: () => mockChannel,
  unsubscribe: async () => {},
};

const mockChannels = {
  channel: () => mockChannel,
  removeChannel: () => {},
};

// ─── Create Mock Client ──────────────────────────────────────────────────────

export function createMockClient(): unknown {
  return {
    from: (table: string) => new MockQueryBuilder(table),
    auth: mockAuth,
    channel: mockChannels.channel,
    channels: mockChannels,
    getChannels: () => [],
    removeChannel: mockChannels.removeChannel,
  };
}

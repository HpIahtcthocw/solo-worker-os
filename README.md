# Solo Worker OS × Casper Network

**Solo Worker OS** is an AI-native freelance operating system where an AI agent manages your entire business through natural conversation — clients, projects, contracts, payments, and blockchain verification.

Built for the [Casper Agentic Buildathon 2026](https://agent.casper.network/buildathon), demonstrating three core agentic capabilities: **persistent memory**, **multi-tool coordination**, and **autonomous decision making**.

## What It Does

| Feature | Description |
|---|---|
| **Client Intake** | Extract project details from natural conversation |
| **Project Tracking** | Manage status: active → delivered → invoiced → paid |
| **Contract Generation** | Draft markdown services agreements on demand |
| **Follow-up Messaging** | Generate tone-appropriate payment reminders |
| **Casper Verification** | Check client's on-chain balance when invoicing — autonomously |

## Three Core Agentic Capabilities

### 1. Persistent Memory
Every project, conversation, and contract is stored in Supabase and injected into every new conversation. The agent remembers Alice's budget, deadline, and Casper address across sessions — no context lost.

### 2. Multi-Tool Coordination
The agent chains multiple tools in sequence to complete complex workflows. Creating a new client involves `create_project` → `generate_contract` → `send_invoice` in a single conversational flow.

### 3. Autonomous Decision Making
The agent doesn't just respond — it **proactively suggests actions** based on business context:
- Invoicing a client with a Casper address → automatically offers to verify on-chain balance
- Project deadline approaching → suggests sending a follow-up reminder
- Payment confirmed on-chain → automatically updates project status to "paid"

## Casper Integration — Business Workflow

Casper isn't a separate demo. It's woven into the freelance payment flow:

```
User: "I sent Alice an invoice for SGD 5,000."
Agent: "Want me to check Alice's Casper balance to confirm she has the funds?"
User: "Yes"
Agent: [calls casper_query_account]
      → "Alice has 12,000 CSPR on testnet. That covers the invoice.
         Marking the project as paid." [calls update_project_status]
```

Each project stores an optional `casper_address` (client's Casper public key). When invoicing, the agent proactively verifies on-chain funds and updates the project status — bridging blockchain and business operations.

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router, Server Components) |
| **Language** | TypeScript |
| **LLM** | Qwen Cloud / DashScope (qwen-plus) |
| **Agent** | Streaming tool-call loop with autonomous decision making |
| **Database** | Supabase (PostgreSQL, RLS, persistent memory) |
| **Blockchain** | Casper Network Testnet (JSON-RPC) |
| **Styling** | Tailwind CSS |

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Add your DASHSCOPE_API_KEY and Supabase credentials

# Run development server
npm run dev
```

### Enable Casper Mode

```env
COMPETITION_MODE=casper
NEXT_PUBLIC_CASPER_RPC_URL=https://node.testnet.casper.network/rpc
```

Then visit `/casper` to see the blockchain demo page, or chat at `/chat` and say:
> *"I sent an invoice to Alice. Can you check her Casper balance?"*

## Architecture

The agent uses a **provider-neutral abstraction layer** — same tool interface across Qwen, Claude, and OpenAI.

```
User: "I sent an invoice to Alice for 50 CSPR."
  │
  ▼
Solo Worker OS Agent (Qwen Cloud)
  │
  ├─ Step 1: "Want me to check Alice's Casper balance?"
  │           → User confirms
  │
  ├─ Step 2: casper_query_account(Alice's public key)
  │           → "Alice has 120 CSPR on testnet"
  │
  ├─ Step 3: update_project_status(project_id=xxx, status=paid)
  │           → writes to Supabase
  │
  └─ Step 4: "Done — Alice has sufficient funds. Project marked as paid."
```

## Project Structure

```
solo/
├── app/
│   ├── api/chat/          # Streaming chat API with Casper mode
│   ├── casper/            # Blockchain demo page (live RPC)
│   ├── dashboard/         # Overview with stats & activity feed
│   ├── projects/          # Project pipeline with CSV export
│   ├── project/[id]/      # Project detail + contract download
│   └── settings/          # Language, display preferences
├── components/
│   ├── CompetitionBadge.tsx   # Competition mode indicator
│   ├── ProjectCard.tsx        # Project card with i18n labels
│   └── ProjectsClient.tsx     # Searchable/filterable project list
├── lib/
│   ├── agent/
│   │   ├── casper/        # Casper RPC client + tool specs
│   │   ├── claude.ts      # Claude provider (alternative)
│   │   ├── qwen.ts        # Qwen Cloud provider (default)
│   │   └── index.ts       # Provider abstraction
│   ├── agent/prompt.ts    # System prompt with Casper workflow rules
│   ├── tools.ts           # 7 core tools + Casper tools
│   ├── i18n.ts            # EN/ZH translations
│   └── utils.ts           # Currency format, timeAgo, greeting
├── supabase/
│   ├── schema.sql         # Projects, messages, actions tables
│   ├── seed.sql           # Demo data with Casper addresses
│   └── auth-migration.sql # RLS policies + user isolation
└── docs/
    └── CASPER_SUBMISSION.md  # Full submission documentation
```

## Key Design Decisions

- **Provider-neutral agent layer**: Switch LLM backends via env var — same tools, same business logic
- **Auth-optional demo mode**: Works without login for evaluation, ready for production auth
- **Zod-validated tools**: All 7+ tool inputs validated before DB writes
- **No UI framework**: Pure Tailwind CSS — lightweight, no bloat

## License

MIT — see [LICENSE](LICENSE) for details.

---

*Built for the Casper Agentic Buildathon 2026. Solo Worker OS — where AI meets freelance business.*

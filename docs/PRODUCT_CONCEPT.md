# Solo Worker OS — Product Concept & Workflow

## What it is

Solo Worker OS is an AI-native freelance operating system. Instead of juggling spreadsheets, email drafts, and payment reminders across ten different apps, a freelancer manages their entire business through a single conversation with an AI agent.

The agent is powered by **Qwen Cloud** (qwen-plus via DashScope). It understands natural language, remembers every client and project, and autonomously orchestrates business workflows — from client intake to contract generation to payment follow-up — all through chat.

## Core Workflow

1. **Client Intake** — User describes a new client in plain language: *"New client, Marcus Rivera, e-commerce platform, $15,000, deadline August 15."* Qwen extracts structured data (name, project type, budget, currency, deadline), confirms with the user, then calls `create_project` to persist it.

2. **Contract Generation** — After project creation, Qwen proactively asks: *"Want me to draft a contract?"* On confirmation, it calls `generate_contract`, producing a markdown services agreement with payment terms, timeline, and IP clauses — instantly rendered in the chat.

3. **Project Tracking** — All projects live on the dashboard with live stats: active count, pending payments, total earned, overdue follow-ups. The agent actions timeline shows every automated step (project_created → contract_generated → status_updated → followup_generated).

4. **Payment Follow-Up** — When a project is overdue, the agent generates context-aware follow-up messages in three tones: polite, firm, or final notice. Each is tailored to the specific client, project value, and days overdue.

5. **Knowledge Base** — Users store contracts, email templates, client notes, and pricing references. The agent searches this private knowledge base (RAG via Supabase) to give context-aware answers like *"What payment terms do I use with Sarah?"*

6. **Blockchain Integration (Casper)** — When a project has a Casper address and the user mentions invoicing, Qwen proactively offers to check the client's on-chain balance. It calls `casper_query_account` via the live Casper testnet JSON-RPC, compares the balance to the invoice amount, and suggests marking the project as paid if funds are sufficient. Users can also look up any deploy/transaction on Casper.

## Key Design Principles

- **Conversation-first**: Everything happens in a chat interface. No forms, no dashboards to configure. Just talk to the agent.
- **Proactive, not passive**: The agent suggests actions based on business context — it doesn't wait to be told everything.
- **Provider-agnostic core**: The agentic loop (stream → tool call → execute → feed back) is abstracted behind an interface. Qwen is the default; Claude and OpenAI are one-line config changes away.
- **Persistent memory**: Supabase stores all projects, messages, agent actions, and knowledge docs. The full project list is injected into every system prompt — the agent never forgets.
- **Live data, no mocks**: Exchange rates, pricing benchmarks, and Casper balances all come from live APIs. The `/casper` page shows real-time RPC status and live account balances from the Casper testnet.

## Technical Stack

- Frontend: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- Backend: Next.js server components + API routes (SSE streaming)
- Database: Supabase (PostgreSQL) — projects, messages, agent_actions, knowledge_docs
- AI Engine: Qwen Cloud (DashScope OpenAI-compatible API) with streaming tool_calls
- Blockchain: Casper Network testnet JSON-RPC (node.testnet.casper.network)
- Deployment: Vercel-ready, single `npm run dev` to start

## Competitive Edge

Most AI tools for freelancers are either generic chat UIs with no memory, or rigid project management apps with no AI. Solo Worker OS sits in the middle: an AI agent with persistent business memory that actively manages workflows, combined with a clean, dark-mode dashboard for at-a-glance status. The Casper integration adds a unique dimension — no other freelance tool bridges natural language AI with live blockchain queries.

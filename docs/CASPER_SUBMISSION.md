# Solo Worker OS — Hackathon Submission

## Project Overview

**Solo Worker OS** is an AI-native freelance operating system. An AI agent manages the entire business workflow — client intake, project tracking, contract generation, payment follow-ups — through natural conversation.

This submission is built for the **Qwen Cloud Global AI Hackathon Series** and demonstrates:

1. **Qwen-Powered Agentic Intelligence** — Qwen Cloud (DashScope) drives a fully agentic loop: streaming text, reasoning over tools, chaining multi-step workflows autonomously
2. **Persistent Memory** — Agent remembers every client, project, and contract across sessions via Supabase
3. **Blockchain Integration** — Casper Network tools extend the agent with on-chain verification, bridging real-world business with decentralized data

Powered by **Qwen Cloud** (qwen-plus). Casper Network integration demonstrates the agent's ability to orchestrate tools across domains.

---

## Demo Video Script

### Scene 1: Dashboard & Persistent Memory (0:00-0:30)

**Narration:** "Solo Worker OS is an AI-powered freelance operating system. The agent has persistent memory — it knows every client, project, and contract because everything is stored in Supabase and injected into every conversation."

**Action:**
- Open `/dashboard` — show 6 pre-populated projects with stats
- Point out: active count, pending payments, total earned, overdue follow-ups — all computed live from the database
- Click into a project — show budget, deadline, status, and the agent actions timeline

**Key point:** No context is lost between sessions. The agent always has the full picture.

---

### Scene 2: Multi-Tool Coordination via Qwen Agent (0:30-1:30)

**Narration:** "The agent is powered by Qwen Cloud. When I describe a new client, Qwen extracts the structured data, confirms with me, then chains multiple tools in sequence — creating the project, generating a contract, all in one conversation."

**Action:**
- Open `/chat`
- Send: *"New client — Marcus Rivera, e-commerce platform, budget 15,000 USD, deadline August 15, 2026"*
- Agent (Qwen) responds: extracts and confirms details — "Marcus Rivera, E-commerce Platform, $15,000 USD, deadline 2026-08-15. Create this project?"
- Send: "Yes, create it"
- Agent calls `create_project` → project card appears on dashboard
- Agent: "Want me to draft a contract?"
- Send: "Yes"
- Agent calls `generate_contract` → full contract rendered in chat

**Key point:** Qwen drives the reasoning. The agent decides which tools to call and in what order — no hardcoded workflow.

---

### Scene 3: Autonomous Decision + Casper On-Chain Verification (1:30-2:30)

**Narration:** "The agent doesn't just respond to commands — it makes autonomous decisions based on business context. When I invoice a client with a Casper address, Qwen proactively offers to verify their on-chain balance."

**Action:**
- In `/chat`, send: *"I just sent Marcus an invoice for $15,000."*
- Agent: *"Marcus has a Casper address on file. Want me to check his on-chain balance to confirm he has the funds?"*
- Send: "Yes, check it"
- Agent calls `casper_query_account` → tool call shown in UI
- Agent: *"Marcus has 45,000 CSPR on testnet — well above the invoice amount. I'll mark it as invoiced."*
- Agent calls `update_project_status` → dashboard updates

**Key point:** Qwen's system prompt encodes the business rule (invoice + casper_address → offer verification). The agent acts proactively without being told.

---

### Scene 4: Casper Blockchain Page (2:30-3:00)

**Narration:** "The agent also has direct access to the Casper Network. All queries hit the live testnet JSON-RPC — no mock data."

**Action:**
- Open `/casper`
- Show: RPC Status = Online (green dot)
- Show: Live account balance table with real CSPR balances from testnet
- Show: Available blockchain tools listed (query_account, get_deploy)

**Key point:** Real on-chain data, real RPC calls. Agent can look up any account or deploy on Casper testnet.

---

### Scene 5: Knowledge Base + Closing (3:00-3:30)

**Narration:** "The agent also searches your private knowledge base — contracts, templates, client notes — to give context-aware answers. All powered by Qwen Cloud, all in natural language."

**Action:**
- Open `/knowledge` — show stored documents (contracts, templates, client notes)
- Back to `/chat`, send: *"What payment terms do I use?"*
- Agent searches knowledge base → returns relevant template
- Show closing summary on dashboard

**Closing narration:** "Solo Worker OS demonstrates what's possible when you combine Qwen Cloud's agentic reasoning with real business tools and blockchain integration. The agent remembers, reasons, and acts — autonomously."

> "Built for the Qwen Cloud Global AI Hackathon Series. Powered by Qwen Cloud + Casper Network."

---

## Technical Architecture

### Agent Provider Abstraction

```typescript
interface AgentProvider {
  runStream(params: {
    system: string;
    messages: AgentMessage[];
    tools: ToolSpec[];
    executeTool: ToolExecutor;
    callbacks: AgentStreamCallbacks;
  }): Promise<string>;
}
```

Implemented by:
- **Qwen Cloud** (default, this submission): DashScope OpenAI-compatible API with streaming `tool_calls`
- **Claude** (alternative): Anthropic Messages API
- **OpenAI** (stub): Ready for future integration

The entire agentic loop — streaming text, buffering tool calls, executing tools, feeding results back — is provider-agnostic. Switching from Claude to Qwen required only one new file.

### Tool Layer

| Tool | Category | Purpose |
|---|---|---|
| `create_project` | Business | Create new client project |
| `update_project_status` | Business | Update project status |
| `generate_contract` | Business | Draft service agreement |
| `generate_followup_message` | Business | Payment reminders |
| `search_knowledge_base` | Business | Search user documents |
| `get_exchange_rates` | Business | Live currency conversion |
| `get_pricing_benchmark` | Business | Industry rate benchmarks |
| `casper_query_account` | Blockchain | Query Casper account balance |
| `casper_get_deploy` | Blockchain | Look up Casper deploy/transaction |

### Qwen Agentic Loop

```
User sends message
  │
  ▼
Qwen receives: system_prompt + project_context + message_history
  │
  ▼
Qwen decides: stream text + optionally emit tool_calls
  │
  ▼
Tool results → appended to history → Qwen continues
  │
  ▼
Loop repeats until Qwen stop_reason ≠ tool_calls
```

The system prompt encodes business rules (e.g., "when invoicing a client with a casper_address, proactively offer to check on-chain funds"). Qwen reasons over these rules and decides when to act without explicit user instruction.

### Casper Integration (Competition Mode)

When `COMPETITION_MODE=casper`:
1. Casper tool specs are appended to the Qwen tool list
2. Qwen can call `casper_query_account` and `casper_get_deploy` in the same loop as business tools
3. All RPC calls hit live Casper testnet (`node.testnet.casper.network/rpc`) with automatic backup failover

### Memory Architecture

```
Supabase PostgreSQL
  ├─ projects          (client, budget, deadline, status, casper_address)
  ├─ messages          (full conversation history)
  ├─ agent_actions     (audit log: project_created, contract_generated, …)
  └─ knowledge_docs    (contracts, templates, notes for RAG)
```

Every chat turn loads the full project list into the system prompt. The agent has perfect recall of all business context without needing to query the database mid-conversation.

---

## Competition Mode Architecture

The Casper integration lives in **new files only** — no existing product code was modified:

| New File | Purpose |
|---|---|
| `lib/agent/casper/client.ts` | Casper RPC client (account query, deploy lookup) with backup failover |
| `lib/agent/casper/tools.ts` | Casper tool specs + executor |
| `lib/agent/prompt.ts` | Extended system prompt with Casper business workflow rules |
| `lib/agent/qwen.ts` | Qwen Cloud provider implementation (streaming, tool loop) |
| `lib/agent/index.ts` | Provider factory — lazy-loads Qwen/Claude/OpenAI |
| `app/casper/page.tsx` | Dedicated Casper demo page with live RPC status |
| `components/CompetitionBadge.tsx` | Competition mode UI indicator |

The core commercial product (7 business tools, standard prompt, multi-language UI) is **completely untouched** and runs independently of competition mode.

---

## Why This Matters

Freelancers and small businesses are early adopters of crypto payments, but the gap between on-chain activity and day-to-day business management is massive. Solo Worker OS solves this by embedding Casper queries into a natural conversation — the agent acts as a universal translator between blockchain data and business context, all driven by Qwen Cloud's reasoning engine.

**Example flow:**
```
Freelancer: "I just sent Marcus an invoice for $15,000."
Agent:     "Marcus has a Casper address on file. Want me to check
            his on-chain balance?"
Freelancer: "Yes."
Agent:     [calls casper_query_account via Qwen tool_calls]
            "Marcus has 45,000 CSPR on testnet — covers the invoice.
            Marking as paid."
```

This demonstrates the core hackathon thesis: an AI agent that doesn't just answer questions, but actively orchestrates workflows across on-chain and off-chain systems — powered by Qwen Cloud.

---

## What We'd Build Next

1. **Casper wallet integration**: Agent signs and submits deploys directly
2. **Payment detection webhook**: Listen for on-chain events and auto-update project status
3. **Multi-chain support**: Extend to Ethereum, Solana
4. **Voice interface**: Manage projects hands-free

---

*Built for the Qwen Cloud Global AI Hackathon Series. Powered by Qwen Cloud (qwen-plus) and Casper Network.*

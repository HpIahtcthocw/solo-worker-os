# Solo Worker OS × Casper Network — Hackathon Submission

## Project Overview

**Solo Worker OS** is an AI-native freelance operating system. An AI agent manages the entire business workflow — client intake, project tracking, contract generation, payment follow-ups — through natural conversation.

This submission demonstrates three core agentic capabilities for the [Casper Agentic Buildathon 2026](https://agent.casper.network/buildathon):

1. **Persistent Memory** — Agent remembers every client, project, and contract across sessions
2. **Multi-Tool Coordination** — Agent chains business tools + blockchain tools autonomously
3. **Autonomous Decision Making** — Agent proactively suggests actions based on business context

Casper Network integration bridges on-chain data with real-world freelance operations.

---

## Demo Video Script

### Scene 1: Persistent Memory (0:00-0:30)

**Narration:** "Solo Worker OS is an AI agent with persistent memory. It remembers every client, project, and contract across sessions."

**Action:**
- Open `/dashboard` — show 6 pre-populated projects
- Click into "Alice Chen — Mobile App UI Design" — show project detail with budget, deadline, contract, timeline
- Show agent actions timeline: project_created → contract_generated → status_updated → followup_generated

**Key point:** All data is in Supabase, injected into every conversation. Agent never forgets.

---

### Scene 2: Multi-Tool Coordination (0:30-1:30)

**Narration:** "The agent orchestrates multiple tools to handle complex workflows — chaining create_project, generate_contract, and send_invoice in a single conversational flow."

**Action:**
- Open `/chat`
- Send: *"I have a new client Frank Li, he needs a blockchain landing page, budget 3500 SGD, deadline 2026-08-15, his Casper address is 0105c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5"*
- Agent responds: confirms details, asks for confirmation
- Send: "Yes, create it"
- Agent calls `create_project` → project appears in dashboard
- Agent: "Want me to draft a contract?"
- Send: "Yes"
- Agent calls `generate_contract` → contract appears in chat + project page
- Show contract download button working

**Key point:** Single conversation triggers multiple tools in sequence. Agent decides the order.

---

### Scene 3: Autonomous Decision Making + Casper (1:30-2:30)

**Narration:** "The agent doesn't just respond — it proactively makes decisions based on business context. When you invoice a client with a Casper address, it automatically offers to verify on-chain funds."

**Action:**
- In `/chat`, send: *"I just sent Alice an invoice for SGD 5,000."*
- Agent: *"Want me to check Alice's Casper balance to confirm she has the funds?"*
- Send: "Yes"
- Agent calls `casper_query_account` → show tool call in UI
- Agent: *"Alice has 12,000 CSPR on testnet — that covers the invoice. Marking as paid."*
- Agent calls `update_project_status` → project status changes to "paid"
- Show dashboard: Alice's project now shows "Paid" badge

**Key point:** Agent decided to check Casper because invoicing + casper_address present = trigger condition. No manual command needed.

---

### Scene 4: Casper Blockchain Page (2:30-3:00)

**Narration:** "All blockchain queries use live Casper testnet JSON-RPC. No mock data."

**Action:**
- Open `/casper`
- Show: RPC Status = Online
- Show: Live account balance table with real CSPR balances
- Show: 4 available blockchain tools (query_account, get_deploy, faucet, build_transfer)
- Click "Casper Buildathon Page" link

**Key point:** Real on-chain data, real RPC calls.

---

### Scene 5: Closing (3:00-3:30)

**Narration:** "Solo Worker OS demonstrates three core agentic capabilities: persistent memory across sessions, multi-tool coordination for complex workflows, and autonomous decision making triggered by business context. Combined with Casper Network integration, it shows how AI agents can bridge blockchain and real-world business operations."

> "Built for Casper Agentic Buildathon 2026. Powered by Qwen Cloud and Casper Network."

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
- **Qwen Cloud** (default): DashScope OpenAI-compatible API with `tool_calls`
- **Claude** (alternative): Anthropic Messages API with `tool_use` blocks
- **OpenAI** (stub): Ready for future integration

Switching providers requires only changing `AGENT_PROVIDER` env var.

### Tool Layer

| Tool | Category | Purpose |
|---|---|---|
| `create_project` | Business | Create new client project |
| `update_project_status` | Business | Update project status |
| `generate_contract` | Business | Draft service agreement |
| `generate_followup_message` | Business | Payment reminders |
| `search_knowledge` | Business | Search user documents |
| `casper_query_account` | Blockchain | Query account balance |
| `casper_get_deploy` | Blockchain | Look up transaction |
| `casper_faucet` | Blockchain | Get testnet funds |
| `casper_build_transfer` | Blockchain | Build transfer deploy |

### Casper Workflow Rules (in system prompt)

When `COMPETITION_MODE=casper`:
1. Project with `casper_address` is invoiced → agent offers to verify on-chain
2. User confirms → `casper_query_account` → compare balance to invoice
3. Sufficient funds → suggest `update_project_status(status='paid')`
4. User mentions deploy hash → `casper_get_deploy` → explain in plain language

### Memory Architecture

```
User sends message
  │
  ▼
Agent receives: system_prompt + project_context + message_history
  │              (project_context = all projects from Supabase)
  │
  ▼
Agent decides: which tools to call (0 or more)
  │
  ▼
Tool results → Agent response → stored in messages table
```

Every conversation loads the full project database into the system prompt. Agent has perfect recall of all business context.

---

## Competition Mode Architecture

The entire competition integration lives in **new files only** — no existing code was modified for the core product:

| New File | Purpose |
|---|---|
| `lib/agent/casper/client.ts` | Casper RPC client (account query, deploy lookup) |
| `lib/agent/casper/tools.ts` | Casper tool specs + executor |
| `lib/agent/prompt.ts` | Extended with Casper business workflow rules |
| `lib/types.ts` | Project type includes optional `casper_address` |
| `components/CompetitionBadge.tsx` | Competition mode UI indicator |
| `app/casper/page.tsx` | Dedicated Casper demo page |

The default commercial product path (7 core tools + standard prompt) is **completely untouched** and can be deployed independently.

---

## Why This Matters for the Casper Ecosystem

Freelancers and small businesses are early adopters of crypto payments, but the gap between on-chain activity and day-to-day business management is massive. Solo Worker OS solves this by embedding Casper queries into a natural conversation — the agent acts as a universal translator between blockchain data and business context.

**Example user flow:**
```
Freelancer: "I just sent an invoice to Alice."
Agent:     "Want me to check Alice's Casper balance?"
Freelancer: "Yes please."
Agent:     [calls casper_query_account]
           "Alice has 120 CSPR — that covers the 50 CSPR invoice. 
            I'll mark the project as paid."
```

This is exactly the kind of agentic automation the Casper Buildathon is looking for: an AI that doesn't just answer questions, but actively orchestrates workflows across on-chain and off-chain systems.

---

## What We'd Build Next

1. **Wallet integration**: Connect the agent to a Casper wallet so it can sign and submit deploys
2. **Payment detection webhook**: Listen for on-chain payment events and auto-update project status
3. **Multi-chain support**: Extend to Ethereum, Solana
4. **Voice interface**: Manage projects hands-free

---

*Built for the Casper Agentic Buildathon 2026. Powered by Qwen Cloud, Casper Network, and too much coffee.*

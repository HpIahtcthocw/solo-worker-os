# Devpost Submission Content

> Copy-paste these fields into the Devpost form at https://devpost.com

---

## 1. About the Project (required)

```markdown
## Inspiration

As a freelancer juggling multiple clients, I found myself drowning in spreadsheets, sticky notes, and half a dozen SaaS tools. Project tracking in Notion, contracts in Google Docs, invoices in Stripe, follow-up reminders in my head — the overhead was eating 30% of my billable hours. I wondered: **what if a single AI agent could manage all of this through natural conversation?**

That's how Solo Worker OS was born — an AI-native operating system for solo workers and freelancers, where the entire business workflow runs through one chat interface.

## What It Does

Solo Worker OS turns freelance business management into a conversation. You just talk to the AI agent, and it handles the rest:

- **"New client — Marcus Rivera, e-commerce platform, budget $15,000, deadline August 15"** → The agent extracts structured data, asks for clarification if needed, then creates the project in the database
- **"Generate a contract for Marcus's project"** → The agent drafts a full service agreement with payment terms, scope, and timeline
- **"Which projects are overdue?"** → The agent queries the database and prioritizes your follow-ups
- **"Write a firm follow-up email for the unpaid Sarah invoice"** → The agent generates a professional payment reminder in your chosen tone

Behind the scenes, the agent runs a full **agentic loop**: it reasons over your request, selects the right tools, chains multi-step workflows, and executes autonomously. When Casper blockchain mode is enabled, it can even verify on-chain payments — "Marcus has 45,000 CSPR on testnet, well above the $15,000 invoice."

## How We Built It

### Architecture

The system is built on a **provider-agnostic agent abstraction** — the entire agentic loop (streaming text, buffering tool calls, executing tools, feeding results back) works with any LLM provider. Qwen Cloud is the primary provider, with pluggable support for Claude and OpenAI.

```
User Message → Agent Factory → Qwen Provider → Tool Loop (max 6 iterations)
  ├── create_project         ├── generate_contract
  ├── update_project_status   ├── generate_followup_message
  ├── search_knowledge        ├── list_projects
  └── get_project_details     └── casper_query_account / casper_get_deploy
→ Streaming Response (SSE)
```

### Qwen Cloud Integration

Qwen Cloud (DashScope API) powers the core agentic intelligence:
- **Streaming responses** via OpenAI-compatible API with SSE
- **Function calling** — Qwen selects from 9 tools (7 business + 2 blockchain) based on user intent
- **Multi-turn reasoning** — the agent loops up to 6 iterations, executing tools and feeding results back to Qwen until the task is complete
- **Proactive decision-making** — the system prompt encodes business rules (e.g., "when invoicing a client with a Casper address, proactively offer to check on-chain funds"), and Qwen decides when to act without explicit instruction

### Persistent Memory

Every client, project, contract, and agent action is stored in Supabase PostgreSQL. On each conversation turn, the full project list is injected into the system prompt — giving the agent perfect recall of all business context without mid-conversation database queries.

### Casper Blockchain Integration

When `COMPETITION_MODE=casper` is enabled, two blockchain tools are added to the agent's toolkit:
- `casper_query_account` — query any Casper account balance, account hash, and purse info via live testnet RPC
- `casper_get_deploy` — look up any deploy/transaction by hash

The agent seamlessly mixes on-chain and off-chain operations — it might create a project, generate a contract, then check the client's Casper balance, all in one conversation.

## Challenges We Ran Into

1. **Tool call streaming** — DashScope's streaming API buffers tool_calls differently from text chunks. We had to carefully parse SSE deltas, buffer partial function arguments, and execute tools only when the complete call arrived.
2. **Agentic loop termination** — The agent sometimes kept calling tools in circles. We solved this with a max-iteration cap (6) and by checking `finish_reason` to distinguish between "needs more tools" and "task complete."
3. **Clarification vs. action** — Training the agent to ask for missing information (e.g., "Is 3000元 CNY or SGD?") before executing, rather than guessing wrong and rolling back.
4. **Context window management** — Injecting the full project list into every prompt could exceed context limits with many projects. We mitigated this by keeping project summaries concise and implementing a relevance filter for large datasets.

## Accomplishments That We're Proud Of

- **Zero hardcoded workflows** — the agent decides which tools to call and in what order, purely from Qwen's reasoning over the system prompt
- **Bilingual support** — the entire UI works in both English and Chinese, with server-side language detection
- **Real blockchain integration** — Casper queries hit the live testnet, no mock data
- **Clean architecture** — switching from Claude to Qwen required only one new file (`lib/agent/qwen.ts`)

## What We Learned

- Agentic loops require careful guardrails — unlimited iterations lead to circular reasoning
- Streaming + function calling is significantly harder than batch API calls — the SSE parsing logic took multiple iterations to get right
- Persistent memory transforms an AI assistant into an operating system — the agent feels qualitatively different when it remembers everything

## What's Next for Solo Worker OS

- **Casper wallet integration** — agent signs and submits deploys directly
- **Payment detection webhook** — listen for on-chain events and auto-update project status
- **Voice interface** — manage projects hands-free
- **Multi-agent collaboration** — specialized sub-agents for design, development, and finance
```

---

## 2. Built With (required)

```
Qwen Cloud (DashScope API), Next.js 14, TypeScript, Supabase, PostgreSQL, Tailwind CSS, Casper Network, SSE Streaming, Function Calling, Node.js
```

---

## 3. Try It Out Links

### Link 1 (GitHub repo)
```
https://github.com/HpIahtcthocw/solo-worker-os
```

### Link 2 (optional — local run instructions)
```
https://github.com/HpIahtcthocw/solo-worker-os#quick-start
```

> Note: If you deploy to Vercel later, add the demo URL as a third link.

---

## 4. Image Gallery

Upload these screenshots from `docs/screenshots/`:
1. `chat-project-created.png` — Agent creating a project through conversation (best hero image)
2. `dashboard.png` — Dashboard with KPI overview
3. `chat-demo.png` — Agent introduction and capabilities
4. `casper.png` — Casper blockchain integration page
5. `projects.png` — Project pipeline view

---

## 5. Video Demo Link (required)

> This field is required by Devpost. You'll need to record a screen demo.
> Recommended: Use the demo script in `docs/CASPER_SUBMISSION.md` (5 scenes, ~3:30)
> Upload to YouTube as unlisted and paste the URL here.
>
> Quick alternative: Record a 2-minute walkthrough of the chat conversation flow:
> 1. Send "你好，请简单介绍一下你能做什么" (agent introduces itself)
> 2. Send "新客户张总，要做个 logo，预算 3000 元，两周后交付" (agent asks clarification)
> 3. Confirm with details (agent creates project)
> 4. Show /casper page for blockchain integration
> 5. Show /dashboard for business overview

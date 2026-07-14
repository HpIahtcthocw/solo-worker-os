# Solo Worker OS — Hackathon Submission Checklist

## Competition: Qwen Cloud Global AI Hackathon — Track 3: Expert Agent

---

## Status Overview

| Item | Status | Notes |
|------|--------|-------|
| GitHub Repo | ✅ Done | https://github.com/HpIahtcthocw/solo-worker-os |
| README.md | ✅ Done | Full project description, tech stack, quick start |
| Build Passes | ✅ Done | `npm run build` exit code 0 |
| Qwen Agent Works | ✅ Done | Tested live — streaming, tool calling, clarification |
| Screenshots | ✅ Done | 7 screenshots in `docs/screenshots/` |
| Demo Data Seed Script | ✅ Done | `supabase/seed.sql` + Node.js seeding script |
| Supabase API Keys | ❌ BLOCKED | Current keys in `.env.local` are invalid (401) |
| Vercel Deployment | ❌ BLOCKED | Requires `vercel login` (manual) |
| Live Demo URL | ❌ Pending | Needs Vercel deployment first |

---

## What You Need to Do (Manual Steps)

### 1. Update Supabase API Keys (CRITICAL)

The current API keys in `.env.local` have been rotated and return 401. You need to get fresh keys:

1. Go to: https://supabase.com/dashboard/project/qmwpnkrfpokgtmtvioxa/settings/api
2. Copy the new **anon key** and **service_role key**
3. Update `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<new_anon_key>
   SUPABASE_SERVICE_ROLE_KEY=<new_service_role_key>
   ```
4. Run the seed script to populate demo data:
   ```bash
   node seed-db.cjs    # Ask TRAE to re-run this after updating keys
   ```

### 2. Deploy to Vercel

```bash
# Step 1: Login (one-time, opens browser for OAuth)
npx vercel login

# Step 2: Deploy
npx vercel --prod
```

After deployment, set environment variables in Vercel dashboard:
- `DASHSCOPE_API_KEY`
- `QWEN_MODEL` = `qwen3.7-plus`
- `AGENT_PROVIDER` = `qwen`
- `COMPETITION_MODE` = `casper`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` = (your Vercel URL)
- `NEXT_PUBLIC_AGENT_PROVIDER` = `qwen`

### 3. Update README with Live Demo URL

After Vercel deployment, update `README.md` line 223:
```
- **Live Demo:** https://your-app.vercel.app
```

### 4. Commit and Push

```bash
git add .
git commit -m "docs: add screenshots + submission checklist"
git push origin main
```

---

## Submission Form Content

### Project Name
Solo Worker OS — AI-Native Freelance Operating System

### One-Line Description
An AI agent powered by Qwen Cloud that manages your entire freelance business — client intake, project tracking, contract generation, payment follow-ups — through natural conversation.

### Track
Track 3: Expert Agent

### Key Technologies
- **Qwen Cloud (DashScope API)** — Primary AI agent with streaming + function calling
- **Next.js 14** — App Router, Server Components, SSE streaming
- **Supabase** — PostgreSQL with RLS, persistent agent memory
- **Casper Network** — Blockchain tools for on-chain payment verification
- **TypeScript** — End-to-end type safety

### What Makes This an "Expert Agent"
1. **Autonomous Tool Selection**: Qwen reasons over user intent and selects from 9 tools (7 business + 2 blockchain) without hardcoded workflows
2. **Multi-Step Chaining**: Agent chains tool calls — e.g., create project → generate contract → check on-chain balance — in a single conversation
3. **Proactive Decision Making**: System prompt encodes business rules (e.g., "when invoicing a client with a Casper address, proactively offer to check on-chain funds")
4. **Clarification Loop**: Agent asks for missing information before acting (e.g., "Is 3000元 CNY or SGD?")
5. **Persistent Memory**: Full project list and conversation history injected into every turn

### Demo Flow (for judges)
1. Open the chat page
2. Say: "新客户张总，要做个 logo，预算 3000 元，两周后交付"
3. Agent asks for clarification (currency, date)
4. Confirm: "人民币CNY，交付日期 2026-07-28，请创建项目"
5. Agent creates project, suggests next steps (contract, pricing benchmark)
6. Ask: "为张总生成合同" — Agent generates full contract
7. Visit /casper to see blockchain tools
8. Visit /dashboard for business overview

### Screenshots
All screenshots are in `docs/screenshots/`:
- `dashboard.png` — Dashboard with KPI cards
- `chat-demo.png` — Agent introduction response
- `chat-create-project.png` — Agent asking for clarification
- `chat-project-created.png` — Project created with next steps
- `projects.png` — Project pipeline
- `knowledge.png` — Knowledge base
- `casper.png` — Casper blockchain integration page

---

## Post-Submission Plan

After Qwen Cloud Hackathon submission:
1. Create a new git branch: `git checkout -b hicool`
2. Adapt for HICOOL competition (requires MTClaw Function Router + Python)
3. Main line continues on `main` branch — improving the core product

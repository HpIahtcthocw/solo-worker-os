# Qwen Cloud Hackathon — Submission Form Content

> 逐字段对应截图中表单，直接复制粘贴

---

## 1. Project Start Date *

```
05-26-2026
```

> 如果项目在 5 月 26 日之前就存在，需要在下一个字段解释本次比赛期间做了哪些改动。
> 如果是新项目，选 5 月 26 日之后的日期即可。

---

## 2. Pre-May 26 Project Explanation

> 如果上面选的日期在 5 月 26 日之前，填这个字段；如果选之后，留空即可。

```
N/A — Project was started fresh for this hackathon after May 26, 2026.
```

---

## 3. Track Selection *

```
Track 3: Expert Agent
```

> 下拉选择。Solo Worker OS 是一个多工具 Agent，最符合 Expert Agent 赛道。

---

## 4. Code Repository URL *

```
https://github.com/HpIahtcthocw/solo-worker-os
```

> 仓库已公开，包含 MIT License 文件、完整源码、README 和部署说明。

---

## 5. Alibaba Cloud Deployment Proof URL *

```
https://github.com/HpIahtcthocw/solo-worker-os/blob/main/lib/agent/qwen.ts
```

> 这个文件展示了后端通过 DashScope API（阿里云）调用 Qwen Cloud 的代码。
> API 端点：`https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`
> 使用 `DASHSCOPE_API_KEY` 认证，模型为 `qwen3.7-plus`。
> 所有 Agent 推理、工具调用、流式输出均运行在阿里云 DashScope 服务上。

> **备选**：也可以指向 `app/api/chat/route.ts`（API 路由层调用 Qwen 的入口）

---

## 6. Architecture Diagram *

> 需要上传一张图片（JPG/PNG，最大 10MB）
> 见下方生成的架构图：`docs/architecture-diagram.png`

---

## 7. AI Tools Used *

```
1. Qwen Cloud (DashScope API) — Primary AI agent powering all business logic: streaming responses, function calling (9 tools), multi-turn reasoning with up to 6 iterations per conversation turn. Model: qwen3.7-plus.
2. Qwen Cloud System Prompt Engineering — Business rules encoded in the system prompt enable proactive decision-making (e.g., offering on-chain verification when invoicing clients with Casper addresses).
3. Supabase PostgreSQL with RLS — Persistent memory layer; full project list and conversation history injected into every prompt for zero-shot context recall.
4. Casper Network RPC — Live testnet blockchain queries integrated as agent tools (casper_query_account, casper_get_deploy), enabling on-chain payment verification.
5. GitHub Copilot / TRAE AI — Used for code assistance during development (boilerplate, type definitions, refactoring).
```

---

## 8. Learning Level *

```
Intermediate
```

> 下拉选择。如果有团队，选整体水平。

---

## 9. Blog/Social Post URL (optional)

> 留空，除非你发布了博客文章。如果有小红书/掘金/Medium 文章可以填。

---

## 10. Legal Checkboxes

全部勾选：

- [x] All team members are at least age of majority in their jurisdiction
- [x] All team members are from eligible competition jurisdictions
- [x] No team members are employees of sponsor, affiliates, or government entities

---

## 11. Testing Instructions *

```
1. Clone the repository: git clone https://github.com/HpIahtcthocw/solo-worker-os
2. Install dependencies: npm install
3. Copy .env.example to .env.local and fill in:
   - DASHSCOPE_API_KEY (your Qwen Cloud API key from https://dashscope.console.aliyun.com/apiKey)
   - NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY (your Supabase project credentials)
   - Set AGENT_PROVIDER=qwen, COMPETITION_MODE=casper
4. Run database schema: Execute supabase/schema.sql and supabase/poc_schema.sql in your Supabase SQL Editor
5. (Optional) Seed demo data: Execute supabase/seed.sql for 6 pre-populated projects with chat history
6. Start the dev server: npm run dev
7. Open http://localhost:3000

Demo flow:
- Go to /chat and say: "新客户张总，要做个 logo，预算 3000 元，两周后交付"
- The agent will ask for clarification (currency type, specific date)
- Confirm: "人民币CNY，交付日期 2026-07-28，请创建项目"
- The agent creates the project and suggests next steps (contract, pricing benchmark)
- Try: "为张总生成合同" — agent generates a full service contract
- Go to /casper to see live Casper blockchain tools (testnet RPC status, account queries)
- Go to /dashboard for business overview

No login required — the app runs in demo mode by default.
```

---

## 12. Video Demo (from previous Devpost Project Details page, still required)

> 需要录一个演示视频上传 YouTube（unlisted），然后把链接填到 Devpost Project Details 页面的 Video demo 字段。
> 建议流程：
> 1. 启动项目 npm run dev
> 2. 录屏 2-3 分钟，按上面的 Demo flow 操作
> 3. 上传到 YouTube 设为 unlisted
> 4. 把链接填到 Devpost 表单

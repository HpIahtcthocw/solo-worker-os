# Solo Worker OS — 开发工程方案

## 目标
为单人自由职业者（设计师、独立顾问、独立开发者）打造 AI 原生操作系统。Claude agent 记住所有客户与项目，驱动完整工作流：intake → contract → tracking → follow-up → payment summary。

## 技术栈
- Next.js 14（App Router）+ TypeScript
- Supabase（PostgreSQL）
- Anthropic Claude Sonnet 4.6（`claude-sonnet-4-6`），`@anthropic-ai/sdk`
- Tailwind CSS（无任何 UI 组件库）
- React `useState` / `useEffect`（无 Zustand / React Query）

## 架构
- **页面层**：`/dashboard`、`/projects`、`/project/[id]` 为 Server Components，服务端用 service-role 客户端直查 Supabase；`/chat` 为 Server + Client 混合（首屏拉历史，客户端流式交互）。
- **API 层**：`/api/chat` 服务端流式（SSE）+ agentic tool_use 循环。Claude 仅在服务端调用。
- **数据层**：`lib/supabase-server.ts`（service role，仅服务端）；`lib/supabase.ts`（anon key，浏览器端最小使用）。

## 对原需求的修正
1. **流式 + tool_use 循环**：实现真正的流式 agentic loop。文本增量以 SSE 推送客户端；`tool_use` 块缓冲后服务端执行、写库、回传 `tool_result`，再续流下一轮，直到 `stop_reason !== 'tool_use'`。
2. **系统 prompt 对齐**：原 prompt「提到新项目即调 create_project」与「创建前先确认」及示例对话冲突。改为：新项目先提取并口头确认，用户同意后才调 `create_project`；更新状态/生成合同/生成跟进按需直调。注入今日日期以解析「3 周后」等相对截止日。
3. **合同/跟进文案落库与回显**：存入 `agent_actions.payload`；项目详情页取最新 `contract_generated` 渲染；同时把生成文本流式回传聊天界面（通过 `displayText` 机制，并指示模型不要重复全文）。
4. **安全**：`SUPABASE_SERVICE_ROLE_KEY` 仅服务端；schema 启用 RLS 并对 anon 放行（单人本地应用简化，可后续收紧）。
5. **无组件库**：合同 markdown 用自研轻量渲染器（标题/加粗/列表/分隔线/段落），不引 `react-markdown`。
6. **仪表盘口径**：pending payments = `status='invoiced'` 预算合计（按币种分组）；overdue follow-ups = `deadline < 今日 且 status != 'paid'` 数量；active projects = `status='active'` 数量。
7. **create_project 返回 id**：供后续 `update_project_status`、`generate_contract`、`generate_followup_message` 引用；系统 prompt 的项目上下文含完整 UUID。

## 文件结构
```
solo/
├─ app/
│  ├─ api/chat/route.ts          # SSE 流式 + tool 循环 + 持久化
│  ├─ dashboard/page.tsx         # 概览
│  ├─ chat/page.tsx              # 服务端拉历史 → ChatClient
│  ├─ projects/page.tsx          # 项目表格
│  ├─ project/[id]/page.tsx      # 详情 + 合同 + 时间线 + 跟进
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx                   # 重定向 /dashboard
├─ components/
│  ├─ Nav.tsx  StatusBadge.tsx  ProjectCard.tsx
│  ├─ ChatMessage.tsx  ChatClient.tsx  Markdown.tsx
│  ├─ CopyButton.tsx  FollowUpGenerator.tsx
├─ lib/
│  ├─ types.ts  utils.ts
│  ├─ supabase.ts  supabase-server.ts
│  ├─ claude.ts                  # SDK 封装 + 流式 tool 循环 + system prompt
│  └─ tools.ts                   # 4 工具定义 + 执行器 + 模板
├─ supabase/schema.sql
├─ package.json  tsconfig.json  next.config.mjs
├─ tailwind.config.ts  postcss.config.mjs
├─ .env.example  .gitignore
└─ PLAN.md
```

## 实施步骤
1. 脚手架与配置 → 2. lib 基础（types/utils/supabase） → 3. schema.sql → 4. lib/tools → 5. lib/claude → 6. /api/chat → 7. 页面 → 8. 组件 → 9. 安装依赖 + 类型检查。

## 环境变量
```
ANTHROPIC_API_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

## 运行
1. 在 Supabase 建库并执行 `supabase/schema.sql`。
2. 复制 `.env.example` 为 `.env.local` 填入密钥。
3. `npm install` → `npm run dev`。

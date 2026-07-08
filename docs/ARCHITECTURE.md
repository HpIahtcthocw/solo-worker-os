# Solo Worker OS — Architecture

```mermaid
flowchart TD
    subgraph Frontend["Frontend (Next.js 14 App Router)"]
        A["/dashboard"] --> N[Nav]
        B["/chat (SSE)"] --> N
        C["/projects"] --> N
        D["/project/[id]"] --> N
        E["/casper"] --> N
        N --> CB[CompetitionBadge]
    end

    subgraph API["API Layer — single entry point"]
        F["POST /api/chat"] --> G{resolveCompetitionMode()}
        G -->|COMPETITION_MODE=qwen| Q[Qwen Path]
        G -->|COMPETITION_MODE=casper| C2[Casper Path]
        G -->|default| D2[Default Path]
    end

    subgraph AgentLayer["Agent Provider Abstraction (lib/agent/)"]
        PI["AgentProvider Interface<br/>runStream(system, messages, tools, executeTool)"]
        CL["claudeProvider<br/>(Anthropic, content-block format)"]
        QW["qwenProvider<br/>(DashScope, OpenAI-format)<br/>toQwenMessage() converter"]
    end

    subgraph Tools["Tool Layer (lib/tools.ts)"]
        BT[Base Tools<br/>create_project, update_project_status<br/>generate_contract, generate_followup_message]
        CT[Casper Tools<br/>casper_query_account, casper_get_deploy]
        GT["getToolSpecsForMode(mode)"]
        ET["executeToolForMode(mode, name, input)"]
    end

    subgraph Data["Data Layer"]
        SB[Supabase<br/>projects, messages, agent_actions]
        CR[Casper RPC<br/>queryAccount, getDeploy, healthCheck]
    end

    Frontend --> API
    D2 --> CL
    Q --> QW
    C2 --> CL
    CL --> PI
    QW --> PI
    PI --> BT
    C2 --> CT
    GT --> BT
    GT --> CT
    ET --> BT
    ET --> CT
    BT --> SB
    CT --> CR

    style CB fill:#fbbf24,color:#000
    style QW fill:#a855f7,color:#fff
    style CT fill:#22d3ee,color:#000
    style CL fill:#d97706,color:#fff
```

## Layer-by-Layer Explanation

### Frontend
Next.js 14 App Router with Server Components for data-heavy pages (`/dashboard`, `/projects`) and a Client Component (`ChatClient`) for real-time SSE streaming. The `CompetitionBadge` component displays the active competition mode. The Nav bar conditionally shows the Casper link when `COMPETITION_MODE=casper`.

### API Layer
`POST /api/chat` is the single entry point for all agent interactions. `resolveCompetitionMode()` reads from the request body or `COMPETITION_MODE` env var, then selects the appropriate tool specs, system prompt variant, and agent provider — **zero code changes required to switch modes**.

### Agent Provider Abstraction
The `AgentProvider` interface (`lib/agent/types.ts`) defines a single method: `runStream(params)`. Each provider implements this contract differently:
- **Claude**: Uses Anthropic's content-block format with `tool_use` blocks
- **Qwen**: Uses OpenAI-compatible format with `tool_calls`; includes `toQwenMessage()` converter to translate between formats
- Providers are lazy-loaded via dynamic `import()` to keep the default bundle lean

### Tool Layer
Base tools (project CRUD + contract generation) are defined once in `lib/tools.ts`. Competition-specific tools are added via `getToolSpecsForMode()` and dispatched via `executeToolForMode()` — the base `TOOL_SPECS` constant and `executeTool()` function are **never modified**.

### Data Layer
- **Supabase**: Primary database for freelancer projects, chat history, and agent action logs
- **Casper RPC**: Read-only blockchain queries (account balances, deploy status) — only active in Casper mode

## Competition Mode Matrix

| Mode | Provider | Tools | Prompt | Frontend |
|---|---|---|---|---|
| Default | Claude Sonnet | Base 4 tools | Standard freelancer assistant | Dashboard, Chat, Projects |
| Qwen (Global AI Hackathon) | Qwen Cloud (DashScope) | Base 4 tools | + MemoryAgent context block | Same + Qwen badge |
| Casper (Agentic Buildathon) | Claude Sonnet | Base 4 + Casper 2 tools | + Blockchain context block | Same + Casper page + badge |

## Key Design Principle

> **Zero breaking changes.** The default Claude path, base tool definitions, and Supabase layer are untouched. Competition features are added exclusively through new files and environment-variable-driven branching. The product remains fully commercializable without any competition-specific code.

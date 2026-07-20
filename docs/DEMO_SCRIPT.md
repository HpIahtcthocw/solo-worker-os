# Solo Worker OS — Demo Video Script (English)

> Duration: ~2-3 minutes. Speak in English throughout.
> Server: http://localhost:3001 (or check terminal for port)

---

## Before Recording

1. Open Chrome, go to `http://localhost:3001`
2. Press `F11` for fullscreen
3. Open screen recorder (OBS / QuickTime / Windows Game Bar)
4. Set resolution to 1920x1080

---

## Scene 1: Dashboard — Persistent Memory (0:00 - 0:30)

**What to say:**

> "Welcome to Solo Worker OS — an AI-native freelance operating system powered by Qwen Cloud. The agent has persistent memory: every client, project, and contract is stored in Supabase and injected into every conversation."

**What to do:**

1. Navigate to `http://localhost:3001/dashboard`
2. Point at the stat cards: Active Projects, Pending Payments, Total Earned, Overdue
3. Scroll down to show the project list
4. Click on a project to show details (budget, deadline, status)

**Key message:** The agent never loses context between sessions.

---

## Scene 2: Create Project via Conversation (0:30 - 1:20)

**What to say:**

> "The entire workflow runs through conversation. Powered by Qwen Cloud, the agent extracts structured data from natural language, asks for clarification when needed, and autonomously calls the right tools."

**What to do:**

1. Click "Chat" in the sidebar (or go to `/chat`)
2. Type this exactly:

```
New client — Sarah Chen, she needs a logo design, budget 800 USD, deadline in 3 weeks
```

3. Press Send
4. Wait for the agent to respond — it will ask for a specific date
5. Type:

```
The deadline is August 10, 2026. Please create the project.
```

6. Press Send
7. Wait — the agent will call `create_project` tool and confirm creation
8. The agent will suggest next steps (generate contract, check pricing)

**Key message:** Qwen decides which tools to call and in what order — no hardcoded workflows.

---

## Scene 3: Generate Contract (1:20 - 1:50)

**What to say:**

> "Once the project is created, I can ask the agent to generate a full service contract — also through conversation."

**What to do:**

1. Type:

```
Generate a contract for Sarah's project
```

2. Press Send
3. Wait — the agent will call `generate_contract` and render the full contract in the chat
4. Scroll through the contract text to show it's a real, detailed document

**Key message:** The agent chains tools — create project, then generate contract — in one conversation.

---

## Scene 4: Knowledge Base Search (1:50 - 2:20)

**What to say:**

> "The agent can also search your private knowledge base — contract templates, email templates, client notes — to give context-aware answers."

**What to do:**

1. Click "Knowledge" in the sidebar (or go to `/knowledge`)
2. Show the stored documents briefly
3. Go back to `/chat`
4. Type:

```
What are my standard payment terms?
```

5. Press Send
6. Wait — the agent will call `search_knowledge` and return relevant content

**Key message:** The agent understands your business context, not just generic AI responses.

---

## Scene 5: Project Management (2:20 - 2:45)

**What to say:**

> "You can manage the entire project lifecycle through conversation — list projects, update status, all in natural language."

**What to do:**

1. In `/chat`, type:

```
Show me all my projects
```

2. Press Send — agent calls `list_projects` and shows the list
3. Type:

```
Update Sarah's project status to delivered
```

4. Press Send — agent calls `update_project_status`
5. Go to `/dashboard` to show the updated state

**Key message:** All project management through natural language — no forms, no clicks.

---

## Scene 6: Closing (2:45 - 3:00)

**What to say:**

> "Solo Worker OS demonstrates what's possible when you combine Qwen Cloud's agentic reasoning with real business tools. The agent remembers, reasons, and acts — all autonomously, all through conversation."

**What to do:**

1. Show the dashboard one final time
2. Stop recording

---

## After Recording

1. Upload to YouTube as **Unlisted**
2. Copy the YouTube URL
3. Paste it into the Devpost submission form → "Project details" → "Video demo" field

---

## Tips

- **Speak slowly and clearly** — judges may not be native English speakers
- **Wait for the agent** — Qwen takes 10-20 seconds per response. Don't rush.
- **If the agent makes a mistake** — just say "Let me rephrase" and try again
- **Mouse movements** — move slowly when pointing at things, use hover to highlight
- **No silence** — keep narrating while waiting for the agent to respond

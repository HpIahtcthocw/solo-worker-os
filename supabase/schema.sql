-- Solo Worker OS — Supabase schema
-- Run this in the Supabase SQL editor.

-- Extensions
create extension if not exists "pgcrypto";

-- Tables
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  project_type text not null,
  budget numeric not null,
  currency text not null default 'SGD',
  deadline date not null,
  status text not null default 'active'
    check (status in ('active', 'delivered', 'invoiced', 'paid')),
  casper_address text,                    -- Client's Casper public key for on-chain payment checks
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete set null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists agent_actions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  action_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists knowledge_docs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  doc_type text not null default 'note',
  tags text[] default '{}',
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_projects_status on projects(status);
create index if not exists idx_projects_deadline on projects(deadline);
create index if not exists idx_messages_created on messages(created_at desc);
create index if not exists idx_agent_actions_project on agent_actions(project_id, created_at desc);
create index if not exists idx_knowledge_docs_created on knowledge_docs(created_at desc);

-- Full-text search index (English + Chinese-friendly simple config)
create index if not exists knowledge_docs_fts
  on knowledge_docs
  using gin(to_tsvector('simple', title || ' ' || content));

-- updated_at trigger
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_projects_updated on projects;
create trigger trg_projects_updated
  before update on projects
  for each row execute function set_updated_at();

-- Row Level Security
-- NOTE: permissive policies for the anon role to keep this single-user local app
-- working without auth. Tighten these before any multi-user / production use.
alter table projects enable row level security;
alter table messages enable row level security;
alter table agent_actions enable row level security;
alter table knowledge_docs enable row level security;

drop policy if exists "projects_anon_all" on projects;
create policy "projects_anon_all" on projects
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "messages_anon_all" on messages;
create policy "messages_anon_all" on messages
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "agent_actions_anon_all" on agent_actions;
create policy "agent_actions_anon_all" on agent_actions
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "knowledge_docs_anon_all" on knowledge_docs;
create policy "knowledge_docs_anon_all" on knowledge_docs
  for all to anon, authenticated using (true) with check (true);

-- The service role bypasses RLS entirely.

-- ── Idempotent migrations (safe to re-run) ─────────────────────────────────────
-- Adds columns that may be missing from tables created by an older schema version.

ALTER TABLE projects ADD COLUMN IF NOT EXISTS casper_address text;
CREATE INDEX IF NOT EXISTS idx_projects_casper ON projects(casper_address);

ALTER TABLE projects ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'SGD';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS deadline date NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

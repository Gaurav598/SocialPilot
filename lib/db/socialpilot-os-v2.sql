-- SocialPilot OS V2 migration
-- Adds organization, memory, RAG, analytics, collaboration, audit, webhook, and event-outbox primitives.

create extension if not exists vector;

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_user_id text not null,
  plan text not null default 'pro' check (plan in ('free', 'pro', 'premium', 'enterprise')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists workspaces (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  timezone text not null default 'UTC',
  brand_voice text,
  audience_profile text,
  autopilot_enabled boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id text not null,
  role text not null check (role in ('owner', 'admin', 'editor', 'viewer', 'approver')),
  created_at timestamptz default now(),
  unique (workspace_id, user_id)
);

create table if not exists ai_memories (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id text not null,
  kind text not null check (kind in ('short_term', 'long_term', 'episodic', 'semantic')),
  title text not null,
  content text not null,
  weight numeric(5,4) not null default 0.5000,
  source_type text not null default 'manual',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists content_vectors (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  source_table text not null,
  source_id uuid,
  title text not null,
  content text not null,
  tags text[] not null default '{}',
  embedding vector(64),
  created_at timestamptz default now()
);

create index if not exists content_vectors_embedding_idx
  on content_vectors using ivfflat (embedding vector_cosine_ops) with (lists = 100);

create table if not exists analytics_metrics (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  scheduled_post_id uuid references scheduled_posts(id) on delete set null,
  platform text not null,
  reach integer not null default 0,
  impressions integer not null default 0,
  engagement integer not null default 0,
  clicks integer not null default 0,
  followers_delta integer not null default 0,
  captured_at timestamptz not null default now()
);

create table if not exists listening_signals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  keyword text not null,
  competitor text,
  sentiment text not null default 'neutral' check (sentiment in ('positive', 'neutral', 'negative')),
  velocity integer not null default 0,
  opportunity text,
  created_at timestamptz default now()
);

create table if not exists approval_requests (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  scheduled_post_id uuid references scheduled_posts(id) on delete cascade,
  requester_user_id text not null,
  state text not null default 'needs_review' check (state in ('draft', 'needs_review', 'approved', 'scheduled')),
  due_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists approval_reviewers (
  approval_request_id uuid not null references approval_requests(id) on delete cascade,
  reviewer_user_id text not null,
  decided_at timestamptz,
  decision text check (decision in ('approved', 'changes_requested', 'rejected')),
  primary key (approval_request_id, reviewer_user_id)
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  scheduled_post_id uuid references scheduled_posts(id) on delete cascade,
  author_user_id text not null,
  body text not null,
  mentions text[] not null default '{}',
  created_at timestamptz default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete set null,
  actor_user_id text,
  action text not null,
  entity_type text not null,
  entity_id text,
  ip_hash text,
  user_agent text,
  metadata jsonb not null default '{}',
  created_at timestamptz default now()
);

create table if not exists outbox_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  event_type text not null,
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'sent', 'failed')),
  attempts integer not null default 0,
  available_at timestamptz not null default now(),
  created_at timestamptz default now()
);

create table if not exists webhook_endpoints (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  url text not null,
  secret_ref text not null,
  events text[] not null,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

alter table organizations enable row level security;
alter table workspaces enable row level security;
alter table workspace_members enable row level security;
alter table ai_memories enable row level security;
alter table content_vectors enable row level security;
alter table analytics_metrics enable row level security;
alter table listening_signals enable row level security;
alter table approval_requests enable row level security;
alter table approval_reviewers enable row level security;
alter table comments enable row level security;
alter table audit_logs enable row level security;
alter table outbox_events enable row level security;
alter table webhook_endpoints enable row level security;

drop policy if exists organizations_owner_policy on organizations;
create policy organizations_owner_policy on organizations
  for all using (owner_user_id = requesting_user_id())
  with check (owner_user_id = requesting_user_id());

drop policy if exists workspace_member_policy on workspaces;
create policy workspace_member_policy on workspaces
  for all using (
    exists (
      select 1 from workspace_members wm
      where wm.workspace_id = workspaces.id
      and wm.user_id = requesting_user_id()
    )
  );

drop policy if exists workspace_members_policy on workspace_members;
create policy workspace_members_policy on workspace_members
  for all using (user_id = requesting_user_id())
  with check (user_id = requesting_user_id());

drop policy if exists ai_memories_policy on ai_memories;
create policy ai_memories_policy on ai_memories
  for all using (user_id = requesting_user_id())
  with check (user_id = requesting_user_id());

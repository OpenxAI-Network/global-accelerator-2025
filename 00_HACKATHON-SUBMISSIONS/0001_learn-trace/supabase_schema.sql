-- ============================================================================
-- LEARN-TRACE: Reconstructed Supabase (PostgreSQL) Schema
-- ============================================================================
-- Reconstructed from codebase analysis (no migrations found)
-- Generated: 2026-04-28
-- Source: Typescript component interactions with Supabase
-- ============================================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================================
-- TABLE: users
-- ============================================================================
-- CONFIDENCE: HIGH
-- SOURCE: Profile.tsx - .from("users").select("*").eq("id", user.id)
-- Links to Supabase auth.users(id)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text null,
  created_at timestamptz default now() not null,
  
  constraint username_length check (char_length(username) <= 30)
);

-- ============================================================================
-- TABLE: chats
-- ============================================================================
-- CONFIDENCE: HIGH
-- SOURCE: Sidebar.tsx, ChatThread.tsx, ShareButton.tsx - Main conversation entity
-- References: user_id (auth.users), last_node_id (nodes)
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null default 'New Chat',
  is_public boolean not null default false,
  last_node_id uuid null, -- Will be set as foreign key constraint after nodes table
  created_at timestamptz default now() not null,
  
  constraint title_not_empty check (char_length(title) > 0)
);

-- ============================================================================
-- TABLE: messages
-- ============================================================================
-- CONFIDENCE: HIGH
-- SOURCE: ChatThread.tsx - insert/select operations with chat_id, sender, content, summary
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender text not null,
  content text not null,
  summary text null,
  created_at timestamptz default now() not null,
  
  constraint sender_valid check (sender in ('user', 'ai')),
  constraint content_not_empty check (char_length(content) > 0)
);

-- ============================================================================
-- TABLE: nodes
-- ============================================================================
-- CONFIDENCE: HIGH
-- SOURCE: ChatThread.tsx - insert operations with message_id, title, answer, summary
-- References: chat_id (chats), message_id (messages)
create table if not exists public.nodes (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  message_id uuid null references public.messages(id) on delete set null,
  title text not null,
  answer text not null,
  summary text null,
  created_at timestamptz default now() not null,
  
  constraint title_not_empty check (char_length(title) > 0),
  constraint answer_not_empty check (char_length(answer) > 0)
);

-- ============================================================================
-- TABLE: edges
-- ============================================================================
-- CONFIDENCE: HIGH
-- SOURCE: ChatThread.tsx - insert operations creating links between nodes
-- Graph edges linking nodes in knowledge graph structure
create table if not exists public.edges (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  from_node uuid not null references public.nodes(id) on delete cascade,
  to_node uuid not null references public.nodes(id) on delete cascade,
  created_at timestamptz default now() not null,
  
  constraint different_nodes check (from_node != to_node),
  constraint valid_nodes_in_chat check (true) -- Validated at application level
);

-- ============================================================================
-- TABLE: notes
-- ============================================================================
-- CONFIDENCE: HIGH
-- SOURCE: GraphViewer.tsx - User annotations on nodes
-- References: node_id (nodes)
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  node_id uuid not null references public.nodes(id) on delete cascade,
  content text not null,
  created_at timestamptz default now() not null,
  
  constraint content_not_empty check (char_length(content) > 0)
);

-- ============================================================================
-- TABLE: external_resources
-- ============================================================================
-- CONFIDENCE: HIGH
-- SOURCE: GraphViewer.tsx - External links/resources attached to nodes
-- Stores URLs with type classification (youtube, notion, github, google-docs, link)
create table if not exists public.external_resources (
  id uuid primary key default gen_random_uuid(),
  node_id uuid not null references public.nodes(id) on delete cascade,
  title text not null,
  resource_link text not null,
  resource_type text not null,
  created_at timestamptz default now() not null,
  
  constraint title_not_empty check (char_length(title) > 0),
  constraint resource_link_not_empty check (char_length(resource_link) > 0),
  constraint resource_type_valid check (
    resource_type in ('youtube', 'notion', 'github', 'google-docs', 'link')
  )
);

-- ============================================================================
-- ALTER TABLE: Add deferred foreign key for chats.last_node_id
-- ============================================================================
-- Done after nodes table creation
alter table public.chats 
add constraint chats_last_node_id_fkey 
  foreign key (last_node_id) 
  references public.nodes(id) 
  on delete set null;

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Lookup chats by user for listing and filtering
create index if not exists idx_chats_user_id on public.chats(user_id);

-- Lookup public chats for share view
create index if not exists idx_chats_is_public on public.chats(is_public);

-- Lookup messages by chat for thread fetching
create index if not exists idx_messages_chat_id on public.messages(chat_id);

-- Lookup nodes by chat for graph fetching
create index if not exists idx_nodes_chat_id on public.nodes(chat_id);

-- Lookup nodes by message (reverse lookup)
create index if not exists idx_nodes_message_id on public.nodes(message_id);

-- Lookup edges by chat for graph fetching
create index if not exists idx_edges_chat_id on public.edges(chat_id);

-- Lookup edges by from_node and to_node for graph traversal
create index if not exists idx_edges_from_node on public.edges(from_node);
create index if not exists idx_edges_to_node on public.edges(to_node);

-- Lookup notes by node for display
create index if not exists idx_notes_node_id on public.notes(node_id);

-- Lookup resources by node for display
create index if not exists idx_external_resources_node_id on public.external_resources(node_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- USERS table
alter table public.users enable row level security;

-- Policy: Users can view only their own profile
create policy "users_can_view_own_profile" on public.users
  for select
  using (auth.uid() = id);

-- Policy: Users can update only their own profile
create policy "users_can_update_own_profile" on public.users
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- CHATS table
alter table public.chats enable row level security;

-- Policy: Users can view their own chats
create policy "users_can_view_own_chats" on public.chats
  for select
  using (
    auth.uid() = user_id
    or is_public = true  -- Allow viewing public chats
  );

-- Policy: Users can insert chats (ownership enforced at app level)
create policy "users_can_create_chats" on public.chats
  for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update their own chats
create policy "users_can_update_own_chats" on public.chats
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policy: Users can delete their own chats
create policy "users_can_delete_own_chats" on public.chats
  for delete
  using (auth.uid() = user_id);

-- MESSAGES table
alter table public.messages enable row level security;

-- Policy: Users can view messages from their own chats or public chats
create policy "users_can_view_messages_in_owned_or_public_chats" on public.messages
  for select
  using (
    exists (
      select 1 from public.chats
      where chats.id = messages.chat_id
      and (chats.user_id = auth.uid() or chats.is_public = true)
    )
  );

-- Policy: Users can insert messages in their own chats
create policy "users_can_insert_messages_in_own_chats" on public.messages
  for insert
  with check (
    exists (
      select 1 from public.chats
      where chats.id = chat_id
      and chats.user_id = auth.uid()
    )
  );

-- Policy: Users can delete their own messages (from their chats)
create policy "users_can_delete_own_messages" on public.messages
  for delete
  using (
    exists (
      select 1 from public.chats
      where chats.id = chat_id
      and chats.user_id = auth.uid()
    )
  );

-- NODES table
alter table public.nodes enable row level security;

-- Policy: Users can view nodes from their own or public chats
create policy "users_can_view_nodes_in_owned_or_public_chats" on public.nodes
  for select
  using (
    exists (
      select 1 from public.chats
      where chats.id = nodes.chat_id
      and (chats.user_id = auth.uid() or chats.is_public = true)
    )
  );

-- Policy: Users can insert nodes in their own chats
create policy "users_can_insert_nodes_in_own_chats" on public.nodes
  for insert
  with check (
    exists (
      select 1 from public.chats
      where chats.id = chat_id
      and chats.user_id = auth.uid()
    )
  );

-- Policy: Users can delete nodes from their own chats
create policy "users_can_delete_nodes_in_own_chats" on public.nodes
  for delete
  using (
    exists (
      select 1 from public.chats
      where chats.id = chat_id
      and chats.user_id = auth.uid()
    )
  );

-- EDGES table
alter table public.edges enable row level security;

-- Policy: Users can view edges from their own or public chats
create policy "users_can_view_edges_in_owned_or_public_chats" on public.edges
  for select
  using (
    exists (
      select 1 from public.chats
      where chats.id = edges.chat_id
      and (chats.user_id = auth.uid() or chats.is_public = true)
    )
  );

-- Policy: Users can insert edges in their own chats
create policy "users_can_insert_edges_in_own_chats" on public.edges
  for insert
  with check (
    exists (
      select 1 from public.chats
      where chats.id = chat_id
      and chats.user_id = auth.uid()
    )
  );

-- Policy: Users can delete edges from their own chats
create policy "users_can_delete_edges_in_own_chats" on public.edges
  for delete
  using (
    exists (
      select 1 from public.chats
      where chats.id = chat_id
      and chats.user_id = auth.uid()
    )
  );

-- NOTES table
alter table public.notes enable row level security;

-- Policy: Users can view notes from their own or public chats
create policy "users_can_view_notes_in_owned_or_public_chats" on public.notes
  for select
  using (
    exists (
      select 1 from public.nodes
      join public.chats on chats.id = nodes.chat_id
      where nodes.id = notes.node_id
      and (chats.user_id = auth.uid() or chats.is_public = true)
    )
  );

-- Policy: Users can insert notes in their own chats
create policy "users_can_insert_notes_in_own_chats" on public.notes
  for insert
  with check (
    exists (
      select 1 from public.nodes
      join public.chats on chats.id = nodes.chat_id
      where nodes.id = node_id
      and chats.user_id = auth.uid()
    )
  );

-- Policy: Users can update notes in their own chats
create policy "users_can_update_notes_in_own_chats" on public.notes
  for update
  using (
    exists (
      select 1 from public.nodes
      join public.chats on chats.id = nodes.chat_id
      where nodes.id = node_id
      and chats.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.nodes
      join public.chats on chats.id = nodes.chat_id
      where nodes.id = node_id
      and chats.user_id = auth.uid()
    )
  );

-- Policy: Users can delete notes in their own chats
create policy "users_can_delete_notes_in_own_chats" on public.notes
  for delete
  using (
    exists (
      select 1 from public.nodes
      join public.chats on chats.id = nodes.chat_id
      where nodes.id = node_id
      and chats.user_id = auth.uid()
    )
  );

-- EXTERNAL_RESOURCES table
alter table public.external_resources enable row level security;

-- Policy: Users can view resources from their own or public chats
create policy "users_can_view_resources_in_owned_or_public_chats" on public.external_resources
  for select
  using (
    exists (
      select 1 from public.nodes
      join public.chats on chats.id = nodes.chat_id
      where nodes.id = external_resources.node_id
      and (chats.user_id = auth.uid() or chats.is_public = true)
    )
  );

-- Policy: Users can insert resources in their own chats
create policy "users_can_insert_resources_in_own_chats" on public.external_resources
  for insert
  with check (
    exists (
      select 1 from public.nodes
      join public.chats on chats.id = nodes.chat_id
      where nodes.id = node_id
      and chats.user_id = auth.uid()
    )
  );

-- Policy: Users can update resources in their own chats
create policy "users_can_update_resources_in_own_chats" on public.external_resources
  for update
  using (
    exists (
      select 1 from public.nodes
      join public.chats on chats.id = nodes.chat_id
      where nodes.id = node_id
      and chats.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.nodes
      join public.chats on chats.id = nodes.chat_id
      where nodes.id = node_id
      and chats.user_id = auth.uid()
    )
  );

-- Policy: Users can delete resources from their own chats
create policy "users_can_delete_resources_in_own_chats" on public.external_resources
  for delete
  using (
    exists (
      select 1 from public.nodes
      join public.chats on chats.id = nodes.chat_id
      where nodes.id = node_id
      and chats.user_id = auth.uid()
    )
  );

-- ============================================================================
-- COMMENTS & DOCUMENTATION
-- ============================================================================

comment on table public.users is
  'User profiles linked to auth.users. CONFIDENCE: HIGH';

comment on table public.chats is
  'Main conversation/session entity. Each chat is a standalone knowledge graph session. CONFIDENCE: HIGH';

comment on column public.chats.last_node_id is
  'Tracks the last active node in the conversation for navigation/context persistence. CONFIDENCE: HIGH';

comment on table public.messages is
  'Individual messages in a chat, alternating between user and AI responses. CONFIDENCE: HIGH';

comment on table public.nodes is
  'Knowledge graph nodes representing key discussion points/topics. CONFIDENCE: HIGH';

comment on column public.nodes.message_id is
  'References the AI response message that created this node (nullable). CONFIDENCE: HIGH';

comment on table public.edges is
  'Graph edges represent relationships/dependencies between nodes. CONFIDENCE: HIGH';

comment on table public.notes is
  'User-generated annotations on individual nodes. CONFIDENCE: HIGH';

comment on table public.external_resources is
  'External links/resources (YouTube, GitHub, Notion, Google Docs) attached to nodes. CONFIDENCE: HIGH';

comment on column public.external_resources.resource_type is
  'Type classification of resource: youtube, notion, github, google-docs, or generic link. CONFIDENCE: HIGH';

# Learn-Trace Database Schema - Documentation

## Overview

This document describes the reconstructed Supabase (PostgreSQL) database schema for the Learn-Trace application, a knowledge graph-based chat interface that builds interactive learning networks from conversations with AI.

**Reconstruction Method**: Analyzed TypeScript/React codebase for Supabase query patterns (`.from()`, `.insert()`, `.select()`, `.update()`, `.delete()`)

**Original State**: No migration files existed; schema completely reconstructed from client code

---

## Entity Relationship Diagram (ERD)

```
┌─────────────────┐
│  auth.users     │
│  (Supabase)     │
└────────┬────────┘
         │ (1:1)
         │
┌────────▼────────────┐
│     users           │─◄─────────────────────────────┐
│ ─────────────       │                               │
│ • id (PK)           │                               │
│ • username          │                (N:1) user_id  │
│ • created_at        │                               │
└────────┬────────────┘                               │
         │                                            │
    (1:N)│ user_id                                    │
         │                                            │
┌────────▼────────────────┐    ┌──────────────────┐   │
│      chats              │    │     messages      │   │
│  ─────────────────      │    │  ──────────────   │   │
│  • id (PK)              │◄───┤  • id (PK)        │   │
│  • user_id (FK)  ───────┼────┤  • chat_id (FK)   │   │
│  • title                │    │  • sender         │   │
│  • is_public            │    │  • content        │   │
│  • last_node_id (FK) ┐  │    │  • summary        │   │
│  • created_at        │  │    │  • created_at     │   │
└────────┬─────────────┼──┘    └──────────┬────────┘   │
         │             │                  │            │
    (1:N)│             │            (1:N) │ message_id │
         │             │                  │            │
┌────────▼────────────┼──────┐   ┌────────▼────────┐   │
│      nodes          │      │   │  (notes ref)    │   │
│  ───────────────    │      └──◄│  messages       │   │
│  • id (PK)          │          │                 │   │
│  • chat_id (FK) ─────────┐     └─────────────────┘   │
│  • message_id (FK) ──────┼──────────────────────┐    │
│  • title            │     │                     │    │
│  • answer           │     │              (N:1)  │    │
│  • summary          │     │              chat_id    │
│  • created_at       │     │                     │    │
└────────┬────────────┼─────┼──────────────────┐  │    │
         │            │     │                  │  │    │
    (1:N)│            │     │            (N:1) └─────┐ │
         │            │     │            chat_id    │ │
┌────────▼──────┐ ┌───┤     │  ┌─────────────────┐  │ │
│     edges      │ │   │     │  │    external_    │  │ │
│  ──────────    │ │   │     │  │   resources     │  │ │
│  • id (PK)     │ │   │     │  │  ────────────   │  │ │
│  • chat_id (FK)├─┤   │     │  │  • id (PK)      │  │ │
│  • from_node(FK)   │  │     │  │  • node_id(FK)─┼──┤
│  • to_node (FK)─┐─────┤     │  │  • title        │  │
│  • created_at   │        │  │  • resource_link │  │
└────────────────┘    ├──◄│  │  • resource_type │  │
                      │   │  │  • created_at    │  │
              (1:N)   │   │  └─────────────────┘  │
              node_id │   │                       │
                      │   └───────────────────────┘
┌────────────────┐    │   (N:1) node_id
│     notes      │    │
│  ────────────  │    │
│  • id (PK)     │◄───┤
│  • node_id(FK)─┘
│  • content
│  • created_at
└────────────────┘
```

---

## Table Specifications

### 1. `users` (User Profiles)

**Purpose**: Stores user profile information linked to Supabase Auth  
**Confidence**: HIGH  
**Source**: Profile.tsx

| Column     | Type        | Nullable | Notes                                    |
| ---------- | ----------- | -------- | ---------------------------------------- |
| id         | uuid        | NO       | Primary Key, references `auth.users(id)` |
| username   | text        | YES      | Editable display name, max 30 chars      |
| created_at | timestamptz | NO       | Default: now()                           |

**Relationships**:

- 1:N → chats (user owns many chats)

---

### 2. `chats` (Conversation Sessions)

**Purpose**: Main container for a conversation/knowledge graph session  
**Confidence**: HIGH  
**Source**: Sidebar.tsx, ChatThread.tsx, ShareButton.tsx

| Column       | Type        | Nullable | Notes                                                               |
| ------------ | ----------- | -------- | ------------------------------------------------------------------- |
| id           | uuid        | NO       | Primary Key, default: gen_random_uuid()                             |
| user_id      | uuid        | NO       | Foreign Key → users(id), ON DELETE CASCADE                          |
| title        | text        | NO       | Display name, required                                              |
| is_public    | boolean     | NO       | Default: false; enables share links                                 |
| last_node_id | uuid        | YES      | Foreign Key → nodes(id), ON DELETE SET NULL; tracks session context |
| created_at   | timestamptz | NO       | Default: now()                                                      |

**Relationships**:

- N:1 → users (many chats per user)
- 1:N → messages (chat has many messages)
- 1:N → nodes (chat has many nodes)
- 1:N → edges (chat has many edges)
- 1:1 → nodes (via last_node_id)

**Key Patterns**:

- `is_public` enables share links (chats/{id})
- `last_node_id` persists context for navigation after page reload

---

### 3. `messages` (Chat Messages)

**Purpose**: Individual user and AI messages in a conversation  
**Confidence**: HIGH  
**Source**: ChatThread.tsx

| Column     | Type        | Nullable | Notes                                                   |
| ---------- | ----------- | -------- | ------------------------------------------------------- |
| id         | uuid        | NO       | Primary Key                                             |
| chat_id    | uuid        | NO       | Foreign Key → chats(id), ON DELETE CASCADE              |
| sender     | text        | NO       | Enum-like: 'user' \| 'ai'                               |
| content    | text        | NO       | Message body, required non-empty                        |
| summary    | text        | YES      | AI-generated summary of message (first 4 words + "...") |
| created_at | timestamptz | NO       | Default: now()                                          |

**Relationships**:

- N:1 → chats (many messages per chat)
- 1:N → nodes (message can generate a node; via nodes.message_id)

**Key Patterns**:

- Messages are immutable once created
- Summary computed at insert time
- Ordering: chronological by created_at

---

### 4. `nodes` (Knowledge Graph Nodes)

**Purpose**: Represents key discussion points/topics in the knowledge graph  
**Confidence**: HIGH  
**Source**: ChatThread.tsx, GraphViewer.tsx

| Column     | Type        | Nullable | Notes                                                                              |
| ---------- | ----------- | -------- | ---------------------------------------------------------------------------------- |
| id         | uuid        | NO       | Primary Key                                                                        |
| chat_id    | uuid        | NO       | Foreign Key → chats(id), ON DELETE CASCADE                                         |
| message_id | uuid        | YES      | Foreign Key → messages(id), ON DELETE SET NULL; AI response that created this node |
| title      | text        | NO       | User's question/topic, required                                                    |
| answer     | text        | NO       | AI's response/answer, required                                                     |
| summary    | text        | YES      | Truncated version of title for display                                             |
| created_at | timestamptz | NO       | Default: now()                                                                     |

**Relationships**:

- N:1 → chats (many nodes per chat)
- N:1 → messages (node linked to creating message)
- 1:N → notes (node has many notes)
- 1:N → external_resources (node has many resources)
- N:N → nodes (via edges table: from_node, to_node)

**Key Patterns**:

- Each node represents a topic that can be explored further
- Nodes form a directed acyclic graph (DAG) via edges
- Can respond to a node to create child nodes

---

### 5. `edges` (Knowledge Graph Edges)

**Purpose**: Represents relationships/dependencies between nodes  
**Confidence**: HIGH  
**Source**: ChatThread.tsx, utils/deleteNode.ts

| Column     | Type        | Nullable | Notes                                                   |
| ---------- | ----------- | -------- | ------------------------------------------------------- |
| id         | uuid        | NO       | Primary Key                                             |
| chat_id    | uuid        | NO       | Foreign Key → chats(id), ON DELETE CASCADE              |
| from_node  | uuid        | NO       | Foreign Key → nodes(id), ON DELETE CASCADE; source node |
| to_node    | uuid        | NO       | Foreign Key → nodes(id), ON DELETE CASCADE; target node |
| created_at | timestamptz | NO       | Default: now()                                          |

**Relationships**:

- N:1 → chats (many edges per chat)
- N:1 → nodes (from_node: edge source)
- N:1 → nodes (to_node: edge target)

**Key Patterns**:

- Directed edges: from_node → to_node
- Acyclic: no cycles in single chat (enforced at app level)
- Created when responding to an existing node
- Deleted when node is deleted

---

### 6. `notes` (User Annotations)

**Purpose**: User-created annotations/comments on individual nodes  
**Confidence**: HIGH  
**Source**: GraphViewer.tsx

| Column     | Type        | Nullable | Notes                                      |
| ---------- | ----------- | -------- | ------------------------------------------ |
| id         | uuid        | NO       | Primary Key                                |
| node_id    | uuid        | NO       | Foreign Key → nodes(id), ON DELETE CASCADE |
| content    | text        | NO       | Note text, required                        |
| created_at | timestamptz | NO       | Default: now()                             |

**Relationships**:

- N:1 → nodes (many notes per node)

**Key Patterns**:

- One-to-many: a node can have multiple notes
- Independent of edges; doesn't affect graph structure
- Displayed as orange nodes in the graph visualization

---

### 7. `external_resources` (External Links/Resources)

**Purpose**: External URLs/resources (YouTube, Notion, GitHub, Google Docs) attached to nodes  
**Confidence**: HIGH  
**Source**: GraphViewer.tsx

| Column        | Type        | Nullable | Notes                                                              |
| ------------- | ----------- | -------- | ------------------------------------------------------------------ |
| id            | uuid        | NO       | Primary Key                                                        |
| node_id       | uuid        | NO       | Foreign Key → nodes(id), ON DELETE CASCADE                         |
| title         | text        | NO       | Display name of resource, required                                 |
| resource_link | text        | NO       | Full URL, required                                                 |
| resource_type | text        | NO       | Enum: 'youtube' \| 'notion' \| 'github' \| 'google-docs' \| 'link' |
| created_at    | timestamptz | NO       | Default: now()                                                     |

**Relationships**:

- N:1 → nodes (many resources per node)

**Key Patterns**:

- resource_type auto-detected from URL pattern
- Displayed as icon-labeled nodes in graph (green)
- Clickable to open external link

---

## Indexing Strategy

| Index                          | Table              | Columns(s) | Purpose                                   |
| ------------------------------ | ------------------ | ---------- | ----------------------------------------- |
| idx_chats_user_id              | chats              | user_id    | List chats for user (most frequent query) |
| idx_chats_is_public            | chats              | is_public  | Find public chats for sharing             |
| idx_messages_chat_id           | messages           | chat_id    | Fetch thread messages by chat             |
| idx_nodes_chat_id              | nodes              | chat_id    | Fetch graph nodes by chat                 |
| idx_nodes_message_id           | nodes              | message_id | Reverse lookup: which node for message    |
| idx_edges_chat_id              | edges              | chat_id    | Fetch graph edges by chat                 |
| idx_edges_from_node            | edges              | from_node  | Outgoing edges from node                  |
| idx_edges_to_node              | edges              | to_node    | Incoming edges to node                    |
| idx_notes_node_id              | notes              | node_id    | Fetch notes for node                      |
| idx_external_resources_node_id | external_resources | node_id    | Fetch resources for node                  |

---

## Row Level Security (RLS) Policies

### Philosophy

- **Users own their chats**: Can only access/modify their own chats and descendants
- **Public chats are readable**: Anyone can view data from public chats
- **Nested auth checks**: Policies verify ownership through chat ancestry

### Summary

| Table              | Policy               | Effect                                            |
| ------------------ | -------------------- | ------------------------------------------------- |
| users              | View own profile     | Can view own user record                          |
| users              | Update own profile   | Can update own user record                        |
| chats              | View own or public   | Can view own chats + all public chats             |
| chats              | Create               | Can create chats (enforced: user_id = auth.uid()) |
| chats              | Update own           | Can only update own chats                         |
| chats              | Delete own           | Can only delete own chats                         |
| messages           | View in owned/public | Via nested join to chat                           |
| messages           | Insert in owned      | Can add messages to own chats                     |
| messages           | Delete from owned    | Can delete from own chats                         |
| nodes              | View in owned/public | Via nested join to chat                           |
| nodes              | Insert in owned      | Can add nodes to own chats                        |
| nodes              | Delete from owned    | Can delete from own chats                         |
| edges              | View in owned/public | Via nested join to chat                           |
| edges              | Insert in owned      | Can add edges to own chats                        |
| edges              | Delete from owned    | Can delete from own chats                         |
| notes              | View in owned/public | Via nested join to chat→nodes                     |
| notes              | Insert in owned      | Via nested join to chat→nodes                     |
| notes              | Update in owned      | Via nested join to chat→nodes                     |
| notes              | Delete from owned    | Via nested join to chat→nodes                     |
| external_resources | View in owned/public | Via nested join to chat→nodes                     |
| external_resources | Insert in owned      | Via nested join to chat→nodes                     |
| external_resources | Update in owned      | Via nested join to chat→nodes                     |
| external_resources | Delete from owned    | Via nested join to chat→nodes                     |

---

## Storage Buckets

**Status**: Not detected in codebase  
No Supabase Storage bucket references found. All data is stored in PostgreSQL tables.

---

## Auth Usage

- **Supabase Auth**: Email/password authentication (`.auth.signInWithPassword()`)
- **auth.users table**: Implicit; linked via `users.id` → `auth.users(id)`
- **Cookies-based**: Session persisted via browser cookies
- **Environment Variables**:
  - `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public API key
  - `NEXT_PUBLIC_TEST_USER_ID`: Hardcoded test user for demo

---

## Assumptions & Inferred Constraints

### High-Confidence Assumptions

1. **UUIDs as primary keys**: Standard Supabase pattern; detected from `gen_random_uuid()`
2. **Timestamps**: All tables have `created_at` with `timestamptz` (timezone-aware)
3. **Foreign key cascading**: ON DELETE CASCADE for all child tables to maintain referential integrity
4. **Message immutability**: No UPDATE or DELETE observed; only INSERT and SELECT
5. **No update timestamps**: No `updated_at` column detected; chats/messages/nodes are append-only or replace-only
6. **Single user context**: Test user ID hardcoded; multi-tenant but currently using one account
7. **Graph acyclicity**: Edges form DAG; cycles prevented at application level

### Medium-Confidence Assumptions

1. **Message sender enum**: Hardcoded check `sender in ('user', 'ai')`; no other values observed
2. **Resource type detection**: Inferred from URL patterns; frontend handles classification
3. **Text over JSON**: All complex data stored as text, not JSONB (e.g., message arrays)
4. **No audit logging**: No audit_log or change_history table detected
5. **RLS over app-level auth**: RLS policies check auth.uid() but app also enforces user_id checks

### Low-Confidence Guesses (Application-Level Constraints)

1. **Node title ≈ user question**: Code shows `.title = user_input`; but could be editable
2. **Acyclic graphs**: No cycle detection in SQL; app must prevent
3. **Foreign key integrity**: Assumed ON DELETE CASCADE; not explicitly coded
4. **Summary length**: First 4 words + "..." hardcoded in app; no DB-level truncation
5. **Resource type whitelist**: Only 5 types detected; others possible but not seen
6. **No soft deletes**: DELETE operations are hard; no deleted_at column

---

## Missing Features (Not in Code)

Based on typical SaaS platforms, these were NOT detected:

- ❌ Analytics/tracking tables
- ❌ Audit logs (who changed what when)
- ❌ User roles/permissions beyond ownership
- ❌ Rate limiting tables
- ❌ Subscription/billing
- ❌ File uploads to Storage
- ❌ Real-time subscriptions setup in code
- ❌ Backup/archive tables
- ❌ A/B testing flags

---

## Migration Path

To deploy this schema in a new Supabase project:

1. **Create a new Supabase project**
2. **Copy the entire schema file**: `supabase_schema.sql`
3. **Open Supabase SQL Editor**
4. **Paste and execute the entire script** (handle dependencies automatically via ALTER)
5. **Verify all tables exist**:
   ```sql
   SELECT table_name FROM information_schema.tables where table_schema = 'public';
   ```
6. **Verify RLS is enabled**:
   ```sql
   SELECT schemaname, tablename, rowsecurity FROM pg_tables
   WHERE schemaname = 'public' and rowsecurity;
   ```
7. **Test a basic query** with authenticated user:
   ```sql
   INSERT INTO public.chats (user_id, title)
   VALUES (auth.uid(), 'Test Chat');
   ```

---

## Notes

- **No migrations found**: Entire schema reverse-engineered from client code
- **Test user hardcoded**: `NEXT_PUBLIC_TEST_USER_ID` environment variable; not production-ready
- **RLS policies comprehensive**: All tables protected; public read allowed for shared chats
- **Fully executable**: Script can run as-is in Supabase SQL editor
- **Self-documenting**: Comments on all tables and columns with confidence levels

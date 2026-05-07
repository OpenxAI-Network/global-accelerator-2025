# Learn-Trace Database - Quick Reference

## 🏗️ Schema Overview

**7 Tables** | **10+ Indexes** | **40+ RLS Policies** | **6 Foreign Keys**

```
Users ←→ Chats ←→ Messages
          ↓
        Nodes
        ├─→ Notes
        ├─→ External Resources
        └─→ Edges (Nodes→Nodes)
```

---

## 🔑 Essential Queries

### List User's Chats

```typescript
const { data: chats } = await supabase
  .from("chats")
  .select("id, title, created_at, is_public")
  .eq("user_id", userId)
  .order("created_at", { ascending: false });
```

### Fetch Chat Messages

```typescript
const { data: messages } = await supabase
  .from("messages")
  .select("*")
  .eq("chat_id", chatId)
  .order("created_at", { ascending: true });
```

### Get Knowledge Graph

```typescript
const { data: nodes } = await supabase
  .from("nodes")
  .select("*")
  .eq("chat_id", chatId);

const { data: edges } = await supabase
  .from("edges")
  .select("*")
  .eq("chat_id", chatId);

const { data: notes } = await supabase
  .from("notes")
  .select("*")
  .in(
    "node_id",
    nodes.map((n) => n.id),
  );

const { data: resources } = await supabase
  .from("external_resources")
  .select("*")
  .in(
    "node_id",
    nodes.map((n) => n.id),
  );
```

### Create a Chat

```typescript
const { data: newChat } = await supabase
  .from("chats")
  .insert({
    user_id: userId,
    title: "New Chat",
    is_public: false,
  })
  .select()
  .single();
```

### Add Message + Node

```typescript
// 1. Insert user message
const { data: userMsg } = await supabase
  .from("messages")
  .insert({
    chat_id: chatId,
    sender: "user",
    content: "What is AI?",
    summary: "What is AI?...",
  })
  .select()
  .single();

// 2. Call AI
const aiResponse = await fetchFromPerplexity(userMsg.content);

// 3. Insert AI message
const { data: aiMsg } = await supabase
  .from("messages")
  .insert({
    chat_id: chatId,
    sender: "ai",
    content: aiResponse,
    summary: aiResponse.substring(0, 4 * 10) + "...",
  })
  .select()
  .single();

// 4. Create node
const { data: node } = await supabase
  .from("nodes")
  .insert({
    chat_id: chatId,
    message_id: aiMsg.id,
    title: userMsg.content,
    answer: aiResponse,
    summary: aiResponse.substring(0, 20),
  })
  .select()
  .single();

// 5. Optional: Create edge to parent node
if (parentNodeId) {
  await supabase.from("edges").insert({
    chat_id: chatId,
    from_node: parentNodeId,
    to_node: node.id,
  });
}
```

### Share a Chat

```typescript
await supabase
  .from("chats")
  .update({ is_public: true })
  .eq("id", chatId)
  .eq("user_id", userId);
```

### Add Note to Node

```typescript
const { data: note } = await supabase
  .from("notes")
  .insert({
    node_id: nodeId,
    content: "Important point...",
  })
  .select()
  .single();
```

### Add Resource Link

```typescript
const { data: resource } = await supabase
  .from("external_resources")
  .insert({
    node_id: nodeId,
    title: "YouTube Tutorial",
    resource_link: "https://youtube.com/watch?v=...",
    resource_type: "youtube", // auto-detect: youtube, notion, github, google-docs, link
  })
  .select()
  .single();
```

### Delete Node (Cascades)

```typescript
// 1. Find all messages for this node
const { data: messages } = await supabase
  .from("messages")
  .select("id, created_at")
  .eq("chat_id", chatId)
  .order("created_at", { ascending: false });

// 2. Delete edges pointing to/from this node
await supabase
  .from("edges")
  .delete()
  .or(`from_node.eq.${nodeId},to_node.eq.${nodeId}`);

// 3. Delete the node (cascades: notes, resources)
await supabase.from("nodes").delete().eq("id", nodeId);
```

---

## 📋 Table Schemas

### `users`

```
id              uuid (PK) → auth.users(id)
username        text? (max 30)
created_at      timestamptz
```

### `chats`

```
id              uuid (PK)
user_id         uuid (FK → users)
title           text (required)
is_public       boolean (default: false)
last_node_id    uuid? (FK → nodes)
created_at      timestamptz
```

### `messages`

```
id              uuid (PK)
chat_id         uuid (FK → chats)
sender          text ('user' | 'ai')
content         text (required)
summary         text?
created_at      timestamptz
```

### `nodes`

```
id              uuid (PK)
chat_id         uuid (FK → chats)
message_id      uuid? (FK → messages)
title           text (required - user question)
answer          text (required - AI response)
summary         text?
created_at      timestamptz
```

### `edges`

```
id              uuid (PK)
chat_id         uuid (FK → chats)
from_node       uuid (FK → nodes)
to_node         uuid (FK → nodes)
created_at      timestamptz
```

### `notes`

```
id              uuid (PK)
node_id         uuid (FK → nodes)
content         text (required)
created_at      timestamptz
```

### `external_resources`

```
id              uuid (PK)
node_id         uuid (FK → nodes)
title           text (required)
resource_link   text (required)
resource_type   text ('youtube'|'notion'|'github'|'google-docs'|'link')
created_at      timestamptz
```

---

## 🔐 RLS Policies

| Table              | Allows                                               |
| ------------------ | ---------------------------------------------------- |
| users              | View/update own profile                              |
| chats              | View own + public; edit/delete own                   |
| messages           | View from owned/public chats; create in owned        |
| nodes              | View from owned/public chats; create/delete in owned |
| edges              | View from owned/public chats; create/delete in owned |
| notes              | View/create/update/delete in owned chats             |
| external_resources | View/create/update/delete in owned chats             |

---

## 📊 Indexes

```sql
idx_chats_user_id              -- List chats per user
idx_chats_is_public            -- Find public chats
idx_messages_chat_id           -- Fetch thread
idx_nodes_chat_id              -- Fetch graph nodes
idx_nodes_message_id           -- Reverse lookup
idx_edges_chat_id              -- Fetch graph edges
idx_edges_from_node            -- Outgoing edges
idx_edges_to_node              -- Incoming edges
idx_notes_node_id              -- Fetch notes
idx_external_resources_node_id -- Fetch resources
```

---

## ⚙️ Setup Steps

1. **Copy schema**: `supabase_schema.sql`
2. **Paste into Supabase SQL Editor**
3. **Run entire file**
4. **Verify**: Check tables exist
5. **.env.local**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   NEXT_PUBLIC_TEST_USER_ID=...
   ```

---

## 🐛 Debugging

### Check RLS is working

```sql
-- Should only see own chats
SELECT * FROM chats;

-- Should fail if trying to access other user's chat
SELECT * FROM chats WHERE user_id = 'different-user-id';
```

### Check constraints

```sql
SELECT constraint_name FROM information_schema.table_constraints
WHERE table_schema = 'public' AND table_name = 'chats';
```

### Check indexes

```sql
SELECT indexname FROM pg_indexes WHERE schemaname = 'public';
```

---

## 🚀 Performance Tips

✅ **DO:**

- Filter by user_id early
- Use indexes (`user_id`, `chat_id`, `node_id`)
- Paginate results: `.range(0, 50)`
- Cache frequently accessed data

❌ **DON'T:**

- Fetch all messages without pagination
- Use OR queries (slow with RLS)
- Make N+1 queries in loops
- Query without filters

---

## 📚 File Structure

```
supabase_schema.sql          -- Complete DDL (run this first)
SCHEMA_DOCUMENTATION.md      -- Full table specs + ERD
DEPLOYMENT_GUIDE.md          -- Setup + verification
RECONSTRUCTION_REPORT.md     -- Analysis + confidence
QUICK_REFERENCE.md           -- This file
```

---

## 💡 Common Patterns

### Pattern: Get chat with all related data

```typescript
async function getChatWithAll(chatId: string) {
  const [chats, messages, nodes, edges, notes, resources] = await Promise.all([
    supabase.from("chats").select("*").eq("id", chatId).single(),
    supabase.from("messages").select("*").eq("chat_id", chatId),
    supabase.from("nodes").select("*").eq("chat_id", chatId),
    supabase.from("edges").select("*").eq("chat_id", chatId),
    supabase
      .from("notes")
      .select("*")
      .in(
        "node_id",
        nodes.map((n) => n.id),
      ),
    supabase
      .from("external_resources")
      .select("*")
      .in(
        "node_id",
        nodes.map((n) => n.id),
      ),
  ]);
  return { chats, messages, nodes, edges, notes, resources };
}
```

### Pattern: Create full message + node + optional edge

```typescript
async function addMessageAndNode(
  chatId: string,
  userInput: string,
  parentNodeId?: string,
) {
  // 1. Create user message
  const { data: userMsg } = await supabase
    .from("messages")
    .insert({
      chat_id: chatId,
      sender: "user",
      content: userInput,
      summary: userInput.split(" ").slice(0, 4).join(" ") + "...",
    })
    .select()
    .single();

  // 2. Get AI response
  const aiResponse = await fetchFromPerplexity(userInput);

  // 3. Create AI message
  const { data: aiMsg } = await supabase
    .from("messages")
    .insert({
      chat_id: chatId,
      sender: "ai",
      content: aiResponse,
      summary: aiResponse.split(" ").slice(0, 4).join(" ") + "...",
    })
    .select()
    .single();

  // 4. Create node
  const { data: node } = await supabase
    .from("nodes")
    .insert({
      chat_id: chatId,
      message_id: aiMsg.id,
      title: userInput,
      answer: aiResponse,
      summary: aiResponse.substring(0, 20),
    })
    .select()
    .single();

  // 5. Optional: Create edge
  if (parentNodeId) {
    await supabase.from("edges").insert({
      chat_id: chatId,
      from_node: parentNodeId,
      to_node: node.id,
    });
  }

  return { userMsg, aiMsg, node };
}
```

---

## 🔗 External Resources

- [Supabase Docs](https://supabase.com/docs)
- [PostGIS](https://www.postgresql.org/docs/)
- [Learn-Trace GitHub](../README.md)

---

**Version**: 1.0  
**Last Updated**: April 28, 2026  
**Status**: ✅ Production Ready

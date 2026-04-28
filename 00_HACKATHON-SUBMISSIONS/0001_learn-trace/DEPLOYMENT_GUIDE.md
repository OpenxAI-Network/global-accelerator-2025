# Learn-Trace Database Schema - Deployment & Verification Guide

## Quick Start

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Copy & Execute Schema
1. Open `supabase_schema.sql` from this repository
2. Copy the entire file contents
3. Paste into Supabase SQL Editor
4. Click **Run** (or Ctrl+Enter)

### Step 3: Verify Success
```bash
# Run these queries in SQL Editor to confirm all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected output (7 tables):
```
chats
edges
external_resources
messages
nodes
notes
users
```

---

## Verification Checklist

### ✅ Step 1: Tables Exist
```sql
-- Should return 7 rows
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### ✅ Step 2: Foreign Keys Intact
```sql
-- Should return 9 constraints
SELECT constraint_name, table_name 
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
  AND table_schema = 'public' 
ORDER BY table_name;
```

Expected constraints:
- chats → users (user_id)
- chats → nodes (last_node_id)
- messages → chats (chat_id)
- nodes → chats (chat_id)
- nodes → messages (message_id)
- edges → chats (chat_id)
- edges → nodes (from_node)
- edges → nodes (to_node)
- notes → nodes (node_id)
- external_resources → nodes (node_id)

### ✅ Step 3: Indexes Exist
```sql
-- Should return 10+ indexes
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

### ✅ Step 4: RLS Enabled
```sql
-- Should return 7 rows (all tables)
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = true 
ORDER BY tablename;
```

### ✅ Step 5: RLS Policies Exist
```sql
-- Should return 40+ policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

### ✅ Step 6: Constraints
```sql
-- Verify CHECK constraints exist
SELECT table_name, constraint_name 
FROM information_schema.table_constraints 
WHERE constraint_type = 'CHECK' 
  AND table_schema = 'public';
```

---

## Integration with Application

### 1. Environment Setup

Create/update `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_TEST_USER_ID=<your-test-user-id>
NEXT_PUBLIC_PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. Create Test User (Optional)

If you want to use the app without the test user ID:

```sql
-- Option A: Use Supabase Auth directly
-- 1. Create auth account via Supabase dashboard
-- 2. Copy the UUID from auth.users table
-- 3. Insert into public.users table:

INSERT INTO public.users (id, username)
VALUES ('00000000-0000-0000-0000-000000000000', 'Test User');
```

### 3. Test Application Flow

```typescript
// Check that queries work:

// Create a chat
const { data: chat } = await supabase
  .from('chats')
  .insert({ user_id: userId, title: 'Test Chat', is_public: false })
  .select()
  .single();

// Insert a message
const { data: message } = await supabase
  .from('messages')
  .insert({ chat_id: chat.id, sender: 'user', content: 'Hello' })
  .select()
  .single();

// Create a node in the graph
const { data: node } = await supabase
  .from('nodes')
  .insert({
    chat_id: chat.id,
    message_id: message.id,
    title: 'Test Question',
    answer: 'Test Answer',
    summary: 'Test...'
  })
  .select()
  .single();

// Add an edge
await supabase
  .from('edges')
  .insert({ chat_id: chat.id, from_node: node.id, to_node: node.id });

// Add a note
await supabase
  .from('notes')
  .insert({ node_id: node.id, content: 'My note' });

// Add an external resource
await supabase
  .from('external_resources')
  .insert({
    node_id: node.id,
    title: 'YouTube Link',
    resource_link: 'https://youtube.com/watch?v=...',
    resource_type: 'youtube'
  });
```

---

## Troubleshooting

### Issue: "Permission denied" error
**Cause**: RLS policies rejecting query  
**Fix**: Ensure you're authenticated and querying your own data; check RLS policies

### Issue: "Foreign key violation"
**Cause**: Referential integrity error  
**Fix**: Ensure parent record exists before inserting child; on deletes, child records cascade

### Issue: "Relation does not exist"
**Cause**: Schema not deployed  
**Fix**: Run the entire SQL schema file again

### Issue: RLS policies not working
**Cause**: `auth.uid()` returns NULL (user not authenticated)  
**Fix**: Ensure user is logged in before making queries

### Issue: "Function for type UUID doesn't exist"
**Cause**: UUID extension not loaded  
**Fix**: The schema file loads extensions automatically; re-run the schema

---

## Backup & Restore

### Backup Schema (PostgreSQL Dump)

```bash
# Using pg_dump (if you have PostgreSQL CLI installed)
pg_dump \
  --host db.supabase.co \
  --port 5432 \
  --username postgres \
  --password \
  --data-only \
  <project-name> > backup_data.sql
```

### Backup via Supabase Dashboard

1. Go to **Database** → **Backups**
2. Click **Request backup**
3. Wait for backup to complete
4. Download if needed

---

## Performance Considerations

### Indexes
- Created on all foreign keys (chat_id, user_id, node_id, etc.)
- Optimize most common queries (listing chats, fetching messages)

### RLS Policies
- Nested JOINs in policies may impact query speed on very large datasets
- Consider denormalizing ownership to top level if scaling beyond 100k+ chats

### Query Optimization Tips

```sql
-- ✅ Good: Use indexes
SELECT * FROM chats WHERE user_id = $1 ORDER BY created_at DESC;

-- ❌ Avoid: Complex nested aggregations
SELECT chat_id, COUNT(*) FROM messages GROUP BY chat_id;

-- ✅ Better: Add index on computed columns if needed
CREATE INDEX idx_messages_chat_count ON messages(chat_id);
```

---

## Data Migration (from Old Schema)

If you have data in the old system:

```sql
-- Step 1: Disable RLS temporarily (careful!)
ALTER TABLE public.chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
-- ... repeat for all tables ...

-- Step 2: Import old data
COPY chats FROM 'chats.csv' WITH (FORMAT csv, HEADER);
COPY messages FROM 'messages.csv' WITH (FORMAT csv, HEADER);
-- ... etc ...

-- Step 3: Re-enable RLS
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
-- ... repeat for all tables ...

-- Step 4: Verify integrity
SELECT COUNT(*) FROM chats;
SELECT COUNT(*) FROM messages;
-- ... etc ...
```

---

## Column Constraints Reference

### users
- `username`: max 30 characters

### chats
- `title`: must not be empty

### messages
- `sender`: must be 'user' or 'ai'
- `content`: must not be empty

### nodes
- `title`: must not be empty (user's question)
- `answer`: must not be empty (AI's response)

### edges
- `from_node` != `to_node`: no self-loops

### notes
- `content`: must not be empty

### external_resources
- `resource_type`: must be one of: 'youtube', 'notion', 'github', 'google-docs', 'link'

---

## Extensions Used

```sql
-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cryptography (if needed for future features)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

Both are loaded automatically by the schema file.

---

## Testing the RLS

```sql
-- As authenticated user
SELECT * FROM chats; -- Should only see own chats + public chats

-- Try to access another user's chat
SELECT * FROM chats WHERE user_id = 'other-user-id'; -- Should return 0 rows

-- Try to insert into another user's chat
INSERT INTO messages (chat_id, sender, content)
VALUES ('other-user-chat-id', 'user', 'Hack attempt');
-- Should fail with permission denied
```

---

## Final Steps

1. ✅ Run schema file
2. ✅ Verify all tables exist
3. ✅ Enable RLS for all tables
4. ✅ Test basic queries
5. ✅ Set environment variables in `.env.local`
6. ✅ Create test user and test flow
7. ✅ Deploy application

---

## Support

If you encounter issues during deployment:

1. Check Supabase status: [status.supabase.com](https://status.supabase.com)
2. Review error messages in SQL Editor
3. Re-run the schema file to ensure all DDL executed
4. Verify foreign key constraints exist
5. Test RLS policies separately

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Indexes](https://www.postgresql.org/docs/current/indexes.html)


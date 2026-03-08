-- 2. Create Documents Metadata Table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL, -- Application the document belongs to
    user_id UUID, -- Optional: User who uploaded it
    file_path TEXT NOT NULL, -- Path in Supabase storage
    file_name TEXT NOT NULL, -- Display name (e.g. "Bank Statement.pdf")
    file_type TEXT, -- (e.g. "application/pdf")
    verified BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    data JSONB -- Full original object for fallback
);

CREATE INDEX IF NOT EXISTS idx_documents_application_id ON documents(application_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;

-- 4. Create Security Policies
-- Allow users to view their own applications
CREATE POLICY "Users can view own applications" 
ON loan_applications FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Allow users to create applications (including draft)
CREATE POLICY "Users can create applications" 
ON loan_applications FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own applications
CREATE POLICY "Users can update own applications" 
ON loan_applications FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);
```

## Part 2: Migrate Documents (SQL ONLY)

Run this AFTER migrating applications. This moves document records from the KV store instantly.

```sql
INSERT INTO documents (
    id, application_id, user_id, 
    file_path, file_name, file_type, 
    verified, uploaded_at, data
)
SELECT
    (value->>'id')::uuid,
    (value->>'applicationId')::uuid, -- Link to application
    (value->>'userId')::uuid, -- Owner of document
    COALESCE(value->>'filePath', value->>'path'), 
    COALESCE(value->>'fileName', value->>'name'), 
    value->>'fileType', 
    COALESCE((value->>'verified')::boolean, false), 
    COALESCE((value->>'uploadedAt')::timestamptz, (value->>'createdAt')::timestamptz, NOW()),
    value
FROM
    kv_store_1ed353c1
WHERE
    key LIKE 'document:%'
ON CONFLICT (id) DO UPDATE
SET
    application_id = EXCLUDED.application_id,
    user_id = EXCLUDED.user_id,
    file_path = EXCLUDED.file_path,
    data = EXCLUDED.data;
```

## Part 3: Verify Integrity

Check if the migration worked:
```sql
SELECT COUNT(*) FROM loan_applications;
-- Compare with:
SELECT COUNT(*) FROM kv_store_1ed353c1 WHERE key LIKE 'loan_application:%';
```

## Part 4: Cleanup (Optional, only run after verifying multiple times)

```sql
-- DELETE FROM kv_store_1ed353c1 WHERE key LIKE 'loan_application:%';
-- DELETE FROM kv_store_1ed353c1 WHERE key LIKE 'user_applications:%';
```

## Next Steps
1. Run Part 1 to create tables.
2. Run Part 2 to migrate existing data.
3. Deploy the updated backend code:
   `npx supabase functions deploy server`


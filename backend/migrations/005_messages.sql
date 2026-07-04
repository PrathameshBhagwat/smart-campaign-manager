-- Phase 5.1 — Messages Infrastructure
-- Decision: Using hard deletes for MVP simplicity. Soft deletes (deleted_at) can be added later without breaking changes.

-- 1. Create messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    channel TEXT NOT NULL DEFAULT 'linkedin',
    generation_source TEXT NOT NULL DEFAULT 'manual',
    version INTEGER NOT NULL DEFAULT 1,
    copied_count INTEGER NOT NULL DEFAULT 0,
    last_copied_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 2. Constraints
ALTER TABLE messages ADD CONSTRAINT messages_channel_check
CHECK (channel IN ('linkedin', 'whatsapp', 'email'));

ALTER TABLE messages ADD CONSTRAINT messages_source_check
CHECK (generation_source IN ('manual', 'ai'));

ALTER TABLE messages ADD CONSTRAINT messages_version_check
CHECK (version >= 1);

ALTER TABLE messages ADD CONSTRAINT messages_copied_count_check
CHECK (copied_count >= 0);

-- 3. Indexes
CREATE INDEX idx_messages_contact ON messages (contact_id);
CREATE INDEX idx_messages_created ON messages (created_at DESC);
CREATE INDEX idx_messages_channel ON messages (channel);

-- 4. Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- SELECT: User can only read messages for contacts in their campaigns
CREATE POLICY "Users can read their own messages"
ON messages FOR SELECT
USING (
    contact_id IN (
        SELECT c.id FROM contacts c
        JOIN campaigns camp ON c.campaign_id = camp.id
        WHERE camp.user_id = auth.uid()
    )
);

-- INSERT: User can only create messages for contacts in their campaigns
CREATE POLICY "Users can create messages for their contacts"
ON messages FOR INSERT
WITH CHECK (
    contact_id IN (
        SELECT c.id FROM contacts c
        JOIN campaigns camp ON c.campaign_id = camp.id
        WHERE camp.user_id = auth.uid()
    )
);

-- UPDATE: User can only update messages for contacts in their campaigns
CREATE POLICY "Users can update their own messages"
ON messages FOR UPDATE
USING (
    contact_id IN (
        SELECT c.id FROM contacts c
        JOIN campaigns camp ON c.campaign_id = camp.id
        WHERE camp.user_id = auth.uid()
    )
);

-- DELETE: User can only delete messages for contacts in their campaigns
CREATE POLICY "Users can delete their own messages"
ON messages FOR DELETE
USING (
    contact_id IN (
        SELECT c.id FROM contacts c
        JOIN campaigns camp ON c.campaign_id = camp.id
        WHERE camp.user_id = auth.uid()
    )
);

-- 5. Atomic copy count increment (prevents race conditions)
CREATE OR REPLACE FUNCTION increment_copy_count(msg_id UUID, copy_time TIMESTAMPTZ)
RETURNS TABLE(copied_count INTEGER, last_copied_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    UPDATE messages
    SET copied_count = messages.copied_count + 1,
        last_copied_at = copy_time
    WHERE id = msg_id
    RETURNING messages.copied_count, messages.last_copied_at;
END;
$$;

-- Phase 5.1.1 — Message Infrastructure Hardening & AI Readiness

-- 1. Add fields
ALTER TABLE messages
ADD COLUMN status TEXT NOT NULL DEFAULT 'draft';

ALTER TABLE messages
ADD COLUMN character_count INTEGER NOT NULL DEFAULT 0;

-- 2. Add Status Constraint
ALTER TABLE messages
ADD CONSTRAINT chk_message_status
CHECK (
  status IN (
    'draft',
    'ready',
    'archived'
  )
);

-- 3. Version Constraint (Was added in Phase 5.1 but let's reinforce or ensure it exists, wait, the user's prompt says to Enforce: chk_message_version CHECK (version >= 1); In 005 we already added messages_version_check. I will drop that and replace with chk_message_version for consistency).
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_version_check;
ALTER TABLE messages
ADD CONSTRAINT chk_message_version
CHECK (version >= 1);

-- 4. Content Constraint
ALTER TABLE messages
ADD CONSTRAINT chk_message_content
CHECK (
  char_length(trim(content)) >= 10
);

-- 5. Character Count Trigger
CREATE OR REPLACE FUNCTION calculate_character_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    NEW.character_count := char_length(
        trim(
            regexp_replace(
                NEW.content,
                '\s+',
                ' ',
                'g'
            )
        )
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_calculate_character_count ON messages;
CREATE TRIGGER trigger_calculate_character_count
BEFORE INSERT OR UPDATE
ON messages
FOR EACH ROW
EXECUTE FUNCTION calculate_character_count();

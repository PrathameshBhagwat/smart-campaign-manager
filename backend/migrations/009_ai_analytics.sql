-- Phase 5.2.2 — AI Analytics & Generation Monitoring

-- 1. Extend Messages Table
ALTER TABLE messages
ADD COLUMN ai_provider TEXT NULL;

ALTER TABLE messages
ADD COLUMN generation_error TEXT NULL;

ALTER TABLE messages
ADD COLUMN regeneration_count INTEGER NOT NULL DEFAULT 0;

-- 2. Update Message Status Constraint
ALTER TABLE messages DROP CONSTRAINT IF EXISTS chk_message_status;

ALTER TABLE messages
ADD CONSTRAINT chk_message_status
CHECK (
  status IN (
    'draft',
    'ready',
    'failed',
    'archived'
  )
);

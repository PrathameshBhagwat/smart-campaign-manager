-- Phase 5.3.1 - Bulk Insights

-- Add AI quality score and outdated flag to messages
ALTER TABLE messages
ADD COLUMN ai_quality_score INTEGER NULL CHECK (ai_quality_score >= 0 AND ai_quality_score <= 100),
ADD COLUMN is_outdated BOOLEAN NOT NULL DEFAULT FALSE;

-- Add average generation time to jobs
ALTER TABLE bulk_generation_jobs
ADD COLUMN average_generation_time_ms INTEGER NULL;

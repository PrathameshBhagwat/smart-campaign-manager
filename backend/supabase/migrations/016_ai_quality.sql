-- Migration 016: AI Quality Engine

ALTER TABLE messages ADD COLUMN IF NOT EXISTS quality_score INTEGER NULL;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS quality_label TEXT NULL;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS quality_reasons JSONB DEFAULT '[]'::jsonb;

-- Constraints
ALTER TABLE messages ADD CONSTRAINT check_quality_score 
    CHECK (quality_score IS NULL OR (quality_score BETWEEN 0 AND 100));

ALTER TABLE messages ADD CONSTRAINT check_quality_label 
    CHECK (quality_label IS NULL OR quality_label IN ('excellent', 'good', 'needs_review'));

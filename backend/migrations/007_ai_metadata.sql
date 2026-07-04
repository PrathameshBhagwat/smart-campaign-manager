-- Phase 5.2 — Single AI Message Generation Metadata

ALTER TABLE messages
ADD COLUMN ai_model TEXT NULL;

ALTER TABLE messages
ADD COLUMN prompt_version TEXT NOT NULL DEFAULT 'v1';

ALTER TABLE messages
ADD COLUMN generation_duration_ms INTEGER NULL;

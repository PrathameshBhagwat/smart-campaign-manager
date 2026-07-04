-- Phase 5.2.1 — AI Reliability, Security & Cost Controls Metadata

ALTER TABLE messages
ADD COLUMN input_tokens INTEGER NULL,
ADD COLUMN output_tokens INTEGER NULL,
ADD COLUMN estimated_cost_usd DECIMAL(10,6) NULL,
ADD COLUMN prompt_hash TEXT NULL;

CREATE TABLE ai_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    message_id UUID NULL REFERENCES messages(id) ON DELETE SET NULL,
    model TEXT NOT NULL,
    prompt_version TEXT NOT NULL,
    channel TEXT NOT NULL,
    cache_hit BOOLEAN NOT NULL DEFAULT FALSE,
    input_tokens INTEGER NOT NULL,
    output_tokens INTEGER NOT NULL,
    estimated_cost_usd DECIMAL(10,6) NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_usage_user_date ON ai_usage(user_id, generated_at DESC);
CREATE INDEX idx_ai_usage_message ON ai_usage(message_id);

ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own usage" 
ON ai_usage FOR SELECT 
USING (auth.uid() = user_id);

-- Only backend service role performs writes, so no INSERT/UPDATE/DELETE policies for public/authenticated users.

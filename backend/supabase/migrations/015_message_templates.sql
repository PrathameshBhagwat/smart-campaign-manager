-- Migration 015: Message Templates

CREATE TABLE IF NOT EXISTS message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    name TEXT NOT NULL,
    description TEXT,
    channel TEXT NOT NULL,
    business_type TEXT NOT NULL,
    template_scope TEXT DEFAULT 'global',
    campaign_id UUID NULL REFERENCES campaigns(id),
    content TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    usage_count INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Constraints
ALTER TABLE message_templates ADD CONSTRAINT check_templates_channel 
    CHECK (channel IN ('linkedin', 'email', 'whatsapp'));

ALTER TABLE message_templates ADD CONSTRAINT check_templates_business_type 
    CHECK (business_type IN ('education', 'finance', 'recruitment', 'real_estate', 'generic', 'custom'));

ALTER TABLE message_templates ADD CONSTRAINT check_templates_scope 
    CHECK (template_scope IN ('global', 'campaign'));

ALTER TABLE message_templates ADD CONSTRAINT check_templates_content 
    CHECK (char_length(trim(content)) BETWEEN 20 AND 2000);

ALTER TABLE message_templates ADD CONSTRAINT check_templates_version 
    CHECK (version >= 1);

ALTER TABLE message_templates ADD CONSTRAINT check_templates_usage_count 
    CHECK (usage_count >= 0);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_templates_user ON message_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_business ON message_templates(business_type);
CREATE INDEX IF NOT EXISTS idx_templates_channel ON message_templates(channel);
CREATE INDEX IF NOT EXISTS idx_templates_campaign ON message_templates(campaign_id);

-- RLS
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own templates" 
    ON message_templates 
    FOR ALL 
    USING (user_id = auth.uid());

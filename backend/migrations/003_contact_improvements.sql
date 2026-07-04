-- Modify imports table to add new columns
ALTER TABLE imports ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'processing';
ALTER TABLE imports ADD COLUMN IF NOT EXISTS total_errors INTEGER DEFAULT 0;
ALTER TABLE imports ADD COLUMN IF NOT EXISTS error_details JSONB DEFAULT '[]';

-- Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_contacts_campaign_status ON contacts (campaign_id, status);
CREATE INDEX IF NOT EXISTS idx_contacts_campaign_created ON contacts (campaign_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts (email);
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts (phone);

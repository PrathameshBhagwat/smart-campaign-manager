-- Imports Table
CREATE TABLE imports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    imported_count INTEGER DEFAULT 0,
    skipped_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies for imports
ALTER TABLE imports ENABLE ROW LEVEL SECURITY;

-- Imports: Users can only see and modify imports for their campaigns
CREATE POLICY "Users can manage imports in their campaigns" 
ON imports FOR ALL 
USING (
    campaign_id IN (
        SELECT id FROM campaigns WHERE user_id = auth.uid()
    )
);

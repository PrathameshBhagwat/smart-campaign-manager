-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Campaigns Table
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    course_name TEXT NOT NULL,
    city TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contacts Table
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    job_title TEXT,
    city TEXT,
    status TEXT DEFAULT 'New',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages Table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    copied_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Campaigns: Users can only see and modify their own campaigns
CREATE POLICY "Users can manage their own campaigns" 
ON campaigns FOR ALL 
USING (auth.uid() = user_id);

-- Contacts: Users can only see and modify contacts in their campaigns
CREATE POLICY "Users can manage contacts in their campaigns" 
ON contacts FOR ALL 
USING (
    campaign_id IN (
        SELECT id FROM campaigns WHERE user_id = auth.uid()
    )
);

-- Messages: Users can only see and modify messages for their contacts
CREATE POLICY "Users can manage messages for their contacts" 
ON messages FOR ALL 
USING (
    contact_id IN (
        SELECT id FROM contacts WHERE campaign_id IN (
            SELECT id FROM campaigns WHERE user_id = auth.uid()
        )
    )
);

-- Phase 4.6 Data Integrity Migration

-- 1. Contact Status Constraint
ALTER TABLE contacts 
ADD CONSTRAINT contacts_status_check 
CHECK (status IN ('New', 'Contacted', 'Interested', 'Enrolled'));

-- 2. Contact Identity Constraint
ALTER TABLE contacts 
ADD CONSTRAINT contacts_identity_check 
CHECK (email IS NOT NULL OR phone IS NOT NULL);

-- 3. Unique Email Constraint per Campaign
CREATE UNIQUE INDEX idx_unique_campaign_email 
ON contacts (campaign_id, email) 
WHERE email IS NOT NULL;

-- 4. Unique Phone Constraint per Campaign
CREATE UNIQUE INDEX idx_unique_campaign_phone 
ON contacts (campaign_id, phone) 
WHERE phone IS NOT NULL;

-- 5. Import Status Constraint
ALTER TABLE imports 
ADD CONSTRAINT imports_status_check 
CHECK (status IN ('processing', 'completed', 'failed'));
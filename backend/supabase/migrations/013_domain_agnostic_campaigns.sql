-- Migration 013: Domain-Agnostic AI Campaigns

-- 1. Add new columns
ALTER TABLE campaigns
ADD COLUMN business_type TEXT DEFAULT 'education';

ALTER TABLE campaigns
ADD COLUMN offering_type TEXT NULL;

ALTER TABLE campaigns
ADD COLUMN offering_name TEXT NULL;

ALTER TABLE campaigns
ADD COLUMN target_goal TEXT NULL;

ALTER TABLE campaigns
ADD COLUMN business_config JSONB DEFAULT '{}'::jsonb;

-- 2. Add CHECK constraints
ALTER TABLE campaigns
ADD CONSTRAINT check_business_type 
CHECK (business_type IN ('education', 'finance', 'recruitment', 'real_estate', 'generic', 'custom'));

ALTER TABLE campaigns
ADD CONSTRAINT check_offering_type 
CHECK (offering_type IN ('course', 'bootcamp', 'mentorship', 'workshop', 'program', 'service', 'product', 'event') OR offering_type IS NULL);

ALTER TABLE campaigns
ADD CONSTRAINT check_target_goal 
CHECK (target_goal IN ('enrollment', 'lead_generation', 'applications', 'networking', 'awareness', 'sales') OR target_goal IS NULL);

-- 3. Data Migration for existing campaigns
UPDATE campaigns
SET
  business_type = 'education',
  offering_type = 'course',
  offering_name = course_name,
  target_goal = 'enrollment'
WHERE offering_name IS NULL;

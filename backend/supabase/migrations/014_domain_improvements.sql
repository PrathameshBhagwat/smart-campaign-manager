-- Migration 014: Domain Intelligence Improvements

-- 1. Create index for faster business type analytics
CREATE INDEX IF NOT EXISTS idx_campaigns_business_type ON campaigns(business_type);

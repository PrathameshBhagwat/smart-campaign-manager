-- Phase 5.2.3 — Outreach Actions

-- 1. Contacts Table Extensions
ALTER TABLE contacts
ADD COLUMN linkedin_url TEXT NULL;

ALTER TABLE contacts
ADD COLUMN preferred_contact_method TEXT NULL;

-- 2. Indexes
CREATE INDEX idx_contacts_linkedin
ON contacts(linkedin_url);

CREATE INDEX idx_contacts_preferred_method
ON contacts(preferred_contact_method);

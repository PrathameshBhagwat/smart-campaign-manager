-- Phase 5.3 — Bulk AI Message Generation

CREATE TABLE bulk_generation_jobs (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    campaign_id UUID NOT NULL,
    channel TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    total_contacts INTEGER NOT NULL DEFAULT 0,
    completed_contacts INTEGER NOT NULL DEFAULT 0,
    failed_contacts INTEGER NOT NULL DEFAULT 0,
    skipped_contacts INTEGER NOT NULL DEFAULT 0,
    progress_percentage INTEGER DEFAULT 0,
    estimated_cost_usd NUMERIC(10,6) DEFAULT 0,
    current_contact_id UUID NULL,
    current_contact_name TEXT NULL,
    result_summary JSONB NULL,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bulk_jobs_user ON bulk_generation_jobs(user_id);
CREATE INDEX idx_bulk_jobs_campaign ON bulk_generation_jobs(campaign_id);
CREATE INDEX idx_bulk_jobs_status ON bulk_generation_jobs(status);
CREATE INDEX idx_bulk_jobs_created ON bulk_generation_jobs(created_at);

CREATE TABLE bulk_generation_job_logs (
    id UUID PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES bulk_generation_jobs(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('generated', 'skipped', 'failed')),
    message TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bulk_job_logs_job ON bulk_generation_job_logs(job_id);

-- RLS Policies
ALTER TABLE bulk_generation_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own bulk jobs" 
    ON bulk_generation_jobs FOR ALL 
    USING (auth.uid() = user_id);

ALTER TABLE bulk_generation_job_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own bulk job logs" 
    ON bulk_generation_job_logs FOR ALL 
    USING (
        job_id IN (
            SELECT id FROM bulk_generation_jobs WHERE user_id = auth.uid()
        )
    );

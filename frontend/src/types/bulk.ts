export interface BulkGenerateRequest {
  contact_ids: string[];
  channel: 'linkedin' | 'email' | 'whatsapp';
}

export interface BulkJobResponse {
  job_id: string;
  status: string;
}

export interface BulkJobProgressResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  total_contacts: number;
  completed_contacts: number;
  failed_contacts: number;
  skipped_contacts: number;
  progress_percentage: number;
  current_contact_name?: string;
  estimated_cost_usd: number;
  result_summary?: {
    generated?: number;
    skipped?: number;
    failed?: number;
    duration_seconds?: number;
    error?: string;
  };
  started_at?: string;
  completed_at?: string;
  created_at?: string;
  channel?: string;
  average_generation_time_ms?: number;
}

export interface BulkJobPreviewResponse {
  total_selected: number;
  already_generated: number;
  new_generations_required: number;
  estimated_cost_usd: number;
}

export interface JobContactDetail {
  contact_id: string;
  name: string;
  status: string;
  message?: string;
  created_at: string;
}

export interface BulkJobDetailsResponse {
  summary: BulkJobProgressResponse;
  generated: JobContactDetail[];
  skipped: JobContactDetail[];
  failed: JobContactDetail[];
}

export interface CampaignAIUsageSummary {
  total_contacts: number;
  generated_messages: number;
  pending_generation: number;
  failed_generations: number;
  skipped_generations: number;
  estimated_cost_usd: number;
  channel_breakdown?: Record<string, { generated: number; failed: number; cost: number }>;
}

export interface DashboardOverview {
  total_campaigns: number;
  total_contacts: number;
  total_messages: number;
  ai_messages: number;
  manual_messages: number;
  estimated_cost_usd: number;
  success_rate: number;
  active_jobs: number;
  business_type_breakdown?: Record<string, number>;
  quality_distribution?: Record<string, number>;
  most_used_templates?: Array<{ id: string; name: string; usage_count: string }>;
}

export interface ActivityItem {
  type: string;
  message: string;
  created_at: string;
}

export interface TopCampaign {
  campaign_name: string;
  contacts: number;
  messages: number;
  cost: number;
}

export interface RecentCampaign {
  id: string;
  name: string;
  last_activity: string;
}

export interface ChannelAnalytics {
  generated: number;
  cost: number;
  success_rate: number;
}

export interface ProviderAnalytics {
  messages: number;
  avg_generation_ms: number;
}

export interface CostAnalytics {
  today: number;
  week: number;
  month: number;
  all_time: number;
}

export interface QualityAnalytics {
  excellent: number;
  good: number;
  needs_review: number;
}

export interface BulkAnalytics {
  total_jobs: number;
  completed: number;
  failed: number;
  cancelled: number;
  average_duration_seconds: number;
}

export interface DailyTrend {
  date: string;
  count: number;
}

export interface CampaignAnalytics {
  contacts_imported: number;
  generated: number;
  pending: number;
  failed: number;
  skipped: number;
  contacted: number;
  interested: number;
  enrolled: number;
}

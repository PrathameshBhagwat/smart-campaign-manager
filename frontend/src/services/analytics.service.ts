import { createClient } from '@/lib/supabase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface DailyGeneration {
  date: string;
  count: number;
}

export interface AIAnalytics {
  total_generations: number;
  cache_hits: number;
  cache_hit_rate: number;
  success_rate: number;
  estimated_cost: number;
  avg_cost_per_generation: number;
  avg_generation_time_ms: number;
  most_used_channel: string;
  provider_breakdown: Record<string, number>;
  channel_breakdown: Record<string, number>;
  daily_generations: DailyGeneration[];
}

export const AnalyticsService = {
  getAIAnalytics: async (): Promise<AIAnalytics> => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/api/v1/analytics/ai`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch AI analytics: ${response.statusText}`);
    }

    return response.json();
  }
};

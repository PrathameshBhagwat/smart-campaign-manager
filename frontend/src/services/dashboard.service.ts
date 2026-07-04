import api from './api';
import { 
  DashboardOverview, ActivityItem, TopCampaign, RecentCampaign,
  ChannelAnalytics, ProviderAnalytics, CostAnalytics, QualityAnalytics,
  BulkAnalytics, DailyTrend, CampaignAnalytics
} from '@/types/dashboard';

export const dashboardService = {
  async getOverview(): Promise<DashboardOverview> {
    const { data } = await api.get('/dashboard/overview');
    return data;
  },

  async getActivity(limit = 20, offset = 0): Promise<ActivityItem[]> {
    const { data } = await api.get(`/dashboard/activity?limit=${limit}&offset=${offset}`);
    return data;
  },

  async getTopCampaigns(): Promise<TopCampaign[]> {
    const { data } = await api.get('/dashboard/top-campaigns');
    return data;
  },

  async getRecentCampaigns(): Promise<RecentCampaign[]> {
    const { data } = await api.get('/dashboard/recent-campaigns');
    return data;
  },

  async getChannelAnalytics(): Promise<Record<string, ChannelAnalytics>> {
    const { data } = await api.get('/analytics/channels');
    return data;
  },

  async getProviderAnalytics(): Promise<Record<string, ProviderAnalytics>> {
    const { data } = await api.get('/analytics/providers');
    return data;
  },

  async getCostAnalytics(): Promise<CostAnalytics> {
    const { data } = await api.get('/analytics/costs');
    return data;
  },

  async getQualityAnalytics(): Promise<QualityAnalytics> {
    const { data } = await api.get('/analytics/quality');
    return data;
  },

  async getBulkAnalytics(): Promise<BulkAnalytics> {
    const { data } = await api.get('/analytics/bulk-jobs');
    return data;
  },

  async getTrends(days = 30): Promise<DailyTrend[]> {
    const { data } = await api.get(`/analytics/trends?days=${days}`);
    return data;
  },

  async getCampaignAnalytics(campaignId: string): Promise<CampaignAnalytics> {
    const { data } = await api.get(`/campaigns/${campaignId}/analytics`);
    return data;
  }
};

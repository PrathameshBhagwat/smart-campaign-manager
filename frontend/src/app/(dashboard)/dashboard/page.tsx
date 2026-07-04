'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { dashboardService } from '@/services/dashboard.service';
import DashboardCards from '@/components/dashboard/DashboardCards';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import CampaignLeaderboard from '@/components/dashboard/CampaignLeaderboard';
import dynamic from 'next/dynamic';
import { Download, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const TrendChart = dynamic(() => import('@/components/dashboard/DashboardCharts').then(mod => mod.TrendChart), { ssr: false, loading: () => <div className="h-96 bg-muted/20 animate-pulse rounded-xl" /> });
const CostChart = dynamic(() => import('@/components/dashboard/DashboardCharts').then(mod => mod.CostChart), { ssr: false, loading: () => <div className="h-96 bg-muted/20 animate-pulse rounded-xl" /> });
const ProviderChart = dynamic(() => import('@/components/dashboard/DashboardCharts').then(mod => mod.ProviderChart), { ssr: false, loading: () => <div className="h-96 bg-muted/20 animate-pulse rounded-xl" /> });
const ChannelChart = dynamic(() => import('@/components/dashboard/DashboardCharts').then(mod => mod.ChannelChart), { ssr: false, loading: () => <div className="h-96 bg-muted/20 animate-pulse rounded-xl" /> });
const BulkAnalyticsChart = dynamic(() => import('@/components/dashboard/DashboardCharts').then(mod => mod.BulkAnalyticsChart), { ssr: false, loading: () => <div className="h-96 bg-muted/20 animate-pulse rounded-xl" /> });
const ContactFunnelChart = dynamic(() => import('@/components/dashboard/DashboardCharts').then(mod => mod.ContactFunnelChart), { ssr: false, loading: () => <div className="h-96 bg-muted/20 animate-pulse rounded-xl" /> });
const QualityChart = dynamic(() => import('@/components/dashboard/DashboardCharts').then(mod => mod.QualityChart), { ssr: false, loading: () => <div className="h-96 bg-muted/20 animate-pulse rounded-xl" /> });
const MostUsedTemplatesList = dynamic(() => import('@/components/dashboard/DashboardCharts').then(mod => mod.MostUsedTemplatesList), { ssr: false });
const BusinessTypeChart = dynamic(() => import('@/components/dashboard/BusinessTypeChart').then(mod => mod.BusinessTypeChart), { ssr: false });

export default function DashboardPage() {
  const { data: overview, isLoading: loadingOverview, error: overviewError } = useSWR('dashboard-overview', () => dashboardService.getOverview(), { refreshInterval: 60000 });
  const { data: activities, isLoading: loadingActivities } = useSWR('dashboard-activities', () => dashboardService.getActivity(), { refreshInterval: 60000 });
  const { data: topCampaigns, isLoading: loadingCampaigns } = useSWR('dashboard-top-campaigns', () => dashboardService.getTopCampaigns(), { refreshInterval: 60000 });
  const { data: recentCampaigns } = useSWR('dashboard-recent-campaigns', () => dashboardService.getRecentCampaigns(), { refreshInterval: 60000 });
  
  const { data: trends } = useSWR('dashboard-trends', () => dashboardService.getTrends(30), { refreshInterval: 60000 });
  const { data: costs } = useSWR('dashboard-costs', () => dashboardService.getCostAnalytics(), { refreshInterval: 60000 });
  const { data: providers } = useSWR('dashboard-providers', () => dashboardService.getProviderAnalytics(), { refreshInterval: 60000 });
  const { data: channels } = useSWR('dashboard-channels', () => dashboardService.getChannelAnalytics(), { refreshInterval: 60000 });
  const { data: bulkJobs } = useSWR('dashboard-bulk', () => dashboardService.getBulkAnalytics(), { refreshInterval: 60000 });

  // Fetch funnel for the top campaign (if any exist)
  const topCampaignId = recentCampaigns?.[0]?.id || null;
  const { data: funnelAnalytics } = useSWR(
    topCampaignId ? `dashboard-funnel-${topCampaignId}` : null,
    () => topCampaignId ? dashboardService.getCampaignAnalytics(topCampaignId) : null,
    { refreshInterval: 60000 }
  );

  if (loadingOverview) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Analytics Dashboard</h1>
        <DashboardSkeleton />
      </div>
    );
  }

  if (overviewError) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load analytics</h2>
          <p className="text-gray-500">Please try again later or contact support if the issue persists.</p>
        </div>
      </div>
    );
  }

  if (overview && overview.total_campaigns === 0) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="text-center bg-white p-12 rounded-xl shadow-sm border border-gray-100 max-w-md w-full">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to Analytics!</h2>
          <p className="text-gray-500 mb-6">Create your first campaign to start seeing metrics and insights.</p>
          <a href="/campaigns" className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
            Go to Campaigns
          </a>
        </div>
      </div>
    );
  }

  const exportAnalytics = () => {
    if (!channels || !providers) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Type,Name,Messages,Cost,SuccessRate,AvgMs\n";
    
    Object.entries(channels).forEach(([name, data]) => {
      csvContent += `Channel,${name},${data.generated},${data.cost},${data.success_rate},0\n`;
    });
    
    Object.entries(providers).forEach(([name, data]) => {
      csvContent += `Provider,${name},${data.messages},0,0,${data.avg_generation_ms}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analytics_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b"
      >
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            AI Summary: You have generated <strong>{overview?.ai_messages || 0}</strong> messages with a <strong>{overview?.success_rate || 0}%</strong> success rate. Estimated cost: <strong>${overview?.estimated_cost_usd?.toFixed(2) || '0.00'}</strong>.
          </p>
        </div>
        <button 
          onClick={exportAnalytics}
          className="inline-flex items-center gap-2 px-4 py-2 bg-card border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors shrink-0"
        >
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </motion.div>

      <DashboardCards overview={overview || null} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TrendChart data={trends || []} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CostChart data={costs || { today: 0, week: 0, month: 0, all_time: 0 }} />
            <ChannelChart data={channels || {}} />
          </div>

          <BusinessTypeChart data={overview?.business_type_breakdown || {}} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <QualityChart data={overview?.quality_distribution || {}} />
            <MostUsedTemplatesList templates={overview?.most_used_templates} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ContactFunnelChart data={funnelAnalytics || null} />
            <BulkAnalyticsChart data={bulkJobs || { total_jobs: 0, completed: 0, failed: 0, cancelled: 0, average_duration_seconds: 0 }} />
          </div>
          
          <CampaignLeaderboard campaigns={topCampaigns || []} />
        </div>
        
        <div className="space-y-6">
          <ProviderChart data={providers || {}} />
          <ActivityFeed activities={activities || []} />
        </div>
      </div>
    </div>
  );
}

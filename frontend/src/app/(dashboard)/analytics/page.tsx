'use client';

import useSWR from 'swr';
import { dashboardService } from '@/services/dashboard.service';
import { Download } from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const TrendChart = dynamic(() => import('@/components/dashboard/DashboardCharts').then(mod => mod.TrendChart), { ssr: false, loading: () => <div className="h-96 bg-muted/20 animate-pulse rounded-xl" /> });
const CostChart = dynamic(() => import('@/components/dashboard/DashboardCharts').then(mod => mod.CostChart), { ssr: false, loading: () => <div className="h-96 bg-muted/20 animate-pulse rounded-xl" /> });
const ProviderChart = dynamic(() => import('@/components/dashboard/DashboardCharts').then(mod => mod.ProviderChart), { ssr: false, loading: () => <div className="h-96 bg-muted/20 animate-pulse rounded-xl" /> });
const ChannelChart = dynamic(() => import('@/components/dashboard/DashboardCharts').then(mod => mod.ChannelChart), { ssr: false, loading: () => <div className="h-96 bg-muted/20 animate-pulse rounded-xl" /> });
const BulkAnalyticsChart = dynamic(() => import('@/components/dashboard/DashboardCharts').then(mod => mod.BulkAnalyticsChart), { ssr: false, loading: () => <div className="h-96 bg-muted/20 animate-pulse rounded-xl" /> });
const QualityChart = dynamic(() => import('@/components/dashboard/DashboardCharts').then(mod => mod.QualityChart), { ssr: false, loading: () => <div className="h-96 bg-muted/20 animate-pulse rounded-xl" /> });
const BusinessTypeChart = dynamic(() => import('@/components/dashboard/BusinessTypeChart').then(mod => mod.BusinessTypeChart), { ssr: false });

export default function AnalyticsPage() {
  const { data: overview } = useSWR('dashboard-overview', () => dashboardService.getOverview());
  const { data: trends } = useSWR('dashboard-trends', () => dashboardService.getTrends(30));
  const { data: costs } = useSWR('dashboard-costs', () => dashboardService.getCostAnalytics());
  const { data: providers } = useSWR('dashboard-providers', () => dashboardService.getProviderAnalytics());
  const { data: channels } = useSWR('dashboard-channels', () => dashboardService.getChannelAnalytics());
  const { data: bulkJobs } = useSWR('dashboard-bulk', () => dashboardService.getBulkAnalytics());
  const { data: qualities } = useSWR('dashboard-quality', () => dashboardService.getQualityAnalytics());

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b"
      >
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Advanced Analytics</h1>
          <p className="text-muted-foreground">
            Deep dive into your AI performance, quality, and business metrics.
          </p>
        </div>
        <button 
          className="inline-flex items-center gap-2 px-4 py-2 bg-card border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors shrink-0"
        >
          <Download className="h-4 w-4" />
          Export All Data
        </button>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, staggerChildren: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <div className="space-y-6">
          <TrendChart data={trends || []} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CostChart data={costs || { today: 0, week: 0, month: 0, all_time: 0 }} />
            <QualityChart data={qualities || { excellent: 0, good: 0, needs_review: 0 }} />
          </div>
          <BusinessTypeChart data={overview?.business_type_breakdown || {}} />
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProviderChart data={providers || {}} />
            <ChannelChart data={channels || {}} />
          </div>
          <BulkAnalyticsChart data={bulkJobs || { total_jobs: 0, completed: 0, failed: 0, cancelled: 0, average_duration_seconds: 0 }} />
        </div>
      </motion.div>
    </div>
  );
}

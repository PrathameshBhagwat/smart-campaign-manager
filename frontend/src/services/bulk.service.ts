import api from './api';
import { BulkGenerateRequest, BulkJobResponse, BulkJobProgressResponse, BulkJobPreviewResponse } from '@/types/bulk';
import { createClient } from '@/lib/supabase/client';

export const BulkService = {
  previewJob: async (campaignId: string, data: BulkGenerateRequest): Promise<BulkJobPreviewResponse> => {
    const response = await api.post(`/campaigns/${campaignId}/bulk-preview`, data);
    return response.data;
  },

  createJob: async (campaignId: string, data: BulkGenerateRequest): Promise<BulkJobResponse> => {
    const response = await api.post(`/campaigns/${campaignId}/bulk-generate`, data);
    return response.data;
  },

  getJobProgress: async (jobId: string): Promise<BulkJobProgressResponse> => {
    const response = await api.get(`/bulk-jobs/${jobId}`);
    return response.data;
  },

  cancelJob: async (jobId: string): Promise<{ status: string }> => {
    const response = await api.post(`/bulk-jobs/${jobId}/cancel`);
    return response.data;
  },

  getActiveJob: async (campaignId: string): Promise<BulkJobResponse> => {
    const response = await api.get(`/campaigns/${campaignId}/active-job`);
    return response.data;
  },

  getJobHistory: async (campaignId: string) => {
    const response = await api.get(`/campaigns/${campaignId}/bulk-jobs`);
    return response.data.jobs;
  },

  getJobDetails: async (jobId: string) => {
    const response = await api.get(`/bulk-jobs/${jobId}/details`);
    return response.data;
  },

  retryFailedContacts: async (jobId: string) => {
    const response = await api.post(`/bulk-jobs/${jobId}/retry`);
    return response.data;
  },

  getAISummary: async (campaignId: string) => {
    const response = await api.get(`/campaigns/${campaignId}/ai-summary`);
    return response.data;
  },

  getExportUrl: (campaignId: string, channel: string, formatType: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return `${apiUrl}/api/v1/campaigns/${campaignId}/messages/export?channel=${channel}&format_type=${formatType}`;
  },

  exportMessages: async (campaignId: string, channel: string, formatType: 'csv' | 'xlsx', campaignName: string) => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const url = `${apiUrl}/api/v1/campaigns/${campaignId}/messages/export?channel=${channel}&format_type=${formatType}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${campaignName.replace(/\s+/g, '_')}_export.${formatType}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  }
};

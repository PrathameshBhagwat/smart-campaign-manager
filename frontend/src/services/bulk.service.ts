import api from './api';
import { BulkGenerateRequest, BulkJobResponse, BulkJobProgressResponse, BulkJobPreviewResponse } from '@/types/bulk';

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
    return `${process.env.NEXT_PUBLIC_API_URL}/campaigns/${campaignId}/messages/export?channel=${channel}&format_type=${formatType}`;
  }
};

import { Campaign, CampaignCreate, CampaignUpdate } from '@/types/campaign';
import { createClient } from '@/lib/supabase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function getAuthHeaders() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('No active session found');
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`
  };
}

export const CampaignService = {
  async getCampaigns(): Promise<Campaign[]> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/v1/campaigns`, { headers });
    if (!response.ok) throw new Error('Failed to fetch campaigns');
    return response.json();
  },

  async getCampaign(id: string): Promise<Campaign> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/v1/campaigns/${id}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch campaign details');
    return response.json();
  },

  async createCampaign(data: CampaignCreate): Promise<Campaign> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/v1/campaigns`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create campaign');
    return response.json();
  },

  async updateCampaign(id: string, data: CampaignUpdate): Promise<Campaign> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/v1/campaigns/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update campaign');
    return response.json();
  },

  async deleteCampaign(id: string): Promise<void> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/v1/campaigns/${id}`, {
      method: 'DELETE',
      headers
    });
    if (!response.ok) throw new Error('Failed to delete campaign');
  }
};

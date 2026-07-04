import { Contact, PaginatedContacts, ImportSummary, PaginatedImports, ContactStats } from '@/types/contact';
import { createClient } from '@/lib/supabase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function getAuthHeaders() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('No active session found');
  }
  
  return {
    'Authorization': `Bearer ${session.access_token}`
  };
}

async function handleApiResponse(response: Response) {
  if (!response.ok) {
    let errorMsg = 'An unexpected error occurred';
    let requestId = '';
    try {
      const data = await response.json();
      if (data.error && data.error.message) {
        errorMsg = data.error.message;
      }
      if (data.request_id) {
        requestId = data.request_id;
      }
    } catch (e) {
      // Not JSON
      errorMsg = response.statusText;
    }
    
    if (requestId) {
      console.error(`[API Error ${requestId}]: ${errorMsg}`);
      throw new Error(`${errorMsg} (Ref: ${requestId})`);
    } else {
      console.error(`[API Error]: ${errorMsg}`);
      throw new Error(errorMsg);
    }
  }
  return response.json();
}

export const ContactService = {
  async getContacts(
    campaignId: string, 
    page: number = 1, 
    limit: number = 20,
    search: string = '',
    status: string = 'all'
  ): Promise<PaginatedContacts> {
    const headers = await getAuthHeaders();
    
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (search) params.append('search', search);
    if (status && status !== 'all') params.append('status', status);

    const response = await fetch(`${API_URL}/api/v1/campaigns/${campaignId}/contacts?${params.toString()}`, { headers });
    return handleApiResponse(response);
  },

  async uploadContacts(campaignId: string, file: File): Promise<ImportSummary> {
    const session = await createClient().auth.getSession();
    const token = session.data.session?.access_token;
    
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/api/v1/campaigns/${campaignId}/contacts/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    return handleApiResponse(response);
  },

  async updateContactStatus(contactId: string, status: string): Promise<Contact> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/v1/contacts/${contactId}/status`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    
    return handleApiResponse(response);
  },

  async getImports(campaignId: string, page: number = 1, limit: number = 10): Promise<PaginatedImports> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/v1/campaigns/${campaignId}/imports?page=${page}&limit=${limit}`, { headers });
    return handleApiResponse(response);
  },

  async getContactStats(campaignId: string): Promise<ContactStats> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/v1/campaigns/${campaignId}/contacts/stats`, { headers });
    return handleApiResponse(response);
  }
};

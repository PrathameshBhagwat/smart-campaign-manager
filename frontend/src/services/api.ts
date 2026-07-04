import { createClient } from '@/lib/supabase/client';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_URL = `${BASE_URL}/api/v1`;
async function getAuthHeaders() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }

  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    let errorData = null;
    try {
      errorData = await response.json();
    } catch (e) {
      // Not JSON
    }
    const error = new Error(`API Error: ${response.statusText}`);
    // Mimic axios error structure
    (error as any).response = { data: errorData, status: response.status };
    throw error;
  }
  
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  return { data };
}

const api = {
  get: async (url: string) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}${url}`, { headers });
    return handleResponse(response);
  },
  post: async (url: string, body?: any) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}${url}`, { 
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    return handleResponse(response);
  }
};

export default api;

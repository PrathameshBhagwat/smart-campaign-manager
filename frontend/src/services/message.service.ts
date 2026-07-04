import { Message, MessageListResponse, MessageCreate, MessageUpdate, CopyResponse } from '@/types/message';
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
    } catch {
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
  
  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
}

export const MessageService = {
  async getMessages(contactId: string): Promise<MessageListResponse> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/v1/contacts/${contactId}/messages`, { headers });
    return handleApiResponse(response);
  },

  async createMessage(contactId: string, data: MessageCreate): Promise<Message> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/v1/contacts/${contactId}/messages`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleApiResponse(response);
  },

  async updateMessage(messageId: string, data: MessageUpdate): Promise<Message> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/v1/messages/${messageId}`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleApiResponse(response);
  },

  async deleteMessage(messageId: string): Promise<void> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/v1/messages/${messageId}`, {
      method: 'DELETE',
      headers
    });
    await handleApiResponse(response);
  },

  async copyMessage(messageId: string): Promise<CopyResponse> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/v1/messages/${messageId}/copy`, {
      method: 'POST',
      headers
    });
    return handleApiResponse(response);
  },

  async generateMessage(contactId: string, channel: string): Promise<import('@/types/message').MessageGenerateResponse> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/v1/contacts/${contactId}/messages/generate`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel })
    });
    return handleApiResponse(response);
  }
};

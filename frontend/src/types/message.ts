export interface Message {
  id: string;
  contact_id: string;
  content: string;
  channel: 'linkedin' | 'whatsapp' | 'email';
  generation_source: 'manual' | 'ai';
  status: 'draft' | 'ready' | 'archived' | 'failed';
  character_count: number;
  version: number;
  copied_count: number;
  last_copied_at: string | null;
  ai_model: string | null;
  ai_provider: string | null;
  generation_error: string | null;
  prompt_version: string;
  generation_duration_ms: number | null;
  input_tokens?: number;
  output_tokens?: number;
  estimated_cost_usd?: number;
  prompt_hash?: string;
  ai_quality_score?: number;
  quality_score?: number;
  quality_label?: string;
  quality_reasons?: string[];
  is_outdated: boolean;
  created_at: string;
  updated_at: string;
}

export interface MessageGenerateResponse {
  cached: boolean;
  message: Message;
}

export interface MessageListResponse {
  messages: Message[];
  total_count: number;
}

export interface MessageCreate {
  content: string;
  channel: 'linkedin' | 'whatsapp' | 'email';
}

export interface MessageUpdate {
  content?: string;
  channel?: 'linkedin' | 'whatsapp' | 'email';
}

export interface CopyResponse {
  message_id: string;
  copied_count: number;
  last_copied_at: string;
}

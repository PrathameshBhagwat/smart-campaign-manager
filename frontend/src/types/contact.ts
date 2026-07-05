export interface Contact {
  id: string;
  campaign_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  job_title: string | null;
  city: string | null;
  status: 'New' | 'Contacted' | 'Interested' | 'Enrolled';
  linkedin_url?: string;
  preferred_contact_method?: 'linkedin' | 'email';
  latest_ai_message_status?: 'ready' | 'failed' | 'processing' | null;
  created_at: string;
}

export interface PaginatedContacts {
  contacts: Contact[];
  total_count: number;
  current_page: number;
  total_pages: number;
}

export interface ImportSummary {
  id: string;
  campaign_id: string;
  file_name: string;
  imported_count: number;
  skipped_count: number;
  error_count: number;
  total_errors: number;
  status: string;
  error_details: any[];
  created_at: string;
}

export interface PaginatedImports {
  imports: ImportSummary[];
  total_count: number;
  current_page: number;
  total_pages: number;
}

export interface ContactStats {
  total_contacts: number;
  new_contacts: number;
  contacted_contacts: number;
  interested_contacts: number;
  enrolled_contacts: number;
}

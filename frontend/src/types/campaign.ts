export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  course_name: string;
  city: string;
  created_at: string;
  
  business_type?: string;
  offering_type?: string;
  offering_name?: string;
  target_goal?: string;
  business_config?: Record<string, any>;
}

export type CampaignCreate = Omit<Campaign, 'id' | 'user_id' | 'created_at'>;
export type CampaignUpdate = Partial<CampaignCreate>;

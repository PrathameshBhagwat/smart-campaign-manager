from pydantic import BaseModel
from typing import List, Optional, Dict

class DashboardOverview(BaseModel):
    total_campaigns: int
    total_contacts: int
    total_messages: int
    ai_messages: int
    manual_messages: int
    estimated_cost_usd: float
    success_rate: float
    active_jobs: int
    business_type_breakdown: Optional[Dict[str, int]] = None
    quality_distribution: Optional[Dict[str, float]] = None
    most_used_templates: Optional[List[Dict[str, str]]] = None

class ActivityItem(BaseModel):
    type: str
    message: str
    created_at: str

class TopCampaign(BaseModel):
    campaign_name: str
    contacts: int
    messages: int
    cost: float

class RecentCampaign(BaseModel):
    id: str
    name: str
    last_activity: str

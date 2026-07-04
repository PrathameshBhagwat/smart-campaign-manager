from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID

class CampaignBase(BaseModel):
    name: str = Field(..., min_length=3, description="Name of the campaign")
    course_name: str = Field(..., description="Course associated with the campaign (legacy)")
    city: str = Field(..., description="Target city")
    
    business_type: str = Field(default="education", description="Type of business (education, finance, etc)")
    offering_type: Optional[str] = Field(default=None, description="Type of offering (course, service, product)")
    offering_name: Optional[str] = Field(default=None, description="Specific name of the offering")
    target_goal: Optional[str] = Field(default=None, description="Goal of the campaign (enrollment, sales, etc)")
    business_config: Dict[str, Any] = Field(default_factory=dict, description="Additional configuration JSON")

class CampaignCreate(CampaignBase):
    pass

class CampaignUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3)
    course_name: Optional[str] = None
    city: Optional[str] = None
    
    business_type: Optional[str] = None
    offering_type: Optional[str] = None
    offering_name: Optional[str] = None
    target_goal: Optional[str] = None
    business_config: Optional[Dict[str, Any]] = None

class CampaignResponse(CampaignBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


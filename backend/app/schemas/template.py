from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class TemplateCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = None
    channel: str = Field(..., description="linkedin, email, or whatsapp")
    business_type: str = Field(..., description="education, finance, recruitment, real_estate, generic, custom")
    template_scope: str = Field(default="global", description="global or campaign")
    campaign_id: Optional[UUID] = None
    content: str = Field(..., min_length=20, max_length=2000)
    is_default: bool = False

class TemplateUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = None
    channel: Optional[str] = None
    business_type: Optional[str] = None
    template_scope: Optional[str] = None
    campaign_id: Optional[UUID] = None
    content: Optional[str] = Field(None, min_length=20, max_length=2000)
    is_default: Optional[bool] = None

class TemplateResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    description: Optional[str] = None
    channel: str
    business_type: str
    template_scope: str
    campaign_id: Optional[UUID] = None
    content: str
    version: int
    usage_count: int
    is_default: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TemplateListResponse(BaseModel):
    templates: List[TemplateResponse]

class TemplatePreviewRequest(BaseModel):
    content: str = Field(..., min_length=20, max_length=2000)
    variables: dict = Field(default_factory=dict)

class TemplatePreviewResponse(BaseModel):
    rendered_content: str

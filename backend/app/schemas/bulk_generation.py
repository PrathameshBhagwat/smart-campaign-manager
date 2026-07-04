from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class BulkGenerateRequest(BaseModel):
    contact_ids: List[UUID] = Field(..., min_items=1, max_items=250)
    channel: str = Field(...)

    @validator('channel')
    def validate_channel(cls, v):
        if v not in ['linkedin', 'email', 'whatsapp']:
            raise ValueError('Invalid channel. Must be linkedin, email, or whatsapp')
        return v

class BulkJobResponse(BaseModel):
    job_id: UUID
    status: str

class BulkJobProgressResponse(BaseModel):
    id: UUID
    status: str
    total_contacts: int
    completed_contacts: int
    failed_contacts: int
    skipped_contacts: int
    progress_percentage: int
    current_contact_name: Optional[str] = None
    estimated_cost_usd: float
    result_summary: Optional[dict] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    average_generation_time_ms: Optional[int] = None

class BulkJobPreviewResponse(BaseModel):
    total_selected: int
    already_generated: int
    new_generations_required: int
    estimated_cost_usd: float

class BulkJobSummaryResponse(BaseModel):
    jobs: List[BulkJobProgressResponse]

class JobContactDetail(BaseModel):
    contact_id: UUID
    name: str
    status: str
    message: Optional[str] = None
    created_at: datetime

class BulkJobDetailsResponse(BaseModel):
    summary: BulkJobProgressResponse
    generated: List[JobContactDetail]
    skipped: List[JobContactDetail]
    failed: List[JobContactDetail]

class CampaignAIUsageSummary(BaseModel):
    total_contacts: int
    generated_messages: int
    pending_generation: int
    failed_generations: int
    skipped_generations: int
    estimated_cost_usd: float
    channel_breakdown: Optional[dict] = None

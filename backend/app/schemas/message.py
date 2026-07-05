from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class MessageCreate(BaseModel):
    content: str = Field(
        ...,
        min_length=10,
        max_length=2000,
        description="The message content to send to the contact",
        json_schema_extra={"examples": ["Hi John, I noticed your work at Acme Corp and wanted to share our Data Science program."]}
    )
    channel: str = Field(
        default="linkedin",
        description="Communication channel: linkedin, whatsapp, or email",
        json_schema_extra={"examples": ["linkedin"]}
    )

class MessageUpdate(BaseModel):
    content: Optional[str] = Field(
        None,
        min_length=10,
        max_length=2000,
        description="Updated message content"
    )
    channel: Optional[str] = Field(
        None,
        description="Updated channel: linkedin, whatsapp, or email"
    )
    status: Optional[str] = Field(
        None,
        description="Updated status: draft, ready, failed, archived"
    )

class MessageResponse(BaseModel):
    id: UUID
    contact_id: UUID
    content: str
    channel: str
    generation_source: str
    status: str
    character_count: int
    version: int
    copied_count: int
    last_copied_at: Optional[datetime] = None
    ai_model: Optional[str] = None
    ai_provider: Optional[str] = None
    generation_error: Optional[str] = None
    regeneration_count: int = 0
    prompt_version: str = "v1"
    generation_duration_ms: Optional[int] = None
    input_tokens: Optional[int] = None
    output_tokens: Optional[int] = None
    estimated_cost_usd: Optional[float] = None
    prompt_hash: Optional[str] = None
    ai_quality_score: Optional[int] = None
    quality_label: Optional[str] = None
    quality_reasons: Optional[list] = None
    is_outdated: bool = False
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class MessageListResponse(BaseModel):
    messages: List[MessageResponse]
    total_count: int

class CopyResponse(BaseModel):
    message_id: UUID
    copied_count: int
    last_copied_at: datetime

class MessageGenerateRequest(BaseModel):
    channel: str = Field(..., description="Channel to generate for (linkedin, whatsapp, email)")

class MessageGenerateResponse(BaseModel):
    cached: bool
    message: MessageResponse

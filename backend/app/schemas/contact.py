from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

class ContactBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    city: Optional[str] = None
    linkedin_url: Optional[str] = None
    preferred_contact_method: Optional[str] = None

class ContactCreate(ContactBase):
    campaign_id: UUID

class ContactResponse(ContactBase):
    id: UUID
    campaign_id: UUID
    status: str
    created_at: datetime
    linkedin_url: Optional[str] = None
    preferred_contact_method: Optional[str] = None
    latest_ai_message_status: Optional[str] = None

    class Config:
        from_attributes = True

class ContactStatusUpdate(BaseModel):
    status: str = Field(..., description="Status of the contact: New, Contacted, Interested, Enrolled")

class PaginatedContacts(BaseModel):
    contacts: list[ContactResponse]
    total_count: int
    current_page: int
    total_pages: int

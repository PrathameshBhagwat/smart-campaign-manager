from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

class ImportSummary(BaseModel):
    id: UUID
    campaign_id: UUID
    file_name: str
    imported_count: int
    skipped_count: int
    error_count: int
    total_errors: int
    status: str
    error_details: list = []
    created_at: datetime

    class Config:
        from_attributes = True

class PaginatedImports(BaseModel):
    imports: list[ImportSummary]
    total_count: int
    current_page: int
    total_pages: int

class ContactStats(BaseModel):
    total_contacts: int
    new_contacts: int
    contacted_contacts: int
    interested_contacts: int
    enrolled_contacts: int

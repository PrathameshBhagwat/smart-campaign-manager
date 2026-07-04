from fastapi import APIRouter, Depends, status, UploadFile, File, Query
from typing import Optional, Dict, Any
from app.schemas.contact import ContactResponse, ContactStatusUpdate, PaginatedContacts
from app.schemas.imports import ImportSummary, PaginatedImports, ContactStats
from app.services.contact_service import ContactService
from app.services.csv_service import CSVService
from app.middleware.auth import get_current_user

router = APIRouter()

common_responses = {
    401: {"description": "Unauthorized - Missing or invalid token"},
    403: {"description": "Forbidden - Campaign not found or access denied"}
}

@router.get(
    "/campaigns/{campaign_id}/contacts",
    response_model=PaginatedContacts,
    summary="Get paginated contacts",
    description="Fetch a paginated list of contacts for a specific campaign with optional filtering and debounced search.",
    responses={
        **common_responses,
        200: {
            "description": "Successfully retrieved paginated contacts",
            "content": {
                "application/json": {
                    "example": {
                        "contacts": [
                            {
                                "name": "John Doe",
                                "email": "john@example.com",
                                "phone": "1234567890",
                                "company": "Acme Corp",
                                "job_title": "CEO",
                                "city": "New York",
                                "id": "123e4567-e89b-12d3-a456-426614174000",
                                "campaign_id": "123e4567-e89b-12d3-a456-426614174001",
                                "status": "New",
                                "created_at": "2023-10-01T12:00:00Z"
                            }
                        ],
                        "total_count": 1,
                        "current_page": 1,
                        "total_pages": 1
                    }
                }
            }
        }
    }
)
def get_contacts(
    campaign_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    city: Optional[str] = None,
    company: Optional[str] = None,
    user_id: str = Depends(get_current_user)
):
    return ContactService.get_contacts_paginated(
        campaign_id=campaign_id,
        user_id=user_id,
        page=page,
        limit=limit,
        search=search,
        status_filter=status_filter,
        city_filter=city,
        company_filter=company
    )

@router.post(
    "/campaigns/{campaign_id}/contacts/upload",
    response_model=ImportSummary,
    status_code=status.HTTP_201_CREATED,
    summary="Upload contacts file",
    description="Upload a .csv, .xls, or .xlsx file to bulk import contacts. Automatically deduplicates and validates rows.",
    responses={
        **common_responses,
        201: {
            "description": "File successfully processed and contacts imported",
            "content": {
                "application/json": {
                    "example": {
                        "id": "123e4567-e89b-12d3-a456-426614174000",
                        "campaign_id": "123e4567-e89b-12d3-a456-426614174001",
                        "file_name": "contacts.csv",
                        "imported_count": 150,
                        "skipped_count": 5,
                        "error_count": 2,
                        "total_errors": 2,
                        "status": "completed",
                        "error_details": [{"row": 2, "error": "Missing email and phone", "data": {"name": "Bob"}}],
                        "created_at": "2023-10-01T12:00:00Z"
                    }
                }
            }
        },
        400: {"description": "Bad Request - Invalid file format or missing columns"}
    }
)
async def upload_contacts(
    campaign_id: str,
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user)
):
    return await CSVService.process_file_upload(file, campaign_id, user_id)

@router.patch(
    "/contacts/{contact_id}/status",
    response_model=ContactResponse,
    summary="Update contact status",
    description="Update the outreach status of a single contact (New, Contacted, Interested, Enrolled).",
    responses={
        **common_responses,
        200: {
            "description": "Status successfully updated",
            "content": {
                "application/json": {
                    "example": {
                        "name": "John Doe",
                        "email": "john@example.com",
                        "id": "123e4567-e89b-12d3-a456-426614174000",
                        "campaign_id": "123e4567-e89b-12d3-a456-426614174001",
                        "status": "Contacted",
                        "created_at": "2023-10-01T12:00:00Z"
                    }
                }
            }
        },
        404: {"description": "Not Found - Contact does not exist or access denied"}
    }
)
def update_contact_status(
    contact_id: str,
    update: ContactStatusUpdate,
    user_id: str = Depends(get_current_user)
):
    return ContactService.update_contact_status(contact_id, update, user_id)

@router.get(
    "/campaigns/{campaign_id}/imports",
    response_model=PaginatedImports,
    summary="Get import history",
    description="Fetch a paginated list of file imports with their row-level error details.",
    responses={
        **common_responses,
        200: {
            "description": "Successfully retrieved import history"
        }
    }
)
def get_imports(
    campaign_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user_id: str = Depends(get_current_user)
):
    return ContactService.get_imports_paginated(campaign_id, user_id, page, limit)

@router.get(
    "/campaigns/{campaign_id}/contacts/stats",
    response_model=ContactStats,
    summary="Get contact statistics",
    description="Fetch aggregated contact statistics for a campaign.",
    responses={
        **common_responses,
        200: {
            "description": "Successfully retrieved statistics",
            "content": {
                "application/json": {
                    "example": {
                        "total_contacts": 150,
                        "new_contacts": 100,
                        "contacted_contacts": 30,
                        "interested_contacts": 15,
                        "enrolled_contacts": 5
                    }
                }
            }
        }
    }
)
def get_contact_stats(
    campaign_id: str,
    user_id: str = Depends(get_current_user)
):
    return ContactService.get_contact_stats(campaign_id, user_id)

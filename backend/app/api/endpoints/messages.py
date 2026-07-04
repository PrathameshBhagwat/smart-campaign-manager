from fastapi import APIRouter, Depends, status, Query
from app.schemas.message import MessageCreate, MessageUpdate, MessageResponse, MessageListResponse, CopyResponse, MessageGenerateRequest, MessageGenerateResponse
from app.services.message_service import MessageService
from app.services.ai_service import AIService
from app.services.export_service import ExportService
from app.middleware.auth import get_current_user

router = APIRouter()

common_responses = {
    401: {"description": "Unauthorized - Missing or invalid token"},
    403: {"description": "Forbidden - Access denied to this resource"},
    404: {"description": "Not Found - Resource does not exist"}
}

@router.get("/campaigns/{campaign_id}/messages/export")
def export_messages(
    campaign_id: str,
    channel: str = Query("all", description="Channel to filter by (linkedin, email, whatsapp, all)"),
    format_type: str = Query("csv", description="Format to export (csv, xlsx)"),
    user_id: str = Depends(get_current_user)
):
    return ExportService.export_messages(campaign_id, channel, format_type, user_id)

@router.get(
    "/contacts/{contact_id}/messages",
    response_model=MessageListResponse,
    summary="Get messages for a contact",
    description="Retrieve all outreach messages linked to a specific contact, ordered by newest first.",
    responses={
        **common_responses,
        200: {
            "description": "Successfully retrieved messages",
            "content": {
                "application/json": {
                    "example": {
                        "messages": [
                            {
                                "id": "123e4567-e89b-12d3-a456-426614174000",
                                "contact_id": "123e4567-e89b-12d3-a456-426614174001",
                                "content": "Hi John, I noticed your work at Acme Corp...",
                                "channel": "linkedin",
                                "generation_source": "manual",
                                "status": "draft",
                                "character_count": 45,
                                "version": 1,
                                "copied_count": 3,
                                "last_copied_at": "2023-10-01T14:00:00Z",
                                "created_at": "2023-10-01T12:00:00Z",
                                "updated_at": "2023-10-01T12:00:00Z"
                            }
                        ],
                        "total_count": 1
                    }
                }
            }
        }
    }
)
def get_messages(
    contact_id: str,
    user_id: str = Depends(get_current_user)
):
    return MessageService.get_messages(contact_id, user_id)


@router.post(
    "/contacts/{contact_id}/messages",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a manual message",
    description="Create a new manually-written outreach message for a specific contact.",
    responses={
        **common_responses,
        201: {
            "description": "Message created successfully",
            "content": {
                "application/json": {
                    "example": {
                        "id": "123e4567-e89b-12d3-a456-426614174000",
                        "contact_id": "123e4567-e89b-12d3-a456-426614174001",
                        "content": "Hi John, I noticed your work at Acme Corp and wanted to share our Data Science program.",
                        "channel": "linkedin",
                        "generation_source": "manual",
                        "status": "draft",
                        "character_count": 87,
                        "version": 1,
                        "copied_count": 0,
                        "last_copied_at": None,
                        "created_at": "2023-10-01T12:00:00Z",
                        "updated_at": "2023-10-01T12:00:00Z"
                    }
                }
            }
        },
        400: {"description": "Bad Request - Invalid channel or content too short/long"}
    }
)
def create_message(
    contact_id: str,
    data: MessageCreate,
    user_id: str = Depends(get_current_user)
):
    return MessageService.create_message(contact_id, data, user_id)


@router.patch(
    "/messages/{message_id}",
    response_model=MessageResponse,
    summary="Update a message",
    description="Edit the content and/or channel of an existing message. Automatically bumps the version number.",
    responses={
        **common_responses,
        200: {
            "description": "Message updated successfully",
            "content": {
                "application/json": {
                    "example": {
                        "id": "123e4567-e89b-12d3-a456-426614174000",
                        "contact_id": "123e4567-e89b-12d3-a456-426614174001",
                        "content": "Updated message content here.",
                        "channel": "email",
                        "generation_source": "manual",
                        "status": "draft",
                        "character_count": 28,
                        "version": 2,
                        "copied_count": 3,
                        "last_copied_at": "2023-10-01T14:00:00Z",
                        "created_at": "2023-10-01T12:00:00Z",
                        "updated_at": "2023-10-02T10:00:00Z"
                    }
                }
            }
        },
        400: {"description": "Bad Request - Invalid channel or no fields to update"}
    }
)
def update_message(
    message_id: str,
    data: MessageUpdate,
    user_id: str = Depends(get_current_user)
):
    return MessageService.update_message(message_id, data, user_id)


@router.delete(
    "/messages/{message_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a message",
    description="Permanently delete a message. Hard deletes are used for MVP simplicity.",
    responses={
        **common_responses,
        204: {"description": "Message deleted successfully"}
    }
)
def delete_message(
    message_id: str,
    user_id: str = Depends(get_current_user)
):
    MessageService.delete_message(message_id, user_id)


@router.post(
    "/messages/{message_id}/copy",
    response_model=CopyResponse,
    summary="Record a message copy",
    description="Atomically increment the copied_count and update last_copied_at when a user copies a message to their clipboard.",
    responses={
        **common_responses,
        200: {
            "description": "Copy count incremented",
            "content": {
                "application/json": {
                    "example": {
                        "message_id": "123e4567-e89b-12d3-a456-426614174000",
                        "copied_count": 4,
                        "last_copied_at": "2023-10-02T15:30:00Z"
                    }
                }
            }
        }
    }
)
def copy_message(
    message_id: str,
    user_id: str = Depends(get_current_user)
):
    return MessageService.copy_message(message_id, user_id)

@router.post(
    "/contacts/{contact_id}/messages/generate",
    response_model=MessageGenerateResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate an AI message",
    description="Generate a personalized outreach message for a single contact using OpenAI.",
    responses={
        **common_responses,
        200: {
            "description": "Message generated successfully",
            "content": {
                "application/json": {
                    "example": {
                        "cached": False,
                        "message": {
                            "id": "123e4567-e89b-12d3-a456-426614174000",
                            "contact_id": "123e4567-e89b-12d3-a456-426614174001",
                            "content": "Hi John, I noticed your work at Acme Corp...",
                            "channel": "linkedin",
                            "generation_source": "ai",
                            "status": "ready",
                            "character_count": 87,
                            "version": 1,
                            "copied_count": 0,
                            "ai_model": "gpt-4o-mini",
                            "prompt_version": "v1",
                            "generation_duration_ms": 2400,
                            "created_at": "2023-10-01T12:00:00Z",
                            "updated_at": "2023-10-01T12:00:00Z"
                        }
                    }
                }
            }
        },
        503: {"description": "Service Unavailable - OpenAI Timeout or failure"}
    }
)
def generate_message(
    contact_id: str,
    data: MessageGenerateRequest,
    user_id: str = Depends(get_current_user)
):
    return AIService.generate_message(contact_id, data.channel, user_id)

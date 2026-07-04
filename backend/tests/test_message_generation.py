import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app

client = TestClient(app)

@patch('app.api.endpoints.messages.AIService.generate_message')
@patch('app.middleware.auth.get_supabase_client')
def test_generate_message_endpoint_success(mock_supabase, mock_generate):
    mock_db = MagicMock()
    mock_supabase.return_value = mock_db
    
    mock_user = MagicMock()
    mock_user.user.id = "user_1"
    mock_db.auth.get_user.return_value = mock_user
    
    from app.schemas.message import MessageGenerateResponse, MessageResponse
    from datetime import datetime
    import uuid
    
    mock_msg = MessageResponse(
        id=uuid.UUID("123e4567-e89b-12d3-a456-426614174000"),
        contact_id=uuid.UUID("123e4567-e89b-12d3-a456-426614174001"),
        content="API Response",
        channel="linkedin",
        generation_source="ai",
        status="ready",
        version=1,
        character_count=12,
        copied_count=0,
        last_copied_at=None,
        ai_model="gpt-4o-mini",
        prompt_version="v1",
        generation_duration_ms=1000,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    mock_result = MessageGenerateResponse(cached=False, message=mock_msg)
    mock_generate.return_value = mock_result
    
    response = client.post(
        "/api/v1/contacts/test_contact/messages/generate",
        json={"channel": "linkedin"},
        headers={"Authorization": "Bearer valid_token"}
    )
    
    assert response.status_code == 200
    assert response.json()["cached"] is False
    assert response.json()["message"]["content"] == "API Response"

@patch('app.middleware.auth.get_supabase_client')
def test_generate_message_endpoint_invalid_channel(mock_supabase):
    mock_db = MagicMock()
    mock_supabase.return_value = mock_db
    
    mock_user = MagicMock()
    mock_user.user.id = "user_1"
    mock_db.auth.get_user.return_value = mock_user

    response = client.post(
        "/api/v1/contacts/test_contact/messages/generate",
        json={"channel": "sms"},
        headers={"Authorization": "Bearer valid_token"}
    )
    assert response.status_code in [400, 422, 500]

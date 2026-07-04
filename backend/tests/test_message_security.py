import pytest
from unittest.mock import patch, MagicMock
from app.services.message_service import MessageService
from fastapi import HTTPException


@patch('app.services.message_service.get_supabase_client')
def test_cross_user_read_messages_blocked(mock_get_client):
    """User B should not be able to read User A's messages"""
    mock_supabase = MagicMock()
    mock_get_client.return_value = mock_supabase

    # Contact belongs to User A, but User B is requesting
    mock_result = MagicMock()
    mock_result.data = [{"id": "contact_1", "campaign_id": "camp_1", "campaigns": {"user_id": "user_A"}}]
    mock_supabase.table().select().eq().execute.return_value = mock_result

    with pytest.raises(HTTPException) as excinfo:
        MessageService.get_messages("contact_1", "user_B")

    assert excinfo.value.status_code == 403


@patch('app.services.message_service.get_supabase_client')
def test_cross_user_delete_message_blocked(mock_get_client):
    """User B should not be able to delete User A's messages"""
    mock_supabase = MagicMock()
    mock_get_client.return_value = mock_supabase

    # Message belongs to User A
    mock_result = MagicMock()
    mock_result.data = [{
        "id": "msg_1",
        "contact_id": "contact_1",
        "contacts": {
            "campaign_id": "camp_1",
            "campaigns": {"user_id": "user_A"}
        }
    }]
    mock_supabase.table().select().eq().execute.return_value = mock_result

    with pytest.raises(HTTPException) as excinfo:
        MessageService.delete_message("msg_1", "user_B")

    assert excinfo.value.status_code == 403


@patch('app.services.message_service.get_supabase_client')
def test_cross_user_copy_message_blocked(mock_get_client):
    """User B should not be able to increment copy count on User A's messages"""
    mock_supabase = MagicMock()
    mock_get_client.return_value = mock_supabase

    # Message belongs to User A
    mock_result = MagicMock()
    mock_result.data = [{
        "id": "msg_1",
        "contact_id": "contact_1",
        "contacts": {
            "campaign_id": "camp_1",
            "campaigns": {"user_id": "user_A"}
        }
    }]
    mock_supabase.table().select().eq().execute.return_value = mock_result

    with pytest.raises(HTTPException) as excinfo:
        MessageService.copy_message("msg_1", "user_B")

    assert excinfo.value.status_code == 403


@patch('app.services.message_service.get_supabase_client')
def test_contact_not_found_returns_404(mock_get_client):
    """Accessing messages for a non-existent contact should return 404"""
    mock_supabase = MagicMock()
    mock_get_client.return_value = mock_supabase

    mock_result = MagicMock()
    mock_result.data = []
    mock_supabase.table().select().eq().execute.return_value = mock_result

    with pytest.raises(HTTPException) as excinfo:
        MessageService.get_messages("nonexistent_contact", "user_1")

    assert excinfo.value.status_code == 404

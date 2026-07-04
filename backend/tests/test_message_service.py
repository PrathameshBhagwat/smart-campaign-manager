import pytest
from unittest.mock import patch, MagicMock
from app.services.message_service import MessageService
from app.schemas.message import MessageCreate, MessageUpdate
from fastapi import HTTPException


@patch('app.services.message_service.get_supabase_client')
def test_create_message_success(mock_get_client):
    mock_supabase = MagicMock()
    mock_get_client.return_value = mock_supabase

    # Mock contact ownership check
    mock_ownership = MagicMock()
    mock_ownership.data = [{"id": "contact_1", "campaign_id": "camp_1", "campaigns": {"user_id": "user_1"}}]
    mock_supabase.table().select().eq().execute.return_value = mock_ownership

    # Mock message insert
    mock_insert = MagicMock()
    mock_insert.data = [{
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "contact_id": "123e4567-e89b-12d3-a456-426614174001",
        "content": "Hello John, great work at Acme Corp!",
        "channel": "linkedin",
        "generation_source": "manual",
        "status": "draft",
        "character_count": 36,
        "version": 1,
        "copied_count": 0,
        "last_copied_at": None,
        "created_at": "2023-10-01T12:00:00Z",
        "updated_at": "2023-10-01T12:00:00Z"
    }]
    mock_supabase.table().insert().execute.return_value = mock_insert

    data = MessageCreate(content="Hello John, great work at Acme Corp!", channel="linkedin")
    result = MessageService.create_message("contact_1", data, "user_1")

    assert result.channel == "linkedin"
    assert result.generation_source == "manual"
    assert result.version == 1


@patch('app.services.message_service.get_supabase_client')
def test_create_message_invalid_channel(mock_get_client):
    mock_supabase = MagicMock()
    mock_get_client.return_value = mock_supabase

    # Mock contact ownership
    mock_ownership = MagicMock()
    mock_ownership.data = [{"id": "contact_1", "campaign_id": "camp_1", "campaigns": {"user_id": "user_1"}}]
    mock_supabase.table().select().eq().execute.return_value = mock_ownership

    data = MessageCreate(content="Hello John, great work at Acme Corp!", channel="telegram")

    with pytest.raises(HTTPException) as excinfo:
        MessageService.create_message("contact_1", data, "user_1")

    assert excinfo.value.status_code == 400
    assert "Invalid channel" in excinfo.value.detail


@patch('app.services.message_service.get_supabase_client')
def test_get_messages_empty(mock_get_client):
    mock_supabase = MagicMock()
    mock_get_client.return_value = mock_supabase

    # Mock contact ownership
    mock_ownership = MagicMock()
    mock_ownership.data = [{"id": "contact_1", "campaign_id": "camp_1", "campaigns": {"user_id": "user_1"}}]
    mock_supabase.table().select().eq().execute.return_value = mock_ownership

    # Mock empty messages
    mock_messages = MagicMock()
    mock_messages.data = []
    mock_supabase.table().select().eq().order().execute.return_value = mock_messages

    result = MessageService.get_messages("contact_1", "user_1")
    assert result.total_count == 0
    assert len(result.messages) == 0


@patch('app.services.message_service.get_supabase_client')
def test_delete_message_not_found(mock_get_client):
    mock_supabase = MagicMock()
    mock_get_client.return_value = mock_supabase

    # Mock message not found
    mock_result = MagicMock()
    mock_result.data = []
    mock_supabase.table().select().eq().execute.return_value = mock_result

    with pytest.raises(HTTPException) as excinfo:
        MessageService.delete_message("nonexistent_id", "user_1")

    assert excinfo.value.status_code == 404


@patch('app.services.message_service.get_supabase_client')
def test_copy_message_increments_count(mock_get_client):
    mock_supabase = MagicMock()
    mock_get_client.return_value = mock_supabase

    # Mock message ownership (table 'messages' with join)
    mock_ownership = MagicMock()
    mock_ownership.data = [{
        "id": "msg_1",
        "contact_id": "contact_1",
        "contacts": {
            "campaign_id": "camp_1",
            "campaigns": {"user_id": "user_1"}
        }
    }]

    # Mock current count select
    mock_current = MagicMock()
    mock_current.data = [{"copied_count": 5}]

    # Mock update result
    mock_update = MagicMock()
    mock_update.data = [{"copied_count": 6, "last_copied_at": "2023-10-02T15:30:00Z"}]

    # Use a call counter to differentiate multiple calls to table('messages')
    call_count = {"select": 0}

    def mock_table(name):
        mock_t = MagicMock()
        if name == 'messages':
            def mock_select(*args, **kwargs):
                call_count["select"] += 1
                chain = MagicMock()
                if call_count["select"] == 1:
                    # First select: ownership check (with join)
                    chain.eq().execute.return_value = mock_ownership
                else:
                    # Second select: current copied_count
                    chain.eq().execute.return_value = mock_current
                return chain

            mock_t.select = mock_select
            mock_t.update().eq().execute.return_value = mock_update
        return mock_t

    mock_supabase.table.side_effect = mock_table

    # Mock RPC failure to exercise the fallback path
    mock_supabase.rpc().execute.side_effect = Exception("No RPC")

    result = MessageService.copy_message("123e4567-e89b-12d3-a456-426614174099", "user_1")

    assert result.copied_count == 6

import pytest
from unittest.mock import patch, MagicMock
from fastapi import HTTPException
from app.services.ai_service import AIService
from app.schemas.message import MessageGenerateRequest
from openai import APITimeoutError

@pytest.fixture(autouse=True)
def mock_daily_limit():
    with patch.object(AIService, 'check_daily_limit', return_value=None):
        yield

@patch('app.services.ai_service.get_supabase_client')
@patch('app.services.ai_service.OpenAI')
@patch('app.services.ai_service.MessageService._verify_contact_ownership')
def test_ai_generation_success(mock_verify, mock_openai, mock_supabase):
    mock_verify.return_value = {"id": "test_contact"}
    
    mock_db = MagicMock()
    mock_supabase.return_value = mock_db
    
    # Mock no existing message
    mock_existing = MagicMock()
    mock_existing.data = []
    mock_db.table().select().eq().eq().eq().eq().execute.return_value = mock_existing
    
    # Mock contact context
    mock_contact = MagicMock()
    mock_contact.data = [{
        "name": "John",
        "job_title": "CEO",
        "company": "Acme",
        "city": "NY",
        "campaigns": {
            "name": "Camp",
            "course_name": "DS",
            "description": "Desc"
        }
    }]
    mock_db.table().select().eq().execute.return_value = mock_contact
    
    # Mock OpenAI
    mock_client = MagicMock()
    mock_openai.return_value = mock_client
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = "Hi John, saw you are the CEO at Acme..."
    mock_client.chat.completions.create.return_value = mock_response
    
    # Mock insert
    mock_insert = MagicMock()
    mock_insert.data = [{
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "contact_id": "123e4567-e89b-12d3-a456-426614174001",
        "content": "Hi John, saw you are the CEO at Acme...",
        "channel": "linkedin",
        "generation_source": "ai",
        "status": "ready",
        "version": 1,
        "character_count": 39,
        "copied_count": 0,
        "last_copied_at": None,
        "ai_model": "gpt-4o-mini",
        "prompt_version": "v1",
        "generation_duration_ms": 1000,
        "created_at": "2023-10-01T12:00:00Z",
        "updated_at": "2023-10-01T12:00:00Z"
    }]
    mock_db.table().insert().execute.return_value = mock_insert
    
    result = AIService.generate_message("123e4567-e89b-12d3-a456-426614174001", "linkedin", "user1")
    
    assert result.cached is False
    assert result.message.content == "Hi John, saw you are the CEO at Acme..."
    assert result.message.ai_model == "gpt-4o-mini"

@patch('app.services.ai_service.get_supabase_client')
@patch('app.services.ai_service.MessageService._verify_contact_ownership')
def test_ai_generation_returns_cached(mock_verify, mock_supabase):
    mock_verify.return_value = {"id": "123e4567-e89b-12d3-a456-426614174001"}
    
    mock_db = MagicMock()
    mock_supabase.return_value = mock_db
    
    # Mock existing message
    mock_existing = MagicMock()
    mock_existing.data = [{
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "contact_id": "123e4567-e89b-12d3-a456-426614174001",
        "content": "Cached AI msg",
        "channel": "linkedin",
        "generation_source": "ai",
        "status": "ready",
        "version": 1,
        "character_count": 13,
        "copied_count": 0,
        "last_copied_at": None,
        "ai_model": "gpt-4o-mini",
        "prompt_version": "v1",
        "generation_duration_ms": 1000,
        "created_at": "2023-10-01T12:00:00Z",
        "updated_at": "2023-10-01T12:00:00Z"
    }]
    mock_db.table().select().eq().eq().eq().eq().execute.return_value = mock_existing
    
    result = AIService.generate_message("test_contact", "linkedin", "user1")
    
    assert result.cached is True
    assert result.message.content == "Cached AI msg"

@patch('app.services.ai_service.get_supabase_client')
@patch('app.services.ai_service.OpenAI')
@patch('app.services.ai_service.MessageService._verify_contact_ownership')
def test_ai_generation_timeout_error(mock_verify, mock_openai, mock_supabase):
    mock_verify.return_value = {"id": "test_contact"}
    mock_db = MagicMock()
    mock_supabase.return_value = mock_db
    
    mock_existing = MagicMock()
    mock_existing.data = []
    mock_db.table().select().eq().eq().eq().eq().execute.return_value = mock_existing
    
    mock_contact = MagicMock()
    mock_contact.data = [{"name": "John", "campaigns": {}}]
    mock_db.table().select().eq().execute.return_value = mock_contact
    
    mock_client = MagicMock()
    mock_openai.return_value = mock_client
    # Simulate timeout
    mock_client.chat.completions.create.side_effect = APITimeoutError(MagicMock())
    
    with pytest.raises(HTTPException) as excinfo:
        AIService.generate_message("test_contact", "linkedin", "user1")
        
    assert excinfo.value.status_code == 503
    assert excinfo.value.detail["code"] == "AI_GENERATION_FAILED"

@patch('app.services.ai_service.get_supabase_client')
@patch('app.services.ai_service.OpenAI')
@patch('app.services.ai_service.MessageService._verify_contact_ownership')
def test_ai_generation_cleans_placeholders(mock_verify, mock_openai, mock_supabase):
    mock_verify.return_value = {"id": "123e4567-e89b-12d3-a456-426614174001"}
    mock_db = MagicMock()
    mock_supabase.return_value = mock_db
    
    mock_existing = MagicMock()
    mock_existing.data = []
    mock_db.table().select().eq().eq().eq().eq().execute.return_value = mock_existing
    
    mock_contact = MagicMock()
    mock_contact.data = [{"name": "John", "campaigns": {}}]
    mock_db.table().select().eq().execute.return_value = mock_contact
    
    mock_client = MagicMock()
    mock_openai.return_value = mock_client
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = "Hi [Name], how are you?"
    mock_client.chat.completions.create.return_value = mock_response

    # Mock insert
    mock_insert = MagicMock()
    mock_insert.data = [{
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "contact_id": "123e4567-e89b-12d3-a456-426614174001",
        "content": "Hi , how are you?",
        "channel": "linkedin",
        "generation_source": "ai",
        "status": "ready",
        "version": 1,
        "character_count": 17,
        "copied_count": 0,
        "last_copied_at": None,
        "ai_model": "gpt-4o-mini",
        "prompt_version": "v1",
        "generation_duration_ms": 1000,
        "created_at": "2023-10-01T12:00:00Z",
        "updated_at": "2023-10-01T12:00:00Z"
    }]
    mock_db.table().insert().execute.return_value = mock_insert
    
    result = AIService.generate_message("123e4567-e89b-12d3-a456-426614174001", "linkedin", "user1")
        
    assert result.message.content == "Hi , how are you?"

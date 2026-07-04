from unittest.mock import MagicMock, patch
from app.services.ai_service import AIService

@patch('app.services.ai_service.MessageService')
@patch('app.services.ai_service.get_supabase_client')
def test_cache_tracking(mock_get_supabase, mock_message_service):
    supabase = MagicMock()
    mock_get_supabase.return_value = supabase
    
    mock_message_service._verify_contact_ownership.return_value = True
    
    # Mock limits
    mock_result_limit = MagicMock()
    mock_result_limit.count = 0
    
    # Mock cached message
    mock_existing = MagicMock()
    mock_existing.data = [{
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "contact_id": "123e4567-e89b-12d3-a456-426614174001",
        "content": "Cached Content",
        "channel": "linkedin",
        "generation_source": "ai",
        "status": "ready",
        "version": 1,
        "character_count": 14,
        "copied_count": 0,
        "ai_model": "gpt-4o-mini",
        "prompt_version": "v1",
        "generation_duration_ms": 1000,
        "created_at": "2023-10-01T12:00:00Z",
        "updated_at": "2023-10-01T12:00:00Z"
    }]
    
    # Setup chain
    supabase.table.return_value.select.return_value.eq.return_value.gte.return_value.execute.return_value = mock_result_limit
    supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.eq.return_value.eq.return_value.execute.return_value = mock_existing
    
    # Spy on log_usage
    with patch.object(AIService, 'log_usage') as mock_log_usage:
        result = AIService.generate_message("contact-1", "linkedin", "user_1")
        
        assert result.cached is True
        assert result.message.content == "Cached Content"
        
        # Verify cache_hit=True
        mock_log_usage.assert_called_once_with(
            supabase, "user_1", "123e4567-e89b-12d3-a456-426614174000", "linkedin", cache_hit=True,
            input_tokens=0, output_tokens=0, estimated_cost=0.0, prompt_version='v1'
        )

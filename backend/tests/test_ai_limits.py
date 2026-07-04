import pytest
from unittest.mock import MagicMock
from fastapi import HTTPException
from app.services.ai_service import AIService
from app.core.config import settings

def test_daily_limit_exceeded():
    supabase = MagicMock()
    mock_result = MagicMock()
    mock_result.count = 100
    
    # Mock supabase.table('ai_usage').select('id', count='exact').eq('user_id', user_id).gte(...).execute()
    supabase.table.return_value.select.return_value.eq.return_value.gte.return_value.execute.return_value = mock_result
    
    original_limit = settings.OPENAI_MAX_DAILY_GENERATIONS
    settings.OPENAI_MAX_DAILY_GENERATIONS = 100
    
    with pytest.raises(HTTPException) as exc:
        AIService.check_daily_limit(supabase, "user_1")
        
    assert exc.value.status_code == 429
    assert exc.value.detail["code"] == "AI_LIMIT_EXCEEDED"
    
    # Restore
    settings.OPENAI_MAX_DAILY_GENERATIONS = original_limit

def test_daily_limit_ok():
    supabase = MagicMock()
    mock_result = MagicMock()
    mock_result.count = 99
    
    supabase.table.return_value.select.return_value.eq.return_value.gte.return_value.execute.return_value = mock_result
    
    # Should not raise
    AIService.check_daily_limit(supabase, "user_1")

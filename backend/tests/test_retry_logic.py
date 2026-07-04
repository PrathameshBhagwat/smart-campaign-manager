import pytest
from unittest.mock import patch, MagicMock
from openai import RateLimitError
from app.services.ai_service import AIService

@patch('app.services.ai_service.OpenAI')
def test_retry_on_rate_limit(mock_openai_class):
    mock_client = MagicMock()
    mock_openai_class.return_value = mock_client
    
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = "Success"
    
    # 429 -> 429 -> Success
    error_response = MagicMock()
    mock_client.chat.completions.create.side_effect = [
        RateLimitError("Rate limited", response=error_response, body={}),
        RateLimitError("Rate limited", response=error_response, body={}),
        mock_response
    ]
    
    result = AIService.generate_completion_with_validation("system", "user", "linkedin")
    
    assert result.choices[0].message.content == "Success"
    assert mock_client.chat.completions.create.call_count == 3

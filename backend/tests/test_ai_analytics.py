import pytest
from unittest.mock import MagicMock
from app.services.analytics_service import AnalyticsService

from datetime import datetime, timedelta, timezone

def test_ai_analytics_calculations(monkeypatch):
    today = datetime.now(timezone.utc)
    yesterday = today - timedelta(days=1)
    
    today_str = today.strftime("%Y-%m-%dT10:00:00Z")
    yesterday_str = yesterday.strftime("%Y-%m-%dT10:00:00Z")
    
    # Mock data to return from Supabase
    mock_records = [
        {
            "id": "u1", "cache_hit": False, "channel": "linkedin", "estimated_cost_usd": 0.010,
            "generated_at": yesterday_str,
            "messages": {"ai_provider": "google", "status": "ready", "generation_duration_ms": 1000}
        },
        {
            "id": "u2", "cache_hit": True, "channel": "linkedin", "estimated_cost_usd": 0.0,
            "generated_at": yesterday_str,
            "messages": {"ai_provider": "google", "status": "ready", "generation_duration_ms": 100}
        },
        {
            "id": "u3", "cache_hit": False, "channel": "email", "estimated_cost_usd": 0.020,
            "generated_at": today_str,
            "messages": {"ai_provider": "groq", "status": "failed", "generation_duration_ms": 5000}
        }
    ]

    mock_supabase = MagicMock()
    mock_execute = MagicMock()
    mock_execute.data = mock_records
    
    mock_supabase.table().select().eq().execute.return_value = mock_execute
    monkeypatch.setattr("app.services.analytics_service.get_supabase_client", lambda: mock_supabase)

    result = AnalyticsService.get_ai_analytics("test_user")

    assert result.total_generations == 3
    assert result.cache_hits == 1
    assert result.cache_hit_rate == 33.3  # 1/3 * 100
    assert result.success_rate == 66.7    # 2/3 * 100
    assert result.estimated_cost == 0.030
    assert result.avg_cost_per_generation == 0.010
    
    # avg duration = (1000 + 100 + 5000) / 3 = 6100 / 3 = 2033
    assert result.avg_generation_time_ms == 2033
    assert result.most_used_channel == "Linkedin"
    
    assert result.provider_breakdown == {"google": 2, "groq": 1}
    assert result.channel_breakdown == {"linkedin": 2, "email": 1}
    
    # Check daily trend
    days = {d.date: d.count for d in result.daily_generations}
    yesterday_date_str = yesterday.strftime("%Y-%m-%d")
    today_date_str = today.strftime("%Y-%m-%d")
    
    assert days.get(yesterday_date_str) == 2
    assert days.get(today_date_str) == 1

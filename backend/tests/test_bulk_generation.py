import pytest
from unittest.mock import patch, MagicMock
from app.services.bulk_generation_service import BulkGenerationService
from fastapi import HTTPException

@patch('app.services.bulk_generation_service.get_supabase_client')
def test_create_job_success(mock_get_supabase):
    mock_supabase = MagicMock()
    mock_get_supabase.return_value = mock_supabase
    
    # Mock ownership
    mock_supabase.table().select().eq().eq().execute.return_value.data = [{'id': 'camp_1'}]
    mock_supabase.table().select().in_().eq().execute.return_value.data = [{'id': 'c1'}, {'id': 'c2'}]
    
    # Mock active jobs (none)
    mock_supabase.table().select().eq().in_().execute.return_value.data = []
    
    # Mock existing messages (none)
    mock_supabase.table().select().eq().eq().eq().eq().eq().in_().execute.return_value.data = []
    
    # Mock usage check (0 usage today)
    mock_count_result = MagicMock()
    mock_count_result.count = 0
    mock_supabase.table().select().eq().gte().execute.return_value = mock_count_result
    
    # Execute
    job_id = BulkGenerationService.create_job('camp_1', ['c1', 'c2'], 'linkedin', 'user1')
    
    assert job_id is not None
    mock_supabase.table().insert.assert_called_once()
    
@patch('app.services.bulk_generation_service.get_supabase_client')
def test_create_job_exceeds_quota(mock_get_supabase):
    mock_supabase = MagicMock()
    mock_get_supabase.return_value = mock_supabase
    
    mock_supabase.table().select().eq().eq().execute.return_value.data = [{'id': 'camp_1'}]
    mock_supabase.table().select().in_().eq().execute.return_value.data = [{'id': 'c1'}, {'id': 'c2'}]
    mock_supabase.table().select().eq().in_().execute.return_value.data = []
    mock_supabase.table().select().eq().eq().eq().eq().eq().in_().execute.return_value.data = []
    
    # Mock usage check (exceeds limit: assume limit is 200, we used 200)
    mock_count_result = MagicMock()
    mock_count_result.count = 200
    mock_supabase.table().select().eq().gte().execute.return_value = mock_count_result
    
    with patch('app.services.bulk_generation_service.settings.OPENAI_MAX_DAILY_GENERATIONS', 200):
        with pytest.raises(HTTPException) as exc:
            BulkGenerationService.create_job('camp_1', ['c1', 'c2'], 'linkedin', 'user1')
        assert exc.value.status_code == 429

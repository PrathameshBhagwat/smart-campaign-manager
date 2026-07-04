import pytest
from unittest.mock import patch, MagicMock
from app.services.bulk_generation_service import BulkGenerationService
from fastapi import HTTPException

@patch('app.services.bulk_generation_service.get_supabase_client')
def test_cancel_job(mock_get_supabase):
    mock_supabase = MagicMock()
    mock_get_supabase.return_value = mock_supabase
    
    # Mock finding the job as pending
    mock_supabase.table().select().eq().eq().execute.return_value.data = [{'status': 'pending'}]
    
    res = BulkGenerationService.cancel_job('job_1', 'user_1')
    assert res['status'] == 'cancelled'
    mock_supabase.table().update().eq().execute.assert_called_once()

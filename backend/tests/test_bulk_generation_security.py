import pytest
from unittest.mock import patch, MagicMock
from app.services.bulk_generation_service import BulkGenerationService
from fastapi import HTTPException

@patch('app.services.bulk_generation_service.get_supabase_client')
def test_ownership_validation_campaign_fail(mock_get_supabase):
    mock_supabase = MagicMock()
    mock_get_supabase.return_value = mock_supabase
    
    # Return empty for campaign indicating no access
    mock_supabase.table().select().eq().eq().execute.return_value.data = []
    
    with pytest.raises(HTTPException) as exc:
        BulkGenerationService._verify_campaign_ownership(mock_supabase, 'camp_1', 'user_1')
    assert exc.value.status_code == 403

@patch('app.services.bulk_generation_service.get_supabase_client')
def test_ownership_validation_contacts_fail(mock_get_supabase):
    mock_supabase = MagicMock()
    mock_get_supabase.return_value = mock_supabase
    
    # Return fewer valid contacts than requested
    mock_supabase.table().select().in_().eq().execute.return_value.data = [{'id': 'c1'}]
    
    with pytest.raises(HTTPException) as exc:
        BulkGenerationService._verify_contacts_ownership(mock_supabase, ['c1', 'c2'], 'camp_1')
    assert exc.value.status_code == 400

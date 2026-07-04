import pytest
from unittest.mock import patch, MagicMock
from app.services.contact_service import ContactService
from fastapi import HTTPException

@patch('app.services.contact_service.get_supabase_client')
def test_cross_user_access_blocked(mock_get_client):
    mock_supabase = MagicMock()
    mock_get_client.return_value = mock_supabase
    
    # Simulate DB returning empty list when user A tries to access campaign owned by user B
    mock_camp_response = MagicMock()
    mock_camp_response.data = []
    mock_supabase.table().select().eq().eq().execute.return_value = mock_camp_response
    
    with pytest.raises(HTTPException) as excinfo:
        ContactService.get_contacts_paginated("camp_123", "user_B_id")
        
    assert excinfo.value.status_code == 403
    assert "access denied" in excinfo.value.detail.lower()

@patch('app.services.contact_service.get_supabase_client')
def test_cross_user_stats_blocked(mock_get_client):
    mock_supabase = MagicMock()
    mock_get_client.return_value = mock_supabase
    
    mock_camp_response = MagicMock()
    mock_camp_response.data = []
    mock_supabase.table().select().eq().eq().execute.return_value = mock_camp_response
    
    with pytest.raises(HTTPException) as excinfo:
        ContactService.get_contact_stats("camp_123", "user_B_id")
        
    assert excinfo.value.status_code == 403

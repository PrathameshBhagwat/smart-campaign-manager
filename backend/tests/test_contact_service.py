import pytest
from unittest.mock import patch, MagicMock
from app.services.contact_service import ContactService
from app.schemas.contact import ContactStatusUpdate
from fastapi import HTTPException

@patch('app.services.contact_service.get_supabase_client')
def test_update_contact_status_success(mock_get_client):
    # Setup mock
    mock_supabase = MagicMock()
    mock_get_client.return_value = mock_supabase
    
    # Mock update response
    mock_response = MagicMock()
    mock_response.data = [{"id": "123e4567-e89b-12d3-a456-426614174000", "campaign_id": "123e4567-e89b-12d3-a456-426614174001", "status": "Contacted", "name": "John", "created_at": "2023-01-01T00:00:00Z"}]
    mock_supabase.table().update().eq().execute.return_value = mock_response
    
    update_data = ContactStatusUpdate(status="Contacted")
    result = ContactService.update_contact_status("123e4567-e89b-12d3-a456-426614174000", update_data, "user_123")
    
    assert result.status == "Contacted"
    mock_supabase.table().update.assert_called_with({"status": "Contacted"})

@patch('app.services.contact_service.get_supabase_client')
def test_update_contact_status_not_found(mock_get_client):
    mock_supabase = MagicMock()
    mock_get_client.return_value = mock_supabase
    
    mock_response = MagicMock()
    mock_response.data = [] # Empty response simulates not found or RLS block
    mock_supabase.table().update().eq().execute.return_value = mock_response
    
    update_data = ContactStatusUpdate(status="Interested")
    
    with pytest.raises(HTTPException) as excinfo:
        ContactService.update_contact_status("123e4567-e89b-12d3-a456-426614174000", update_data, "user_123")
        
    assert excinfo.value.status_code == 404

@patch('app.services.contact_service.get_supabase_client')
def test_pagination_edge_cases(mock_get_client):
    mock_supabase = MagicMock()
    mock_get_client.return_value = mock_supabase
    
    # Mock campaign response
    mock_camp_response = MagicMock()
    mock_camp_response.data = [{"id": "camp_123"}]
    mock_supabase.table().select().eq().eq().execute.return_value = mock_camp_response
    
    # Mock contacts response
    class MockResponse:
        def __init__(self, data, count):
            self.data = data
            self.count = count
            
    mock_query = MockResponse([], 0)
    # The actual chain without filters is select().eq().order().range().execute()
    mock_supabase.table().select().eq().order().range().execute.return_value = mock_query
    
    # Very high page number should return empty list but correctly calculated total_pages (1 if count is 0)
    result = ContactService.get_contacts_paginated("camp_123", "user_123", page=999, limit=20)
    assert result.total_count == 0
    assert result.total_pages == 1
    assert result.current_page == 999
    assert len(result.contacts) == 0

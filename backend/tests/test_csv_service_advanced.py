import pytest
import pandas as pd
from unittest.mock import patch, MagicMock, AsyncMock
from app.services.csv_service import CSVService
from fastapi import UploadFile, HTTPException

import asyncio

@patch('app.services.csv_service.get_supabase_client')
def test_duplicate_imports_skipped(mock_get_client):
    asyncio.run(_run_test_duplicate_imports_skipped(mock_get_client))

async def _run_test_duplicate_imports_skipped(mock_get_client):
    mock_supabase = MagicMock()
    mock_get_client.return_value = mock_supabase
    
    # Mock campaign ownership
    mock_camp = MagicMock()
    mock_camp.data = [{"id": "camp_123"}]
    
    # Mock existing contacts
    mock_existing = MagicMock()
    mock_existing.data = [
        {"email": "existing@example.com", "phone": "1234567890"}
    ]
    
    # Mock insert history
    mock_hist = MagicMock()
    mock_hist.data = [{"id": "123e4567-e89b-12d3-a456-426614174000", "campaign_id": "123e4567-e89b-12d3-a456-426614174001", "file_name": "test.csv", "imported_count": 1, "skipped_count": 1, "error_count": 0, "total_errors": 0, "status": "completed", "error_details": [], "created_at": "2023-01-01T00:00:00Z"}]
    
    # Mock insert contacts
    mock_insert = MagicMock()
    mock_insert.data = [{"id": "123e4567-e89b-12d3-a456-426614174002"}]

    mock_table_camp = MagicMock()
    mock_table_camp.select().eq().eq().execute.return_value = mock_camp
    
    mock_table_contacts = MagicMock()
    mock_table_contacts.select().eq().execute.return_value = mock_existing
    mock_table_contacts.insert().execute.return_value = mock_insert
    
    mock_table_imports = MagicMock()
    mock_table_imports.insert().execute.return_value = mock_hist

    def mock_table(name):
        if name == 'campaigns':
            return mock_table_camp
        elif name == 'contacts':
            return mock_table_contacts
        elif name == 'imports':
            return mock_table_imports
        return MagicMock()

    mock_supabase.table.side_effect = mock_table
    
    # Mock file upload reading
    mock_file = AsyncMock(spec=UploadFile)
    mock_file.filename = "test.csv"
    mock_file.read.return_value = b"name,email,phone,company,job_title,city\nJohn,existing@example.com,11111111,Acme,CEO,NY\nJane,new@example.com,99999999,Globex,CTO,LA"
    
    summary = await CSVService.process_file_upload(mock_file, "camp_123", "user_123")
    
    # Assert one was skipped, one was inserted
    args, kwargs = mock_table_contacts.insert.call_args
    inserted_contacts = args[0]
    
    assert len(inserted_contacts) == 1
    assert inserted_contacts[0]["email"] == "new@example.com"

import pytest
import pandas as pd
from app.services.csv_service import CSVService

def test_email_normalization():
    assert CSVService._normalize_email(" Test@EXAMPLE.com ") == "test@example.com"
    assert CSVService._normalize_email(None) is None
    assert CSVService._normalize_email(float('nan')) is None
    assert CSVService._normalize_email("") is None

def test_phone_normalization():
    assert CSVService._normalize_phone(" +1 (555) 123-4567 ") == "+15551234567"
    assert CSVService._normalize_phone("123 456 7890") == "1234567890"
    assert CSVService._normalize_phone(None) is None

def test_name_normalization():
    assert CSVService._normalize_name(" John Doe ") == "John Doe"
    assert CSVService._normalize_name(None) == "Unknown"
    assert CSVService._normalize_name("") == "Unknown"

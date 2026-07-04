import pytest
from app.services.csv_service import CSVService

def test_normalize_linkedin_valid():
    assert CSVService._normalize_linkedin("https://linkedin.com/in/johndoe") == "https://linkedin.com/in/johndoe"
    assert CSVService._normalize_linkedin("https://www.linkedin.com/company/google") == "https://www.linkedin.com/company/google"
    assert CSVService._normalize_linkedin("linkedin.com/in/smith") == "https://linkedin.com/in/smith"
    assert CSVService._normalize_linkedin("www.linkedin.com/in/smith") == "https://www.linkedin.com/in/smith"

def test_normalize_linkedin_invalid_protocol():
    assert CSVService._normalize_linkedin("javascript:alert(1)") is None
    assert CSVService._normalize_linkedin("data:text/html") is None
    assert CSVService._normalize_linkedin("file:///etc/passwd") is None
    assert CSVService._normalize_linkedin("ftp://server.com") is None
    assert CSVService._normalize_linkedin("http://localhost:8000") is None

def test_normalize_linkedin_not_linkedin():
    assert CSVService._normalize_linkedin("https://twitter.com/in/johndoe") is None
    assert CSVService._normalize_linkedin("https://example.com/linkedin.com/in/smith") is None

def test_normalize_linkedin_empty_and_null():
    assert CSVService._normalize_linkedin("") is None
    assert CSVService._normalize_linkedin(None) is None
    assert CSVService._normalize_linkedin("   ") is None

def test_normalize_linkedin_truncates():
    long_url = "https://linkedin.com/in/" + ("a" * 600)
    res = CSVService._normalize_linkedin(long_url)
    assert len(res) <= 500

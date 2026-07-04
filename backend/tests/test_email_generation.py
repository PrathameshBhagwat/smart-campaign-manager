import pytest
from app.utils.email_utils import build_mailto_link

def test_generation_empty_fields():
    # Should handle empty strings gracefully
    assert build_mailto_link("user@domain.com", "", "") == "mailto:user@domain.com"
    
def test_generation_special_symbols():
    link = build_mailto_link("user@domain.com", "Hi #there!", "This is 100% fine & good.")
    assert "Hi%20%23there%21" in link
    assert "100%25%20fine" in link

def test_generation_malformed_email():
    # Only checks @ existence basically, we leave robust validation to pydantic
    assert build_mailto_link("userdomain.com", "Subj", "Body") == ""

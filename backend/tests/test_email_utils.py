import pytest
from app.utils.email_utils import build_mailto_link

def test_build_mailto_basic():
    link = build_mailto_link("test@example.com")
    assert link == "mailto:test@example.com"

def test_build_mailto_with_subject_and_body():
    link = build_mailto_link("test@example.com", "Hello", "How are you?")
    assert "subject=Hello" in link
    assert "body=How%20are%20you%3F" in link

def test_build_mailto_truncation():
    long_body = "A" * 6000
    link = build_mailto_link("test@example.com", "Hello", long_body)
    # the body gets truncated to 5000 chars, encoded 'A' is just 'A'
    assert "body=" + ("A" * 5000) in link

def test_build_mailto_invalid_email():
    assert build_mailto_link("") == ""
    assert build_mailto_link("notanemail") == ""

def test_build_mailto_url_encoding():
    link = build_mailto_link("test@example.com", "Special & chars", "Line 1\nLine 2")
    assert "Special%20%26%20chars" in link
    assert "Line%201%0ALine%202" in link

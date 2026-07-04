import pytest
from app.services.quality_service import QualityService

def test_quality_excellent():
    # No spam, no placeholders, professional cta, good length
    content = "Hi John, I saw your work at Acme Corp. Let's connect to discuss our new Data Analytics program in New York."
    score, label, reasons = QualityService.evaluate_message(content)
    
    # 20 for personalization, 20 for CTA (connect/discuss), 20 for length, 20 for no spam, 20 for no placeholders = 100
    assert score == 100
    assert label == "excellent"

def test_quality_spam():
    content = "Hi John, BUY NOW this LIMITED OFFER. It is 100% GUARANTEED to make you rich. Let's connect!"
    score, label, reasons = QualityService.evaluate_message(content)
    
    # Has spam, so minus 20. Total 80 (Good)
    assert score <= 80
    
def test_quality_placeholders():
    content = "Hi [NAME], want to connect to discuss our program?"
    score, label, reasons = QualityService.evaluate_message(content)
    
    # Has placeholders, so minus 20.
    assert score <= 80

def test_quality_needs_review():
    # Too short, has placeholders, no CTA
    content = "Hi [NAME]."
    score, label, reasons = QualityService.evaluate_message(content)
    
    # No CTA (0), too short (0), no spam (20), has placeholders (0), personalization (20) = 40
    assert score < 70
    assert label == "needs_review"

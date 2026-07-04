import pytest
from app.security.business_rules import BusinessRules

def test_finance_rules_rejection():
    with pytest.raises(ValueError, match="finance compliance"):
        BusinessRules.validate("This is a Guaranteed Profit!", "finance")

def test_education_rules_rejection():
    with pytest.raises(ValueError, match="education compliance"):
        BusinessRules.validate("Get 100% placement with us", "education")

def test_recruitment_rules_rejection():
    with pytest.raises(ValueError, match="recruitment compliance"):
        BusinessRules.validate("Guaranteed job for you", "recruitment")

def test_real_estate_rules_rejection():
    with pytest.raises(ValueError, match="real estate compliance"):
        BusinessRules.validate("Guaranteed appreciation on this plot", "real_estate")

def test_generic_rules_pass():
    res = BusinessRules.validate("Guaranteed profit", "generic")
    assert res == "Guaranteed profit"

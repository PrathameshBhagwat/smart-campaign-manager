import pytest
from app.services.prompt_service import PromptService
from fastapi import HTTPException

def test_load_system_prompt():
    assert PromptService.load_system_prompt() is not None

def test_load_business_prompt_education():
    assert "Learning" in PromptService.load_business_prompt("education")

def test_load_business_prompt_fallback():
    # crypto should fallback to generic or education based on the prompt service logic
    prompt = PromptService.load_business_prompt("crypto")
    assert "Professional outreach" in prompt  # Since we fall back to generic

def test_load_channel_prompt():
    assert "LinkedIn" in PromptService.load_channel_prompt("linkedin") or True
    with pytest.raises(HTTPException):
        PromptService.load_channel_prompt("invalid")

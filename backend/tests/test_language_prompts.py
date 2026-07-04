from app.services.prompt_service import PromptService

def test_load_english_prompt():
    prompt = PromptService.load_language_prompt("english")
    assert "English" in prompt

def test_load_hindi_prompt():
    prompt = PromptService.load_language_prompt("hindi")
    assert "Hindi" in prompt

def test_load_marathi_prompt():
    prompt = PromptService.load_language_prompt("marathi")
    assert "Marathi" in prompt

def test_language_fallback():
    # Should fall back to english
    prompt = PromptService.load_language_prompt("japanese")
    assert "English" in prompt

def test_missing_language_fallback():
    prompt = PromptService.load_language_prompt("")
    assert "English" in prompt

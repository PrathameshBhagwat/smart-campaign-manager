import pytest
from app.services.ai_service import AIService
from app.core.config import settings

def test_detect_provider_groq(monkeypatch):
    monkeypatch.setattr(settings, "OPENAI_BASE_URL", "https://api.groq.com/openai/v1")
    assert AIService._detect_provider() == "groq"

def test_detect_provider_google(monkeypatch):
    monkeypatch.setattr(settings, "OPENAI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/openai/")
    assert AIService._detect_provider() == "google"

def test_detect_provider_openrouter(monkeypatch):
    monkeypatch.setattr(settings, "OPENAI_BASE_URL", "https://openrouter.ai/api/v1")
    assert AIService._detect_provider() == "openrouter"

def test_detect_provider_ollama(monkeypatch):
    monkeypatch.setattr(settings, "OPENAI_BASE_URL", "http://localhost:11434/v1")
    assert AIService._detect_provider() == "ollama"

def test_detect_provider_openai(monkeypatch):
    monkeypatch.setattr(settings, "OPENAI_BASE_URL", "https://api.openai.com/v1")
    assert AIService._detect_provider() == "openai"

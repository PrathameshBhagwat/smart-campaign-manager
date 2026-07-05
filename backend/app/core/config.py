from pydantic_settings import BaseSettings
from pydantic import field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Outreach Platform API"
    API_V1_STR: str = "/api/v1"
    BACKEND_CORS_ORIGINS: list[str] | str = ["*"]

    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str
    
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "llama-3.1-8b-instant"
    OPENAI_TEMPERATURE: float = 0.7
    OPENAI_MAX_TOKENS: int = 500
    OPENAI_TIMEOUT_SECONDS: int = 30
    OPENAI_MAX_DAILY_GENERATIONS: int = 100
    OPENAI_BASE_URL: str | None = "https://api.groq.com/openai/v1"
    PROMPT_VERSION: str = "v1"

    @field_validator('OPENAI_BASE_URL', mode='before')
    @classmethod
    def empty_str_to_none(cls, v):
        """Docker sets unset env vars to empty string — treat as None and use default."""
        if v == '' or v is None:
            return "https://api.groq.com/openai/v1"
        return v

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'

settings = Settings()

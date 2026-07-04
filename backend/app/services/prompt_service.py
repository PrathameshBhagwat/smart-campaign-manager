import os
from pathlib import Path
from fastapi import HTTPException

class PromptService:
    @staticmethod
    def _load_file(filename: str, subfolder: str = "") -> str:
        base_dir = Path(os.path.dirname(__file__)).parent / "prompts"
        if subfolder:
            prompt_path = base_dir / subfolder / filename
        else:
            prompt_path = base_dir / filename
            
        if not prompt_path.exists():
            raise HTTPException(status_code=500, detail=f"Prompt file {filename} not found in {subfolder or 'root'}.")
        with open(prompt_path, "r", encoding="utf-8") as f:
            return f.read()

    @staticmethod
    def load_system_prompt() -> str:
        return PromptService._load_file("system_prompt.txt")

    @staticmethod
    def load_business_prompt(business_type: str) -> str:
        if not business_type:
            business_type = "education"
            
        valid_types = ["education", "finance", "recruitment", "real_estate", "generic", "custom"]
        if business_type not in valid_types:
            business_type = "generic"
            
        return PromptService._load_file(f"{business_type}.txt", subfolder="business_types")

    @staticmethod
    def load_channel_prompt(channel: str) -> str:
        try:
            return PromptService._load_file(f"{channel}.txt", subfolder="channels")
        except HTTPException:
            raise HTTPException(status_code=400, detail=f"Unsupported channel for AI generation: {channel}")

    @staticmethod
    def load_language_prompt(language: str) -> str:
        if not language:
            language = "english"
            
        language = language.lower()
        valid_languages = ["english", "hindi", "marathi"]
        if language not in valid_languages:
            language = "english"
            
        return PromptService._load_file(f"{language}.txt", subfolder="languages")

    @staticmethod
    def build_complete_prompt(channel: str, business_type: str, language: str = "english", industry_notes: str = ""):
        system_prompt = PromptService.load_system_prompt()
        language_prompt = PromptService.load_language_prompt(language)
        business_prompt = PromptService.load_business_prompt(business_type)
        channel_prompt = PromptService.load_channel_prompt(channel)
        
        combined_system = f"{system_prompt}\n\n{language_prompt}\n\nBUSINESS RULES:\n{business_prompt}"
        
        if business_type == "custom" and industry_notes:
            # Enforce length limit on industry notes to prevent prompt injection or bloat
            safe_notes = industry_notes[:1000]
            combined_system += f"\n\nCUSTOM INDUSTRY NOTES:\n{safe_notes}"
            
        return combined_system, channel_prompt

import json
import os
from pathlib import Path

class PromptVersions:
    _versions = None

    @classmethod
    def _load_versions(cls):
        if cls._versions is None:
            try:
                path = Path(os.path.dirname(__file__)).parent / "prompts" / "versions.json"
                with open(path, "r", encoding="utf-8") as f:
                    cls._versions = json.load(f)
            except Exception:
                cls._versions = {}

    @classmethod
    def get_prompt_version(cls, business_type: str) -> str:
        cls._load_versions()
        return cls._versions.get(business_type, cls.get_default_prompt_version())

    @classmethod
    def get_default_prompt_version(cls) -> str:
        return "v1"

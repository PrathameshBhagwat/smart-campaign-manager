from app.utils.prompt_versions import PromptVersions

def test_get_prompt_version():
    assert PromptVersions.get_prompt_version("education") == "v1"
    assert PromptVersions.get_prompt_version("finance") == "v1"
    assert PromptVersions.get_prompt_version("generic") == "v1"
    assert PromptVersions.get_prompt_version("custom") == "v1"

def test_get_prompt_version_fallback():
    assert PromptVersions.get_prompt_version("unknown_type") == "v1"

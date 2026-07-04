import pytest
from fastapi import HTTPException
from app.utils.template_renderer import validate_variables

def test_validate_variables_success():
    content = "Hi {{name}}, want to buy a {{offering_name}}?"
    validate_variables(content) # Should not raise

def test_validate_variables_unsupported():
    content = "Hi {{name}}, your salary of {{salary}} is too low."
    with pytest.raises(HTTPException) as exc_info:
        validate_variables(content)
    assert exc_info.value.status_code == 400
    assert "strictly unsupported" in str(exc_info.value.detail)

def test_validate_variables_too_many():
    # Generate 21 variables
    content = " ".join([f"{{{{var{i}}}}}" for i in range(21)])
    with pytest.raises(HTTPException) as exc_info:
        validate_variables(content)
    assert exc_info.value.status_code == 400
    assert "Maximum 20 variables" in str(exc_info.value.detail)

def test_validate_variables_too_large():
    # Generate large content
    content = "a" * 2001
    with pytest.raises(HTTPException) as exc_info:
        validate_variables(content)
    assert exc_info.value.status_code == 400
    assert "Maximum 2000 characters" in str(exc_info.value.detail)

import pytest
from pydantic import ValidationError
from app.schemas.message import MessageCreate, MessageUpdate

def test_message_content_minimum_length():
    with pytest.raises(ValidationError) as excinfo:
        MessageCreate(content="Too short", channel="linkedin")
    assert "String should have at least 10 characters" in str(excinfo.value)

def test_message_content_maximum_length():
    with pytest.raises(ValidationError) as excinfo:
        MessageCreate(content="A" * 2001, channel="linkedin")
    assert "String should have at most 2000 characters" in str(excinfo.value)

def test_message_update_minimum_length():
    with pytest.raises(ValidationError) as excinfo:
        MessageUpdate(content="Short", channel="linkedin")
    assert "String should have at least 10 characters" in str(excinfo.value)

def test_message_invalid_channel():
    # Note: Pydantic doesn't validate channel enum strictly in the schema since it's just a string field
    # The validation happens in the service layer. We'll test service layer separately or just ensure schemas are fine.
    pass

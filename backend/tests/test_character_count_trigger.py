import pytest
import re

def calculate_character_count(content: str) -> int:
    """Python equivalent of the Postgres trigger logic for testing."""
    # Normalize repeated whitespace to a single space
    normalized = re.sub(r'\s+', ' ', content)
    # Trim leading and trailing spaces
    trimmed = normalized.strip()
    return len(trimmed)

def test_character_count_logic():
    # Input with leading/trailing spaces and multiple internal spaces
    input_text = " Hello     world "
    expected_count = 11
    
    assert calculate_character_count(input_text) == expected_count

def test_character_count_newlines():
    input_text = "Hello\n\n\nworld"
    expected_count = 11
    
    assert calculate_character_count(input_text) == expected_count

def test_character_count_empty():
    assert calculate_character_count("   ") == 0

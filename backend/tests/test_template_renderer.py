import pytest
from app.utils.template_renderer import extract_variables, render_template

def test_extract_variables():
    content = "Hello {{name}} from {{company}} in {{city}}"
    vars_found = extract_variables(content)
    assert set(vars_found) == {'name', 'company', 'city'}

def test_render_template_success():
    content = "Hello {{name}}, I saw you at {{company}}."
    data = {"name": "Alice", "company": "Acme Corp"}
    rendered = render_template(content, data)
    assert rendered == "Hello Alice, I saw you at Acme Corp."

def test_render_template_missing_variables_become_empty_strings():
    content = "Hello {{name}}, how is it at {{company}}?"
    data = {"name": "Bob"} # Missing company
    rendered = render_template(content, data)
    assert rendered == "Hello Bob, how is it at ?"

def test_render_template_case_insensitive_replace():
    content = "Hello {{NAME}}!"
    data = {"name": "Charlie"}
    rendered = render_template(content, data)
    assert rendered == "Hello Charlie!"

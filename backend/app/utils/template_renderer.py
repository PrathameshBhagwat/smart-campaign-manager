import re
from fastapi import HTTPException

ALLOWED_VARIABLES = {
    'name',
    'company',
    'city',
    'job_title',
    'offering_name',
    'campaign_name',
    'business_type'
}

UNSUPPORTED_VARIABLES = {
    'salary',
    'profit',
    'secret',
    'api_key'
}

def extract_variables(content: str) -> list[str]:
    # Extracts everything inside {{ }}
    return re.findall(r'\{\{(.*?)\}\}', content)

def validate_variables(content: str):
    if len(content) > 2000:
        raise HTTPException(status_code=400, detail="Template too large. Maximum 2000 characters allowed.")
        
    vars_found = extract_variables(content)
    if len(vars_found) > 20:
        raise HTTPException(status_code=400, detail="Maximum 20 variables allowed per template.")
        
    for var in vars_found:
        clean_var = var.strip().lower()
        if clean_var in UNSUPPORTED_VARIABLES:
            raise HTTPException(status_code=400, detail=f"Variable '{{{{{var}}}}}' is strictly unsupported for security reasons.")
            
def render_template(content: str, data: dict) -> str:
    validate_variables(content)
    rendered = content
    vars_found = set(extract_variables(content))
    
    # Render safely
    for var in vars_found:
        clean_var = var.strip().lower()
        # Missing values become empty strings
        val = str(data.get(clean_var, '') or '')
        # Replace case-insensitively for the exact placeholder block
        pattern = re.compile(re.escape(f"{{{{{var}}}}}"), re.IGNORECASE)
        rendered = pattern.sub(val, rendered)
        
    return rendered

def preview_template(content: str, data: dict) -> str:
    # Just an alias for render_template, can be extended for preview-specific logic
    return render_template(content, data)

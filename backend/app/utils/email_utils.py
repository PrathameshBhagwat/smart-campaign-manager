import urllib.parse

def build_mailto_link(email: str, subject: str = "", body: str = "") -> str:
    """
    Generate a safe mailto: link, ensuring character limits and correct URL encoding.
    """
    if not email or "@" not in str(email):
        return ""
        
    # Truncate body to 5000 chars to avoid browser limits
    safe_body = body[:5000] if body else ""
    safe_subject = subject or ""
    
    # URL Encode
    encoded_subject = urllib.parse.quote(safe_subject)
    encoded_body = urllib.parse.quote(safe_body)
    
    link = f"mailto:{email}"
    params = []
    
    if encoded_subject:
        params.append(f"subject={encoded_subject}")
    if encoded_body:
        params.append(f"body={encoded_body}")
        
    if params:
        link += "?" + "&".join(params)
        
    return link

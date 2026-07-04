import hashlib

def generate_prompt_hash(system_prompt: str, channel_prompt: str, sanitized_context: str) -> str:
    """
    Generate a SHA-256 hash representing the complete input given to the model.
    Never store the complete prompt to save space and protect PII, store the hash instead.
    """
    payload = f"{system_prompt}|{channel_prompt}|{sanitized_context}".encode('utf-8')
    return hashlib.sha256(payload).hexdigest()

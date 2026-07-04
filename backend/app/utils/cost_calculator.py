from typing import Optional
from app.utils.pricing import MODEL_PRICING

def calculate_cost(prompt_tokens: int, completion_tokens: int, model: str) -> float:
    """
    Calculate the estimated cost for an OpenAI API call based on token usage.
    Returns 0.0 if the model is not found in the pricing dictionary.
    """
    if model not in MODEL_PRICING:
        return 0.0
        
    pricing = MODEL_PRICING[model]
    
    input_cost = (prompt_tokens / 1_000_000) * pricing["input_per_million"]
    output_cost = (completion_tokens / 1_000_000) * pricing["output_per_million"]
    
    return round(input_cost + output_cost, 6)

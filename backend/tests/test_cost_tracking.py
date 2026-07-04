from app.utils.cost_calculator import calculate_cost
from app.utils.pricing import MODEL_PRICING

def test_calculate_cost_known_model():
    # Setup test pricing for standard tokens
    MODEL_PRICING["gpt-4o-mini"] = {
        "input_per_million": 0.15,
        "output_per_million": 0.60
    }
    
    cost = calculate_cost(1000000, 1000000, "gpt-4o-mini")
    assert cost == 0.75
    
    cost_small = calculate_cost(1000, 500, "gpt-4o-mini")
    # 1000 / 1M * 0.15 = 0.00015
    # 500 / 1M * 0.60 = 0.00030
    # Total = 0.00045
    assert cost_small == 0.00045

def test_calculate_cost_unknown_model():
    cost = calculate_cost(1000, 1000, "unknown-model")
    assert cost == 0.0

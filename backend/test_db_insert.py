from app.services.ai_service import AIService
from app.middleware.auth import get_supabase_client
import datetime

supabase = get_supabase_client()

try:
    print("Testing get_cached_message...")
    res = AIService.get_cached_message(supabase, "f5f94f73-4a78-4350-a6be-ff434eada5cb", "linkedin")
    print("Cached message result:", res)
except Exception as e:
    print("get_cached_message failed:", e)

try:
    print("Testing check_daily_limit...")
    AIService.check_daily_limit(supabase, "00000000-0000-0000-0000-000000000000")
    print("check_daily_limit success")
except Exception as e:
    print("check_daily_limit failed:", e)

try:
    print("Testing ai_usage insert...")
    usage_data = {
        "user_id": "00000000-0000-0000-0000-000000000000",
        "message_id": "b1115937-9cb6-4741-a9da-19a5cefc3bef",
        "model": "gpt-4o-mini",
        "prompt_version": "v1",
        "channel": "linkedin",
        "cache_hit": False,
        "input_tokens": 100,
        "output_tokens": 100,
        "estimated_cost_usd": 0.0001
    }
    res = supabase.table('ai_usage').insert(usage_data).execute()
    print("ai_usage insert success:", res.data)
except Exception as e:
    print("ai_usage insert failed:", e)


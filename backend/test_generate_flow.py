from app.services.ai_service import AIService
from app.middleware.auth import get_supabase_client
import sys

supabase = get_supabase_client()

# Fetch a valid contact_id and its campaign user_id
res = supabase.table('contacts').select('id, campaigns(user_id)').limit(1).execute()
if not res.data:
    print("No contacts found.")
    sys.exit(1)

contact_id = res.data[0]['id']
user_id = res.data[0]['campaigns']['user_id']
print(f"Using contact_id: {contact_id}, user_id: {user_id}")

try:
    print("Calling generate_message for email...")
    result = AIService.generate_message(contact_id, "email", user_id)
    print("Success:")
    print(result.model_dump_json(indent=2))
except Exception as e:
    import traceback
    print("Failed:")
    traceback.print_exc()

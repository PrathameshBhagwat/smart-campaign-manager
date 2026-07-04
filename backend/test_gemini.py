import traceback
from app.services.ai_service import AIService
from app.core.config import settings

print(f"Using Base URL: {settings.OPENAI_BASE_URL}")
print(f"Using Model: {settings.OPENAI_MODEL}")
print(f"API Key Starts With: {settings.OPENAI_API_KEY[:4]}...")

try:
    print("Calling generate_completion...")
    res = AIService.generate_completion("You are a helpful assistant.", "Say hello.")
    print("Success:", res.choices[0].message.content)
except Exception as e:
    print("Failed!")
    traceback.print_exc()

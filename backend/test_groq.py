import traceback
from openai import OpenAI
from app.core.config import settings

client = OpenAI(
    api_key=settings.OPENAI_API_KEY,
    base_url=settings.OPENAI_BASE_URL
)

print("Fetching available models...")
try:
    models = client.models.list()
    for m in models.data:
        print(m.id)
except Exception as e:
    print("Failed to fetch models:")
    traceback.print_exc()

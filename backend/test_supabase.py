from dotenv import load_dotenv
import os
from supabase import create_client, Client

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")

if not url or url == "paste_your_project_url_here":
    print("Error: SUPABASE_URL is not set properly.")
    exit(1)

if not key or key == "paste_your_service_role_key_here":
    print("Error: SUPABASE_SERVICE_KEY is not set properly.")
    exit(1)

try:
    supabase: Client = create_client(url, key)
    # Perform a simple query to verify the connection and that the schema was created
    result = supabase.table("campaigns").select("id").limit(1).execute()
    print("SUCCESS: Connected to Supabase!")
    print("SUCCESS: Verified 'campaigns' table exists in the database.")
except Exception as e:
    print(f"FAILED: Could not connect to Supabase or the 'campaigns' table is missing. Error: {e}")
    exit(1)

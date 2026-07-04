import asyncio
from app.services.analytics_service import get_supabase_client

supabase = get_supabase_client()
res = supabase.table('bulk_generation_jobs').select('*').in_('status', ['pending', 'processing']).execute()
print(f"Stuck jobs: {len(res.data)}")
for job in res.data:
    print(f"Job {job.get('id')}: status {job.get('status')}")

    # Auto fix: set them to cancelled or failed so we can create new ones
    supabase.table('bulk_generation_jobs').update({'status': 'cancelled'}).eq('id', job.get('id')).execute()
    print("Fixed stuck job.")

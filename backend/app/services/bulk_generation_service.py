import os
import uuid
import time
import math
from datetime import datetime, timezone
from fastapi import HTTPException, status
from app.middleware.auth import get_supabase_client
from app.services.ai_service import AIService
from app.core.config import settings
from typing import List

class BulkGenerationService:

    @staticmethod
    def _verify_campaign_ownership(supabase, campaign_id: str, user_id: str):
        res = supabase.table('campaigns').select('id').eq('id', campaign_id).eq('user_id', user_id).execute()
        if not res.data:
            raise HTTPException(status_code=403, detail="Campaign not found or access denied")

    @staticmethod
    def _verify_contacts_ownership(supabase, contact_ids: List[str], campaign_id: str):
        res = supabase.table('contacts').select('id').in_('id', contact_ids).eq('campaign_id', campaign_id).execute()
        valid_ids = {c['id'] for c in res.data}
        if len(valid_ids) != len(contact_ids):
            raise HTTPException(status_code=400, detail="One or more contacts are invalid or do not belong to this campaign")
        return res.data

    @staticmethod
    def _check_active_jobs(supabase, campaign_id: str):
        res = supabase.table('bulk_generation_jobs') \
            .select('id') \
            .eq('campaign_id', campaign_id) \
            .in_('status', ['pending', 'processing']) \
            .execute()
        if res.data:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"message": "Bulk generation already running."}
            )

    @staticmethod
    def _get_existing_messages(supabase, contact_ids: List[str], channel: str):
        res = supabase.table('messages') \
            .select('contact_id') \
            .eq('channel', channel) \
            .eq('generation_source', 'ai') \
            .eq('status', 'ready') \
            .eq('version', 1) \
            .in_('contact_id', contact_ids) \
            .execute()
        return {m['contact_id'] for m in res.data}

    @staticmethod
    def preview_job(campaign_id: str, contact_ids: List[str], channel: str, user_id: str):
        supabase = get_supabase_client()
        BulkGenerationService._verify_campaign_ownership(supabase, campaign_id, user_id)
        BulkGenerationService._verify_contacts_ownership(supabase, contact_ids, campaign_id)
        
        existing_contact_ids = BulkGenerationService._get_existing_messages(supabase, contact_ids, channel)
        to_generate_count = len(contact_ids) - len(existing_contact_ids)
        
        avg_cost_per_generation = 0.0003
        estimated_cost = to_generate_count * avg_cost_per_generation
        
        return {
            "total_selected": len(contact_ids),
            "already_generated": len(existing_contact_ids),
            "new_generations_required": to_generate_count,
            "estimated_cost_usd": estimated_cost
        }

    @staticmethod
    def create_job(campaign_id: str, contact_ids: List[str], channel: str, user_id: str):
        supabase = get_supabase_client()
        
        # 1. Ownership Validations
        BulkGenerationService._verify_campaign_ownership(supabase, campaign_id, user_id)
        BulkGenerationService._verify_contacts_ownership(supabase, contact_ids, campaign_id)
        
        # 2. Check active jobs
        BulkGenerationService._check_active_jobs(supabase, campaign_id)

        # 3. Smart Skip Logic (find how many actually need generation)
        existing_contact_ids = BulkGenerationService._get_existing_messages(supabase, contact_ids, channel)
        to_generate_ids = [cid for cid in contact_ids if cid not in existing_contact_ids]
        skipped_count = len(existing_contact_ids)
        to_generate_count = len(to_generate_ids)

        # 4. Daily Limit Check
        today = datetime.utcnow().strftime('%Y-%m-%d')
        usage_res = supabase.table('ai_usage').select('id', count='exact').eq('user_id', user_id).gte('generated_at', today).execute()
        generated_today = usage_res.count if usage_res.count is not None else 0
        remaining_quota = settings.OPENAI_MAX_DAILY_GENERATIONS - generated_today

        if to_generate_count > remaining_quota:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={"message": f"Cannot generate {to_generate_count} messages. Only {max(0, remaining_quota)} remaining today."}
            )

        # 5. Cost Estimation (Rough average assumption, e.g. 150 prompt + 150 completion tokens approx $0.0003 per generation)
        avg_cost_per_generation = 0.0003 
        estimated_cost = to_generate_count * avg_cost_per_generation

        job_id = str(uuid.uuid4())
        
        job_data = {
            "id": job_id,
            "user_id": user_id,
            "campaign_id": campaign_id,
            "channel": channel,
            "status": "pending",
            "total_contacts": len(contact_ids),
            "completed_contacts": 0,
            "failed_contacts": 0,
            "skipped_contacts": skipped_count, # we pre-calculate these, but will process them properly in the background
            "estimated_cost_usd": estimated_cost,
            "started_at": datetime.utcnow().isoformat()
        }

        # Reset skipped count here because the background task will iterate through ALL contacts and mark them skipped live for progress
        job_data["skipped_contacts"] = 0 
        
        supabase.table('bulk_generation_jobs').insert(job_data).execute()

        return job_id

    @staticmethod
    def process_job_background(job_id: str, campaign_id: str, contact_ids: List[str], channel: str, user_id: str):
        # We need a new isolated supabase client for the background thread without depending on request scope
        from supabase import create_client
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        
        try:
            # Mark processing
            supabase.table('bulk_generation_jobs').update({"status": "processing"}).eq('id', job_id).execute()
            
            # Fetch contact names for live UI tracking
            contacts_res = supabase.table('contacts').select('id, name').in_('id', contact_ids).execute()
            contact_names = {c['id']: c['name'] for c in contacts_res.data}

            completed = 0
            failed = 0
            skipped = 0
            total = len(contact_ids)

            total_generation_time_ms = 0
            generations_count = 0

            for cid in contact_ids:
                # Check if job was cancelled
                job_check = supabase.table('bulk_generation_jobs').select('status').eq('id', job_id).execute()
                if job_check.data and job_check.data[0]['status'] == 'cancelled':
                    break

                cname = contact_names.get(cid, "Unknown")
                
                # Update current contact
                progress_percent = math.floor(((completed + failed + skipped) / total) * 100)
                supabase.table('bulk_generation_jobs').update({
                    "current_contact_id": cid,
                    "current_contact_name": cname,
                    "progress_percentage": progress_percent
                }).eq('id', job_id).execute()

                # Process
                log_status = ""
                log_message = None

                # Check if existing message
                existing = supabase.table('messages').select('id').eq('contact_id', cid).eq('channel', channel).eq('generation_source', 'ai').eq('status', 'ready').eq('version', 1).execute()
                
                if existing.data:
                    skipped += 1
                    log_status = "skipped"
                else:
                    try:
                        # Throttle based on env BULK_GENERATION_DELAY_MS (default 500ms)
                        delay = float(os.getenv("BULK_GENERATION_DELAY_MS", "500")) / 1000.0
                        time.sleep(delay)
                        
                        start_t = time.time()
                        # Use existing service
                        AIService.generate_message(cid, channel, user_id)
                        elapsed_ms = int((time.time() - start_t) * 1000)
                        
                        total_generation_time_ms += elapsed_ms
                        generations_count += 1
                        
                        completed += 1
                        log_status = "generated"
                    except HTTPException as he:
                        failed += 1
                        log_status = "failed"
                        log_message = str(he.detail)
                    except Exception as e:
                        failed += 1
                        log_status = "failed"
                        log_message = str(e)

                # Update running counts
                progress_percent = math.floor(((completed + failed + skipped) / total) * 100)
                supabase.table('bulk_generation_jobs').update({
                    "completed_contacts": completed,
                    "failed_contacts": failed,
                    "skipped_contacts": skipped,
                    "progress_percentage": progress_percent
                }).eq('id', job_id).execute()

                # Log
                supabase.table('bulk_generation_job_logs').insert({
                    "id": str(uuid.uuid4()),
                    "job_id": job_id,
                    "contact_id": cid,
                    "status": log_status,
                    "message": log_message
                }).execute()

            # Finalize
            job_check = supabase.table('bulk_generation_jobs').select('status').eq('id', job_id).execute()
            if job_check.data and job_check.data[0]['status'] != 'cancelled':
                final_status = "completed" if (completed > 0 or skipped > 0) else ("failed" if failed == total else "completed")
                
                duration = int((datetime.utcnow() - datetime.fromisoformat(job_check.data[0]['started_at'] if 'started_at' in job_check.data[0] and job_check.data[0]['started_at'] else datetime.utcnow().isoformat())).total_seconds())

                avg_time = int(total_generation_time_ms / generations_count) if generations_count > 0 else None

                supabase.table('bulk_generation_jobs').update({
                    "status": final_status,
                    "progress_percentage": 100,
                    "completed_at": datetime.utcnow().isoformat(),
                    "average_generation_time_ms": avg_time,
                    "result_summary": {
                        "generated": completed,
                        "skipped": skipped,
                        "failed": failed,
                        "duration_seconds": max(duration, 0)
                    }
                }).eq('id', job_id).execute()

        except Exception as e:
            import logging
            logging.error(f"Bulk job {job_id} crashed: {e}")
            supabase.table('bulk_generation_jobs').update({
                "status": "failed",
                "completed_at": datetime.utcnow().isoformat(),
                "result_summary": {"error": str(e)}
            }).eq('id', job_id).execute()

    @staticmethod
    def get_job(job_id: str, user_id: str):
        supabase = get_supabase_client()
        res = supabase.table('bulk_generation_jobs').select('*').eq('id', job_id).eq('user_id', user_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Job not found")
        return res.data[0]

    @staticmethod
    def cancel_job(job_id: str, user_id: str):
        supabase = get_supabase_client()
        res = supabase.table('bulk_generation_jobs').select('status').eq('id', job_id).eq('user_id', user_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Job not found")
            
        if res.data[0]['status'] in ['pending', 'processing']:
            supabase.table('bulk_generation_jobs').update({
                "status": "cancelled",
                "completed_at": datetime.utcnow().isoformat()
            }).eq('id', job_id).execute()
        
        return {"status": "cancelled"}

    @staticmethod
    def get_active_job(campaign_id: str, user_id: str):
        supabase = get_supabase_client()
        res = supabase.table('bulk_generation_jobs') \
            .select('id, status') \
            .eq('campaign_id', campaign_id) \
            .eq('user_id', user_id) \
            .in_('status', ['pending', 'processing']) \
            .execute()
        
        if res.data:
            return res.data[0]
        return None

    @staticmethod
    def get_campaign_jobs(campaign_id: str, user_id: str):
        supabase = get_supabase_client()
        res = supabase.table('bulk_generation_jobs') \
            .select('*') \
            .eq('campaign_id', campaign_id) \
            .eq('user_id', user_id) \
            .order('created_at', desc=True) \
            .execute()
        return res.data

    @staticmethod
    def get_job_details(job_id: str, user_id: str):
        supabase = get_supabase_client()
        # Verify ownership
        job_res = supabase.table('bulk_generation_jobs').select('*').eq('id', job_id).eq('user_id', user_id).execute()
        if not job_res.data:
            raise HTTPException(status_code=404, detail="Job not found")
        
        job_summary = job_res.data[0]
        
        # Get logs joined with contact names (we'll fetch logs then contacts to join since supabase-py lacks easy deep joins in some cases)
        logs_res = supabase.table('bulk_generation_job_logs').select('*').eq('job_id', job_id).execute()
        
        if not logs_res.data:
            return {
                "summary": job_summary,
                "generated": [],
                "skipped": [],
                "failed": []
            }
            
        contact_ids = [log['contact_id'] for log in logs_res.data]
        contacts_res = supabase.table('contacts').select('id, name').in_('id', contact_ids).execute()
        contact_map = {c['id']: c['name'] for c in contacts_res.data}
        
        generated = []
        skipped = []
        failed = []
        
        for log in logs_res.data:
            detail = {
                "contact_id": log['contact_id'],
                "name": contact_map.get(log['contact_id'], "Unknown"),
                "status": log['status'],
                "message": log['message'],
                "created_at": log['created_at']
            }
            if log['status'] == 'generated':
                generated.append(detail)
            elif log['status'] == 'skipped':
                skipped.append(detail)
            elif log['status'] == 'failed':
                failed.append(detail)
                
        return {
            "summary": job_summary,
            "generated": generated,
            "skipped": skipped,
            "failed": failed
        }

    @staticmethod
    def retry_failed_contacts(job_id: str, user_id: str):
        supabase = get_supabase_client()
        # Verify ownership and get job to know campaign_id and channel
        job_res = supabase.table('bulk_generation_jobs').select('*').eq('id', job_id).eq('user_id', user_id).execute()
        if not job_res.data:
            raise HTTPException(status_code=404, detail="Job not found")
            
        job = job_res.data[0]
        campaign_id = job['campaign_id']
        channel = job['channel']
        
        # Get failed contacts
        logs_res = supabase.table('bulk_generation_job_logs').select('contact_id').eq('job_id', job_id).eq('status', 'failed').execute()
        
        if not logs_res.data:
            raise HTTPException(status_code=400, detail="No failed contacts found to retry")
            
        failed_contact_ids = [log['contact_id'] for log in logs_res.data]
        
        # Create a new job for these contacts
        new_job_id = BulkGenerationService.create_job(campaign_id, failed_contact_ids, channel, user_id)
        
        return {
            "job_id": new_job_id,
            "contact_ids": failed_contact_ids,
            "campaign_id": campaign_id,
            "channel": channel
        }

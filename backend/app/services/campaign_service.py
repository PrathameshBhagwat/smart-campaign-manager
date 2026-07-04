from typing import List, Optional
from fastapi import HTTPException, status
from app.schemas.campaign import CampaignCreate, CampaignUpdate, CampaignResponse
from app.middleware.auth import get_supabase_client

class CampaignService:
    @staticmethod
    def get_campaigns(user_id: str) -> List[CampaignResponse]:
        supabase = get_supabase_client()
        # RLS ensures we only fetch campaigns for the authenticated user
        result = supabase.table("campaigns").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return result.data

    @staticmethod
    def get_campaign(campaign_id: str, user_id: str) -> CampaignResponse:
        supabase = get_supabase_client()
        result = supabase.table("campaigns").select("*").eq("id", campaign_id).eq("user_id", user_id).execute()
        if not result.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
        return result.data[0]

    @staticmethod
    def create_campaign(campaign: CampaignCreate, user_id: str) -> CampaignResponse:
        supabase = get_supabase_client()
        data = campaign.model_dump()
        data["user_id"] = user_id
        
        result = supabase.table("campaigns").insert(data).execute()
        if not result.data:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create campaign")
        return result.data[0]

    @staticmethod
    def update_campaign(campaign_id: str, campaign_update: CampaignUpdate, user_id: str) -> CampaignResponse:
        supabase = get_supabase_client()
        
        # Check existence and ownership
        old_campaign = CampaignService.get_campaign(campaign_id, user_id)
        
        update_data = campaign_update.model_dump(exclude_unset=True)
        if not update_data:
            return old_campaign
            
        result = supabase.table("campaigns").update(update_data).eq("id", campaign_id).eq("user_id", user_id).execute()
        if not result.data:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update campaign")
            
        # Stale Message Detection (Improvement 9)
        # If course_name or description changed, mark existing ready messages as outdated
        if 'course_name' in update_data or 'description' in update_data:
            if update_data.get('course_name') != old_campaign.get('course_name') or \
               update_data.get('description') != old_campaign.get('description'):
                
                contacts_res = supabase.table('contacts').select('id').eq('campaign_id', campaign_id).execute()
                if contacts_res.data:
                    cids = [c['id'] for c in contacts_res.data]
                    # Update messages
                    supabase.table('messages') \
                        .update({"is_outdated": True}) \
                        .in_('contact_id', cids) \
                        .eq('generation_source', 'ai') \
                        .eq('status', 'ready') \
                        .execute()
                        
        return result.data[0]

    @staticmethod
    def get_ai_summary(campaign_id: str, user_id: str):
        supabase = get_supabase_client()
        CampaignService.get_campaign(campaign_id, user_id)
        
        contacts_res = supabase.table('contacts').select('id', count='exact').eq('campaign_id', campaign_id).execute()
        total_contacts = contacts_res.count if contacts_res.count is not None else 0
        
        if total_contacts == 0:
            return {
                "total_contacts": 0,
                "generated_messages": 0,
                "pending_generation": 0,
                "failed_generations": 0,
                "skipped_generations": 0,
                "estimated_cost_usd": 0.0,
                "channel_breakdown": {}
            }
            
        messages_res = supabase.table('messages').select('contact_id, channel, status, estimated_cost_usd, contacts!inner(campaign_id)').eq('contacts.campaign_id', campaign_id).eq('generation_source', 'ai').execute()
        
        generated = 0
        failed = 0
        total_cost = 0.0
        channels = {}
        distinct_ready_contacts = set()
        
        for m in messages_res.data:
            ch = m['channel']
            if ch not in channels:
                channels[ch] = {"generated": 0, "failed": 0, "cost": 0.0}
                
            if m['status'] == 'ready':
                generated += 1
                distinct_ready_contacts.add(m['contact_id'])
                channels[ch]["generated"] += 1
                cost = float(m.get('estimated_cost_usd') or 0.0)
                total_cost += cost
                channels[ch]["cost"] += cost
            elif m['status'] == 'failed':
                failed += 1
                channels[ch]["failed"] += 1

        pending = total_contacts - len(distinct_ready_contacts)

        return {
            "total_contacts": total_contacts,
            "generated_messages": generated,
            "pending_generation": max(0, pending),
            "failed_generations": failed,
            "skipped_generations": 0, # Difficult to calculate accurately without parsing logs, MVP uses 0 here
            "estimated_cost_usd": total_cost,
            "channel_breakdown": channels
        }

    @staticmethod
    def get_campaign_analytics(campaign_id: str, user_id: str):
        supabase = get_supabase_client()
        CampaignService.get_campaign(campaign_id, user_id)
        
        c_res = supabase.table('contacts').select('status', count='exact').eq('campaign_id', campaign_id).execute()
        imported = c_res.count if c_res.count is not None else 0
        contacts = c_res.data or []
        
        m_res = supabase.table('messages').select('status, contacts!inner(campaign_id)').eq('contacts.campaign_id', campaign_id).execute()
        msgs = m_res.data or []
        
        generated = sum(1 for m in msgs if m['status'] == 'ready')
        failed = sum(1 for m in msgs if m['status'] == 'failed')
        
        contacted = sum(1 for c in contacts if c['status'] == 'contacted')
        interested = sum(1 for c in contacts if c['status'] == 'interested')
        enrolled = sum(1 for c in contacts if c['status'] == 'enrolled')
        
        pending = imported - generated - failed
        
        from app.schemas.analytics import CampaignAnalytics
        return CampaignAnalytics(
            contacts_imported=imported,
            generated=generated,
            pending=max(0, pending),
            failed=failed,
            skipped=0,
            contacted=contacted,
            interested=interested,
            enrolled=enrolled
        )

    @staticmethod
    def delete_campaign(campaign_id: str, user_id: str) -> None:
        supabase = get_supabase_client()
        
        # Check existence and ownership
        CampaignService.get_campaign(campaign_id, user_id)
        
        result = supabase.table("campaigns").delete().eq("id", campaign_id).eq("user_id", user_id).execute()
        # Note: supabase-py delete() may return empty data on successful deletion if not using returning(), but no exception means success.

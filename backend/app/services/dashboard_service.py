from app.middleware.auth import get_supabase_client
from typing import List
from datetime import datetime
from app.schemas.dashboard import DashboardOverview, ActivityItem, TopCampaign, RecentCampaign

class DashboardService:
    @staticmethod
    def get_overview(user_id: str) -> DashboardOverview:
        supabase = get_supabase_client()
        
        campaigns_res = supabase.table('campaigns').select('id, name', count='exact').eq('user_id', user_id).execute()
        total_campaigns = campaigns_res.count if campaigns_res.count is not None else 0
        
        if total_campaigns == 0:
            return DashboardOverview(
                total_campaigns=0,
                total_contacts=0,
                total_messages=0,
                ai_messages=0,
                manual_messages=0,
                estimated_cost_usd=0.0,
                success_rate=0.0,
                active_jobs=0
            )

        cids = [c['id'] for c in campaigns_res.data]
        
        contacts_res = supabase.table('contacts').select('id', count='exact').in_('campaign_id', cids).execute()
        total_contacts = contacts_res.count if contacts_res.count is not None else 0
        
        # Optimize by not loading all messages data into memory, but we need cost
        # Wait, if cids is up to thousands? campaigns are usually tens or hundreds. 
        # Optimize by not loading all messages data into memory, but we need cost and quality
        messages_res = supabase.table('messages').select('id, generation_source, status, estimated_cost_usd, quality_label, contacts!inner(campaign_id)').in_('contacts.campaign_id', cids).execute()
        
        messages = messages_res.data or []
        total_messages = len(messages)
        ai_messages = 0
        manual_messages = 0
        cost = 0.0
        successful_ai = 0
        failed_ai = 0
        quality_counts = {'excellent': 0, 'good': 0, 'needs_review': 0}
        total_quality_scored = 0

        for m in messages:
            if m.get('generation_source') == 'ai':
                ai_messages += 1
                cost += float(m.get('estimated_cost_usd') or 0.0)
                if m.get('status') == 'ready':
                    successful_ai += 1
                elif m.get('status') == 'failed':
                    failed_ai += 1
                    
                ql = m.get('quality_label')
                if ql in quality_counts:
                    quality_counts[ql] += 1
                    total_quality_scored += 1
            else:
                manual_messages += 1
                
        success_rate = 0.0
        total_ai_processed = successful_ai + failed_ai
        if total_ai_processed > 0:
            success_rate = round((successful_ai / total_ai_processed) * 100, 1)
            
        jobs_res = supabase.table('bulk_generation_jobs').select('id', count='exact').eq('user_id', user_id).in_('status', ['pending', 'processing']).execute()
        active_jobs = jobs_res.count if jobs_res.count is not None else 0

        # Business Type Analytics
        business_breakdown = {}
        if campaigns_res.data:
            cids_for_bt = [c['id'] for c in campaigns_res.data]
            msgs_for_bt = supabase.table('messages').select('generation_source, contacts!inner(campaign_id)').in_('contacts.campaign_id', cids_for_bt).eq('generation_source', 'ai').execute()
            
            # Since campaigns_res.data might not have business_type selected, we should re-fetch or add it to the initial select
            # The initial select was 'id, name'. Let's fetch the business_type for these cids separately or assume we'll update the initial select
            camps_bt_res = supabase.table('campaigns').select('id, business_type').in_('id', cids_for_bt).execute()
            campaigns_dict = {c['id']: c.get('business_type', 'education') for c in (camps_bt_res.data or [])}
            
            for m in msgs_for_bt.data or []:
                cid = m.get('contacts', {}).get('campaign_id')
                bt = campaigns_dict.get(cid, 'education')
                business_breakdown[bt] = business_breakdown.get(bt, 0) + 1
                
        # Quality Distribution calculation
        quality_distribution = {'excellent': 0.0, 'good': 0.0, 'needs_review': 0.0}
        if total_quality_scored > 0:
            for k, v in quality_counts.items():
                quality_distribution[k] = round((v / total_quality_scored) * 100, 1)
                
        # Most Used Templates
        templates_res = supabase.table('message_templates').select('id, name, usage_count').eq('user_id', user_id).order('usage_count', desc=True).limit(5).execute()
        most_used_templates = []
        for t in templates_res.data or []:
            most_used_templates.append({
                "id": str(t['id']),
                "name": t['name'],
                "usage_count": str(t['usage_count'])
            })

        return DashboardOverview(
            total_campaigns=total_campaigns,
            total_contacts=total_contacts,
            total_messages=total_messages,
            ai_messages=ai_messages,
            manual_messages=manual_messages,
            estimated_cost_usd=round(cost, 2),
            success_rate=success_rate,
            active_jobs=active_jobs,
            business_type_breakdown=business_breakdown,
            quality_distribution=quality_distribution,
            most_used_templates=most_used_templates
        )

    @staticmethod
    def get_recent_activity(user_id: str, limit: int = 20, offset: int = 0) -> List[ActivityItem]:
        supabase = get_supabase_client()
        # To merge activities, we fetch recent events from different tables, combine, sort and slice.
        # This is a read-only aggregation.
        activities = []
        
        # 1. Recent bulk jobs
        jobs = supabase.table('bulk_generation_jobs').select('status, total_contacts, started_at, created_at').eq('user_id', user_id).order('created_at', desc=True).limit(limit).execute()
        for j in (jobs.data or []):
            time_str = j.get('started_at') or j.get('created_at')
            if time_str:
                activities.append({
                    "type": "bulk_generation",
                    "message": f"Bulk job ({j['status']}) for {j['total_contacts']} contacts",
                    "created_at": time_str
                })
                
        # 2. Recent imports
        camps = supabase.table('campaigns').select('id').eq('user_id', user_id).execute()
        if camps.data:
            cids = [c['id'] for c in camps.data]
            imports = supabase.table('imports').select('status, imported_count, created_at').in_('campaign_id', cids).order('created_at', desc=True).limit(limit).execute()
            for imp in (imports.data or []):
                time_str = imp.get('created_at')
                if time_str:
                    activities.append({
                        "type": "import",
                        "message": f"Imported {imp.get('imported_count', 0)} contacts ({imp['status']})",
                        "created_at": time_str
                    })
        
        # 3. Recent single AI generations (from messages directly)
        if camps.data:
            msgs = supabase.table('messages').select('created_at, channel, contacts!inner(campaign_id)').in_('contacts.campaign_id', cids).eq('generation_source', 'ai').order('created_at', desc=True).limit(limit).execute()
            for m in (msgs.data or []):
                time_str = m.get('created_at')
                if time_str:
                    activities.append({
                        "type": "generation",
                        "message": f"Generated 1 AI message for {m.get('channel', 'unknown')}",
                        "created_at": time_str
                    })
                    
        # Sort desc by created_at
        activities.sort(key=lambda x: x['created_at'], reverse=True)
        
        # Slice
        paged = activities[offset:offset+limit]
        return [ActivityItem(**a) for a in paged]

    @staticmethod
    def get_top_campaigns(user_id: str) -> List[TopCampaign]:
        supabase = get_supabase_client()
        campaigns_res = supabase.table('campaigns').select('id, name').eq('user_id', user_id).execute()
        campaigns = campaigns_res.data or []
        if not campaigns:
            return []
            
        top_list = []
        for c in campaigns:
            cid = c['id']
            # count contacts
            c_res = supabase.table('contacts').select('id', count='exact').eq('campaign_id', cid).execute()
            contact_count = c_res.count if c_res.count is not None else 0
            
            # messages and cost
            m_res = supabase.table('messages').select('estimated_cost_usd, contacts!inner(campaign_id)').eq('contacts.campaign_id', cid).execute()
            msg_count = len(m_res.data or [])
            cost = sum(float(m.get('estimated_cost_usd') or 0.0) for m in (m_res.data or []))
            
            top_list.append(TopCampaign(
                campaign_name=c['name'],
                contacts=contact_count,
                messages=msg_count,
                cost=round(cost, 2)
            ))
            
        top_list.sort(key=lambda x: x.messages, reverse=True)
        return top_list[:10]

    @staticmethod
    def get_recent_campaigns(user_id: str) -> List[RecentCampaign]:
        supabase = get_supabase_client()
        try:
            campaigns_res = supabase.table('campaigns').select('id, name, created_at, updated_at').eq('user_id', user_id).order('created_at', desc=True).limit(5).execute()
            campaigns = campaigns_res.data or []
            if not campaigns:
                return []
                
            recent = []
            for c in campaigns:
                t = c.get('updated_at') or c.get('created_at') or datetime.utcnow().isoformat()
                recent.append({
                    "id": str(c['id']),
                    "name": c.get('name', 'Untitled Campaign'),
                    "last_activity": t
                })
                
            return [RecentCampaign(**r) for r in recent]
        except Exception as e:
            import logging
            logging.error(f"Error fetching recent campaigns: {e}")
            return []

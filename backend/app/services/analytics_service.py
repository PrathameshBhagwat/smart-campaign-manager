from typing import Dict, List
from datetime import datetime, timedelta
from app.middleware.auth import get_supabase_client
from app.schemas.analytics import (
    AIAnalyticsResponse, DailyGeneration, ChannelAnalytics, 
    ProviderAnalytics, CostAnalytics, QualityAnalytics, BulkAnalytics
)

class AnalyticsService:
    @staticmethod
    def _fetch_all_ai_messages(supabase, user_id: str):
        # Join campaigns to filter by user_id
        # Supabase Python client limits to 1000 rows by default. For MVP without RPCs, 
        # we iterate to fetch all if needed, but wait: we can just fetch campaigns -> contacts -> messages
        campaigns_res = supabase.table('campaigns').select('id').eq('user_id', user_id).execute()
        if not campaigns_res.data:
            return []
        
        cids = [c['id'] for c in campaigns_res.data]
        
        # We can't fetch tens of thousands safely in one go with PostgREST without pagination.
        # But we can try to fetch the columns we need efficiently.
        # To avoid the URL length error, we can loop over cids in batches of 50.
        messages = []
        batch_size = 50
        for i in range(0, len(cids), batch_size):
            batch_cids = cids[i:i+batch_size]
            res = supabase.table('messages').select(
                'channel, status, estimated_cost_usd, ai_quality_score, ai_provider, generation_duration_ms, contacts!inner(campaign_id)'
            ).in_('contacts.campaign_id', batch_cids).eq('generation_source', 'ai').execute()
            messages.extend(res.data or [])
        return messages

    @staticmethod
    def get_ai_analytics(user_id: str) -> AIAnalyticsResponse:
        # Backward compatibility for the older AI overview
        supabase = get_supabase_client()
        result = supabase.table('ai_usage').select('*').eq('user_id', user_id).execute()
        records = result.data or []
        
        total_generations = len(records)
        if total_generations == 0:
            return AIAnalyticsResponse(
                total_generations=0, cache_hits=0, cache_hit_rate=0.0, success_rate=0.0,
                estimated_cost=0.0, avg_cost_per_generation=0.0, avg_generation_time_ms=0,
                most_used_channel="None", provider_breakdown={}, channel_breakdown={}, daily_generations=[]
            )
            
        cache_hits = sum(1 for r in records if r.get('cache_hit'))
        estimated_cost = sum(r.get('estimated_cost_usd', 0) for r in records)
        successful = sum(1 for r in records if r.get('messages', {}) and r.get('messages', {}).get('status') == 'ready')
        total_duration = sum(r.get('messages', {}).get('generation_duration_ms', 0) for r in records if r.get('messages'))
        
        channels = {}
        provider_breakdown = {}
        daily_counts = {}
        for r in records:
            ch = r.get('channel')
            if ch:
                channels[ch] = channels.get(ch, 0) + 1
            prov = r.get('messages', {}).get('ai_provider')
            if prov:
                provider_breakdown[prov] = provider_breakdown.get(prov, 0) + 1
            dt = r.get('generated_at')
            if dt:
                date_str = dt[:10]
                daily_counts[date_str] = daily_counts.get(date_str, 0) + 1
                
        most_used_channel = max(channels, key=channels.get).capitalize() if channels else "None"
        daily_generations = [{"date": k, "count": v} for k, v in sorted(daily_counts.items())]
        
        # Fast path
        return AIAnalyticsResponse(
            total_generations=total_generations,
            cache_hits=cache_hits,
            cache_hit_rate=round((cache_hits / total_generations) * 100, 1),
            success_rate=round((successful / total_generations) * 100, 1) if total_generations > 0 else 0.0,
            estimated_cost=round(estimated_cost, 4),
            avg_cost_per_generation=round(estimated_cost / total_generations, 6),
            avg_generation_time_ms=int(total_duration / total_generations) if total_generations > 0 else 0,
            most_used_channel=most_used_channel,
            provider_breakdown=provider_breakdown,
            channel_breakdown=channels,
            daily_generations=daily_generations
        )

    @staticmethod
    def get_channel_analytics(user_id: str) -> Dict[str, ChannelAnalytics]:
        supabase = get_supabase_client()
        messages = AnalyticsService._fetch_all_ai_messages(supabase, user_id)
        
        channels = {}
        for m in messages:
            ch = m.get('channel', 'unknown')
            if ch not in channels:
                channels[ch] = {"generated": 0, "cost": 0.0, "successful": 0, "total": 0}
            
            channels[ch]["total"] += 1
            if m.get('status') == 'ready':
                channels[ch]["successful"] += 1
                channels[ch]["generated"] += 1
            
            channels[ch]["cost"] += float(m.get('estimated_cost_usd') or 0.0)
            
        # Format response, ensuring default channels exist
        res = {
            "linkedin": ChannelAnalytics(generated=0, cost=0.0, success_rate=0.0),
            "email": ChannelAnalytics(generated=0, cost=0.0, success_rate=0.0),
            "whatsapp": ChannelAnalytics(generated=0, cost=0.0, success_rate=0.0)
        }
        
        for ch, data in channels.items():
            if ch not in res:
                res[ch] = ChannelAnalytics(generated=0, cost=0.0, success_rate=0.0)
                
            res[ch].generated = data["generated"]
            res[ch].cost = round(data["cost"], 4)
            res[ch].success_rate = round((data["successful"] / data["total"] * 100), 1) if data["total"] > 0 else 0.0
            
        return res

    @staticmethod
    def get_provider_analytics(user_id: str) -> Dict[str, ProviderAnalytics]:
        supabase = get_supabase_client()
        messages = AnalyticsService._fetch_all_ai_messages(supabase, user_id)
        
        providers = {}
        for m in messages:
            if m.get('status') != 'ready':
                continue
            prov = m.get('ai_provider') or 'unknown'
            if prov not in providers:
                providers[prov] = {"messages": 0, "duration_sum": 0}
                
            providers[prov]["messages"] += 1
            providers[prov]["duration_sum"] += int(m.get('generation_duration_ms') or 0)
            
        res = {}
        for prov, data in providers.items():
            avg_ms = int(data["duration_sum"] / data["messages"]) if data["messages"] > 0 else 0
            res[prov] = ProviderAnalytics(messages=data["messages"], avg_generation_ms=avg_ms)
            
        if not res:
            res["unknown"] = ProviderAnalytics(messages=0, avg_generation_ms=0)
            
        return res

    @staticmethod
    def get_cost_analytics(user_id: str) -> CostAnalytics:
        supabase = get_supabase_client()
        # For cost, ai_usage table is smaller and perfect
        res = supabase.table('ai_usage').select('estimated_cost_usd, generated_at').eq('user_id', user_id).execute()
        records = res.data or []
        
        now = datetime.utcnow()
        today = now.date()
        week_ago = (now - timedelta(days=7)).date()
        month_ago = (now - timedelta(days=30)).date()
        
        cost_today = 0.0
        cost_week = 0.0
        cost_month = 0.0
        cost_all = 0.0
        
        for r in records:
            c = float(r.get('estimated_cost_usd') or 0.0)
            cost_all += c
            
            gen_str = r.get('generated_at')
            if gen_str:
                d = datetime.fromisoformat(gen_str.replace('Z', '+00:00')).date()
                if d == today:
                    cost_today += c
                if d >= week_ago:
                    cost_week += c
                if d >= month_ago:
                    cost_month += c
                    
        return CostAnalytics(
            today=round(cost_today, 4),
            week=round(cost_week, 4),
            month=round(cost_month, 4),
            all_time=round(cost_all, 4)
        )

    @staticmethod
    def get_quality_analytics(user_id: str) -> QualityAnalytics:
        supabase = get_supabase_client()
        messages = AnalyticsService._fetch_all_ai_messages(supabase, user_id)
        
        exc = 0
        good = 0
        needs = 0
        
        for m in messages:
            if m.get('status') != 'ready':
                continue
            score = m.get('ai_quality_score')
            if score is None:
                good += 1 # default
            elif score >= 90:
                exc += 1
            elif score >= 70:
                good += 1
            else:
                needs += 1
                
        return QualityAnalytics(excellent=exc, good=good, needs_review=needs)

    @staticmethod
    def get_bulk_analytics(user_id: str) -> BulkAnalytics:
        supabase = get_supabase_client()
        res = supabase.table('bulk_generation_jobs').select('status, started_at, completed_at').eq('user_id', user_id).execute()
        jobs = res.data or []
        
        total = len(jobs)
        completed = 0
        failed = 0
        cancelled = 0
        duration_sum = 0
        dur_count = 0
        
        for j in jobs:
            st = j.get('status')
            if st == 'completed':
                completed += 1
            elif st == 'failed':
                failed += 1
            elif st == 'cancelled':
                cancelled += 1
                
            start_str = j.get('started_at')
            end_str = j.get('completed_at')
            if start_str and end_str:
                # Calculate duration
                start = datetime.fromisoformat(start_str.replace('Z', '+00:00'))
                end = datetime.fromisoformat(end_str.replace('Z', '+00:00'))
                duration_sum += int((end - start).total_seconds())
                dur_count += 1
                
        avg_dur = int(duration_sum / dur_count) if dur_count > 0 else 0
        
        return BulkAnalytics(
            total_jobs=total,
            completed=completed,
            failed=failed,
            cancelled=cancelled,
            average_duration_seconds=avg_dur
        )

    @staticmethod
    def get_generation_trends(user_id: str, days: int) -> List[DailyGeneration]:
        supabase = get_supabase_client()
        # Use ai_usage
        res = supabase.table('ai_usage').select('generated_at').eq('user_id', user_id).execute()
        records = res.data or []
        
        now = datetime.utcnow()
        cutoff = (now - timedelta(days=days-1)).date()
        
        counts = {}
        for i in range(days):
            d = (now - timedelta(days=i)).strftime('%Y-%m-%d')
            counts[d] = 0
            
        for r in records:
            gen_str = r.get('generated_at')
            if gen_str:
                d = gen_str[:10]
                if d in counts:
                    counts[d] += 1
                    
        return [DailyGeneration(date=k, count=v) for k, v in sorted(counts.items())]

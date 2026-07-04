from pydantic import BaseModel
from typing import Dict, List

class DailyGeneration(BaseModel):
    date: str
    count: int

class AIAnalyticsResponse(BaseModel):
    total_generations: int
    cache_hits: int
    cache_hit_rate: float
    success_rate: float
    estimated_cost: float
    avg_cost_per_generation: float
    avg_generation_time_ms: int
    most_used_channel: str
    provider_breakdown: Dict[str, int]
    channel_breakdown: Dict[str, int]
    daily_generations: List[DailyGeneration]

class ChannelAnalytics(BaseModel):
    generated: int
    cost: float
    success_rate: float

class ProviderAnalytics(BaseModel):
    messages: int
    avg_generation_ms: int

class CostAnalytics(BaseModel):
    today: float
    week: float
    month: float
    all_time: float

class QualityAnalytics(BaseModel):
    excellent: int
    good: int
    needs_review: int

class BulkAnalytics(BaseModel):
    total_jobs: int
    completed: int
    failed: int
    cancelled: int
    average_duration_seconds: int

class CampaignAnalytics(BaseModel):
    contacts_imported: int
    generated: int
    pending: int
    failed: int
    skipped: int
    contacted: int
    interested: int
    enrolled: int

from fastapi import APIRouter, Depends, Query
from typing import Dict, List
from app.services.analytics_service import AnalyticsService
from app.schemas.analytics import (
    AIAnalyticsResponse, ChannelAnalytics, ProviderAnalytics, 
    CostAnalytics, QualityAnalytics, BulkAnalytics, DailyGeneration
)
from app.middleware.auth import get_current_user

router = APIRouter()

@router.get("/ai", response_model=AIAnalyticsResponse)
def get_ai_analytics(user_id: str = Depends(get_current_user)):
    return AnalyticsService.get_ai_analytics(user_id)

@router.get("/channels", response_model=Dict[str, ChannelAnalytics])
def get_channel_analytics(user_id: str = Depends(get_current_user)):
    return AnalyticsService.get_channel_analytics(user_id)

@router.get("/providers", response_model=Dict[str, ProviderAnalytics])
def get_provider_analytics(user_id: str = Depends(get_current_user)):
    return AnalyticsService.get_provider_analytics(user_id)

@router.get("/costs", response_model=CostAnalytics)
def get_cost_analytics(user_id: str = Depends(get_current_user)):
    return AnalyticsService.get_cost_analytics(user_id)

@router.get("/quality", response_model=QualityAnalytics)
def get_quality_analytics(user_id: str = Depends(get_current_user)):
    return AnalyticsService.get_quality_analytics(user_id)

@router.get("/bulk-jobs", response_model=BulkAnalytics)
def get_bulk_analytics(user_id: str = Depends(get_current_user)):
    return AnalyticsService.get_bulk_analytics(user_id)

@router.get("/trends", response_model=List[DailyGeneration])
def get_generation_trends(days: int = Query(30, ge=1, le=365), user_id: str = Depends(get_current_user)):
    return AnalyticsService.get_generation_trends(user_id, days)

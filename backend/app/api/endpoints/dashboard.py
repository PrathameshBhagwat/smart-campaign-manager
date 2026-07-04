from fastapi import APIRouter, Depends, Query
from typing import List
from app.services.dashboard_service import DashboardService
from app.schemas.dashboard import DashboardOverview, ActivityItem, TopCampaign, RecentCampaign
from app.middleware.auth import get_current_user

router = APIRouter()

@router.get("/overview", response_model=DashboardOverview)
def get_overview(user_id: str = Depends(get_current_user)):
    return DashboardService.get_overview(user_id)

@router.get("/activity", response_model=List[ActivityItem])
def get_activity(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user_id: str = Depends(get_current_user)
):
    return DashboardService.get_recent_activity(user_id, limit, offset)

@router.get("/top-campaigns", response_model=List[TopCampaign])
def get_top_campaigns(user_id: str = Depends(get_current_user)):
    return DashboardService.get_top_campaigns(user_id)

@router.get("/recent-campaigns", response_model=List[RecentCampaign])
def get_recent_campaigns(user_id: str = Depends(get_current_user)):
    return DashboardService.get_recent_campaigns(user_id)

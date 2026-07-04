from fastapi import APIRouter, Depends, status
from typing import List
from app.schemas.campaign import CampaignCreate, CampaignUpdate, CampaignResponse
from app.services.campaign_service import CampaignService
from app.middleware.auth import get_current_user

router = APIRouter()

@router.get("", response_model=List[CampaignResponse])
def get_campaigns(user_id: str = Depends(get_current_user)):
    return CampaignService.get_campaigns(user_id)

@router.get("/{campaign_id}", response_model=CampaignResponse)
def get_campaign(campaign_id: str, user_id: str = Depends(get_current_user)):
    return CampaignService.get_campaign(campaign_id, user_id)

@router.get("/{campaign_id}/ai-summary")
def get_campaign_ai_summary(campaign_id: str, user_id: str = Depends(get_current_user)):
    return CampaignService.get_ai_summary(campaign_id, user_id)

from app.schemas.analytics import CampaignAnalytics

@router.get("/{campaign_id}/analytics", response_model=CampaignAnalytics)
def get_campaign_analytics(campaign_id: str, user_id: str = Depends(get_current_user)):
    return CampaignService.get_campaign_analytics(campaign_id, user_id)

@router.post("", response_model=CampaignResponse, status_code=status.HTTP_201_CREATED)
def create_campaign(campaign: CampaignCreate, user_id: str = Depends(get_current_user)):
    return CampaignService.create_campaign(campaign, user_id)

@router.put("/{campaign_id}", response_model=CampaignResponse)
def update_campaign(campaign_id: str, campaign: CampaignUpdate, user_id: str = Depends(get_current_user)):
    return CampaignService.update_campaign(campaign_id, campaign, user_id)

@router.delete("/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_campaign(campaign_id: str, user_id: str = Depends(get_current_user)):
    CampaignService.delete_campaign(campaign_id, user_id)
    return None

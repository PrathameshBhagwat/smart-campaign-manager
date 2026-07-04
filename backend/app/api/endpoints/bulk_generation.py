from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from typing import Dict, Any, Optional
from pydantic import BaseModel

from app.schemas.bulk_generation import BulkGenerateRequest, BulkJobResponse, BulkJobProgressResponse, BulkJobPreviewResponse
from app.services.bulk_generation_service import BulkGenerationService
from app.middleware.auth import get_current_user

router = APIRouter()

@router.post("/campaigns/{campaign_id}/bulk-preview", response_model=BulkJobPreviewResponse)
def preview_bulk_job(
    campaign_id: str,
    request: BulkGenerateRequest,
    user_id: str = Depends(get_current_user)
):
    return BulkGenerationService.preview_job(
        campaign_id=campaign_id,
        contact_ids=[str(cid) for cid in request.contact_ids],
        channel=request.channel,
        user_id=user_id
    )

@router.post("/campaigns/{campaign_id}/bulk-generate", response_model=BulkJobResponse)
def create_bulk_job(
    campaign_id: str,
    request: BulkGenerateRequest,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user)
):
    job_id = BulkGenerationService.create_job(
        campaign_id=campaign_id,
        contact_ids=[str(cid) for cid in request.contact_ids],
        channel=request.channel,
        user_id=user_id
    )
    
    background_tasks.add_task(
        BulkGenerationService.process_job_background,
        job_id=job_id,
        campaign_id=campaign_id,
        contact_ids=[str(cid) for cid in request.contact_ids],
        channel=request.channel,
        user_id=user_id
    )
    
    return {"job_id": job_id, "status": "pending"}

@router.get("/bulk-jobs/{job_id}", response_model=BulkJobProgressResponse)
def get_job_progress(job_id: str, user_id: str = Depends(get_current_user)):
    job = BulkGenerationService.get_job(job_id, user_id)
    return job

@router.post("/bulk-jobs/{job_id}/cancel")
def cancel_job(job_id: str, user_id: str = Depends(get_current_user)):
    return BulkGenerationService.cancel_job(job_id, user_id)

@router.get("/campaigns/{campaign_id}/active-job")
def get_active_job(campaign_id: str, user_id: str = Depends(get_current_user)):
    job = BulkGenerationService.get_active_job(campaign_id, user_id)
    if job:
        return {"job_id": job['id'], "status": job['status']}
    return {"job_id": None, "status": None}

@router.get("/campaigns/{campaign_id}/bulk-jobs")
def get_campaign_jobs(campaign_id: str, user_id: str = Depends(get_current_user)):
    return {"jobs": BulkGenerationService.get_campaign_jobs(campaign_id, user_id)}

@router.get("/bulk-jobs/{job_id}/details")
def get_job_details(job_id: str, user_id: str = Depends(get_current_user)):
    return BulkGenerationService.get_job_details(job_id, user_id)

@router.post("/bulk-jobs/{job_id}/retry")
def retry_failed_contacts(
    job_id: str, 
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user)
):
    retry_data = BulkGenerationService.retry_failed_contacts(job_id, user_id)
    
    background_tasks.add_task(
        BulkGenerationService.process_job_background,
        job_id=retry_data['job_id'],
        campaign_id=retry_data['campaign_id'],
        contact_ids=retry_data['contact_ids'],
        channel=retry_data['channel'],
        user_id=user_id
    )
    
    return {"job_id": retry_data['job_id'], "status": "pending"}

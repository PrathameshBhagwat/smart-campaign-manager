from fastapi import APIRouter, Depends
from app.middleware.auth import get_current_user
from app.schemas.template import TemplateCreate, TemplateUpdate, TemplateResponse, TemplateListResponse, TemplatePreviewRequest, TemplatePreviewResponse
from app.services.template_service import TemplateService
from app.utils.template_renderer import preview_template

router = APIRouter()

@router.post("", response_model=TemplateResponse)
def create_template(data: TemplateCreate, user_id: str = Depends(get_current_user)):
    return TemplateService.create_template(user_id, data)

@router.get("", response_model=TemplateListResponse)
def get_templates(user_id: str = Depends(get_current_user)):
    return TemplateService.get_templates(user_id)

@router.patch("/{template_id}", response_model=TemplateResponse)
def update_template(template_id: str, data: TemplateUpdate, user_id: str = Depends(get_current_user)):
    return TemplateService.update_template(user_id, template_id, data)

@router.delete("/{template_id}")
def delete_template(template_id: str, user_id: str = Depends(get_current_user)):
    return TemplateService.delete_template(user_id, template_id)

@router.post("/{template_id}/duplicate", response_model=TemplateResponse)
def duplicate_template(template_id: str, user_id: str = Depends(get_current_user)):
    return TemplateService.duplicate_template(user_id, template_id)

@router.post("/preview", response_model=TemplatePreviewResponse)
def preview(data: TemplatePreviewRequest, user_id: str = Depends(get_current_user)):
    rendered = preview_template(data.content, data.variables)
    return TemplatePreviewResponse(rendered_content=rendered)

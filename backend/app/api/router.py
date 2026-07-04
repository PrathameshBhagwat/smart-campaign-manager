from fastapi import APIRouter
from app.api.endpoints import campaigns, contacts, messages, analytics, bulk_generation, dashboard, templates

api_router = APIRouter()
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(campaigns.router, prefix="/campaigns", tags=["campaigns"])
api_router.include_router(contacts.router, tags=["contacts"])
api_router.include_router(messages.router, tags=["messages"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(bulk_generation.router, tags=["bulk_generation"])
api_router.include_router(templates.router, prefix="/templates", tags=["templates"])

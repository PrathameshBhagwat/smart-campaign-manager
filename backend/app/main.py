from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.exceptions import RequestValidationError
import postgrest.exceptions

from app.api.router import api_router
from app.core.config import settings
from app.middleware.request_id import RequestTracingMiddleware
from app.middleware.error_handler import custom_exception_handler
from app.core.exceptions import APIException
import json

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Exception handlers
app.add_exception_handler(Exception, custom_exception_handler)
app.add_exception_handler(postgrest.exceptions.APIError, custom_exception_handler)
app.add_exception_handler(APIException, custom_exception_handler)
app.add_exception_handler(StarletteHTTPException, custom_exception_handler)
app.add_exception_handler(RequestValidationError, custom_exception_handler)

# Middleware
app.add_middleware(RequestTracingMiddleware)

# Parse CORS origins if they are a string
if isinstance(settings.BACKEND_CORS_ORIGINS, str):
    origins = json.loads(settings.BACKEND_CORS_ORIGINS)
else:
    origins = settings.BACKEND_CORS_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"message": "Welcome to AI Outreach Platform API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

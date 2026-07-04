from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import postgrest.exceptions
import logging

from app.core.exceptions import APIException

logger = logging.getLogger("api.error")

async def custom_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    request_id = getattr(request.state, "request_id", "unknown")
    
    # Map different constraint violations
    if isinstance(exc, postgrest.exceptions.APIError):
        code = exc.code
        message = exc.message
        details = exc.details
        
        # PostgreSQL error codes mapping
        # 23505 = unique_violation
        # 23514 = check_violation
        # 42501 = insufficient_privilege (RLS)
        
        if code == "23505":
            return JSONResponse(
                status_code=status.HTTP_409_CONFLICT,
                content={
                    "request_id": request_id,
                    "error": {
                        "code": "DUPLICATE_CONTACT",
                        "message": "A contact with this email or phone already exists in this campaign."
                    }
                }
            )
        elif code == "23514":
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "request_id": request_id,
                    "error": {
                        "code": "VALIDATION_ERROR",
                        "message": f"Data constraint violation: {details or message}"
                    }
                }
            )
        elif code == "42501":
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={
                    "request_id": request_id,
                    "error": {
                        "code": "FORBIDDEN",
                        "message": "You do not have permission to access or modify this resource."
                    }
                }
            )
        else:
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "request_id": request_id,
                    "error": {
                        "code": "DATABASE_ERROR",
                        "message": "An unexpected database error occurred."
                    }
                }
            )

    # Handle our custom APIException
    if isinstance(exc, APIException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "request_id": request_id,
                "error": {
                    "code": exc.code,
                    "message": exc.message
                }
            }
        )

    # Handle standard FastAPI HTTPExceptions
    if isinstance(exc, StarletteHTTPException):
        code = "NOT_FOUND" if exc.status_code == 404 else "API_ERROR"
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "request_id": request_id,
                "error": {
                    "code": code,
                    "message": str(exc.detail)
                }
            }
        )

    # Handle FastAPI Validation Errors
    if isinstance(exc, RequestValidationError):
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "request_id": request_id,
                "error": {
                    "code": "UNPROCESSABLE_ENTITY",
                    "message": "Invalid request parameters"
                }
            }
        )

    # Fallback
    logger.exception(f"[{request_id}] Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "request_id": request_id,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected server error occurred."
            }
        }
    )

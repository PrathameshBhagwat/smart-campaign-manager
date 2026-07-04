import uuid
import time
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from contextvars import ContextVar

request_id_ctx_var: ContextVar[str] = ContextVar("request_id", default=None)

logger = logging.getLogger("api.latency")
logger.setLevel(logging.INFO)
if not logger.handlers:
    ch = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    ch.setFormatter(formatter)
    logger.addHandler(ch)

class RequestTracingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = str(uuid.uuid4())
        request_id_ctx_var.set(request_id)
        request.state.request_id = request_id
        
        start_time = time.perf_counter()
        
        try:
            response = await call_next(request)
        except Exception as e:
            process_time_ms = (time.perf_counter() - start_time) * 1000
            self._log_latency(request, process_time_ms, request_id, error=True)
            raise e
            
        process_time_ms = (time.perf_counter() - start_time) * 1000
        self._log_latency(request, process_time_ms, request_id)
        
        response.headers["X-Request-ID"] = request_id
        return response

    def _log_latency(self, request: Request, process_time_ms: float, request_id: str, error: bool = False):
        log_msg = f"[{request_id}] {request.method} {request.url.path} - {process_time_ms:.2f}ms"
        if error or process_time_ms > 5000:
            logger.error(log_msg)
        elif process_time_ms > 2000:
            logger.warning(log_msg)
        else:
            logger.info(log_msg)

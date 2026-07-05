import time
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from fastapi import HTTPException, status
from openai import OpenAI, APITimeoutError, APIError, RateLimitError
from tenacity import retry, stop_after_attempt, wait_exponential, wait_random, retry_if_exception_type

from app.core.config import settings
from app.middleware.auth import get_supabase_client
from app.schemas.message import MessageResponse, MessageGenerateResponse
from app.services.message_service import MessageService
from app.utils.cost_calculator import calculate_cost
from app.utils.prompt_hash import generate_prompt_hash
from app.security.prompt_sanitizer import PromptSanitizer
from app.services.prompt_service import PromptService
from app.security.business_rules import BusinessRules
from app.services.quality_service import QualityService

EMOJI_PATTERN = re.compile(
    u"(\ud83d[\ude00-\ude4f])|"
    u"(\ud83c[\udf00-\uffff])|"
    u"(\ud83d[\u0000-\uddff])|"
    u"(\ud83d[\ude80-\udeff])|"
    u"(\ud83c[\udde0-\uddff])"
    "+", flags=re.UNICODE)

URL_PATTERN = re.compile(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+')
HTML_PATTERN = re.compile(r'<[^>]*>')
MARKDOWN_PATTERN = re.compile(r'(\*\*|__|\[.*?\]\(.*?\)|`{1,3})')

class AIService:
    @staticmethod
    def check_daily_limit(supabase, user_id: str):
        today = datetime.utcnow().strftime('%Y-%m-%d')
        result = supabase.table('ai_usage').select('id', count='exact').eq('user_id', user_id).gte('generated_at', today).execute()
        
        count = result.count if result.count is not None else 0
        if count >= settings.OPENAI_MAX_DAILY_GENERATIONS:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={"code": "AI_LIMIT_EXCEEDED", "message": "Daily generation limit reached."}
            )

    @staticmethod
    def _detect_provider() -> str:
        base_url = settings.OPENAI_BASE_URL.lower() if settings.OPENAI_BASE_URL else ""
        if "api.groq.com" in base_url:
            return "groq"
        elif "googleapis.com" in base_url:
            return "google"
        elif "openrouter.ai" in base_url:
            return "openrouter"
        elif "localhost" in base_url or "127.0.0.1" in base_url:
            return "ollama"
        return "openai"

    @staticmethod
    def get_cached_message(supabase, contact_id: str, channel: str):
        existing = supabase.table('messages').select('*') \
            .eq('contact_id', contact_id) \
            .eq('channel', channel) \
            .eq('generation_source', 'ai') \
            .eq('version', 1) \
            .execute()
        
        if existing.data:
            return existing.data[0]
        return None

    @staticmethod
    def sanitize_context(c_data: dict, campaign_data: dict) -> dict:
        raw_context = {
            'contact_name': c_data.get('name') or 'Hi there',
            'job_title': c_data.get('job_title') or '',
            'company': c_data.get('company') or '',
            'city': c_data.get('city') or '',
            'campaign_name': campaign_data.get('name') or '',
            'business_type': campaign_data.get('business_type') or 'education',
            'offering_type': campaign_data.get('offering_type') or 'program',
            'offering_name': campaign_data.get('offering_name') or campaign_data.get('course_name') or 'our program',
            'course_name': campaign_data.get('course_name') or campaign_data.get('offering_name') or 'our program',
            'target_goal': campaign_data.get('target_goal') or 'professional engagement',
            'campaign_description': campaign_data.get('description') or '',
            'business_config': str(campaign_data.get('business_config') or '{}')
        }
        return PromptSanitizer.sanitize_context(raw_context)

    @staticmethod
    def build_prompt(channel_prompt_template: str, sanitized_context: dict) -> str:
        formatted = channel_prompt_template.format(**sanitized_context)
        return PromptSanitizer.wrap_context(formatted)

    @staticmethod
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=4) + wait_random(0, 1),
        retry=retry_if_exception_type((APITimeoutError, RateLimitError, APIError, ValueError))
    )
    def generate_completion_with_validation(system_prompt: str, user_prompt: str, channel: str, business_type: str = "education"):
        client = OpenAI(
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL,
            timeout=settings.OPENAI_TIMEOUT_SECONDS
        )
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            temperature=settings.OPENAI_TEMPERATURE,
            max_tokens=settings.OPENAI_MAX_TOKENS,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
        )
        if not response.choices or not response.choices[0].message.content:
            raise ValueError("Empty output from AI")
        
        # This validates and returns the cleaned string
        cleaned_content = AIService.validate_output(response.choices[0].message.content, channel, business_type)
        response.choices[0].message.content = cleaned_content
        return response

    @staticmethod
    def validate_output(content: str, channel: str, business_type: str = "education"):
        if not content:
            raise ValueError("Empty content")
            
        content = content.strip()
        length = len(content)
        
        if length == 0:
            raise ValueError("Empty content")
            
        channel_limits = {
            'linkedin': 1500,
            'whatsapp': 1000,
            'email': 3000
        }
        
        max_length = channel_limits.get(channel, 500)
        if length > max_length:
            raise ValueError("Exceeds channel limits")
            
        # Instead of failing the entire generation, we robustly clean the output
        # to handle smaller free models that sometimes ignore negative constraints
        patterns = [r'\[.*?\]', r'\{.*?\}', r'\<.*?\>']
        for pattern in patterns:
            content = re.sub(pattern, '', content)
                
        content = EMOJI_PATTERN.sub('', content)
            
        content = URL_PATTERN.sub('', content)
            
        content = HTML_PATTERN.sub('', content)
            
        content = MARKDOWN_PATTERN.sub('', content)
        
        content = content.strip()
        
        # Domain-specific validation
        return BusinessRules.validate(content, business_type)

    # Removed calculate_quality_score in favor of QualityService.evaluate_message

    @staticmethod
    def save_message(supabase, contact_id: str, channel: str, content: str, duration_ms: int,
                     input_tokens: int, output_tokens: int, estimated_cost: float, prompt_hash: str,
                     prompt_version: str, status_val: str = "ready", error: str = None, 
                     ai_quality_score: int = None, quality_label: str = None, quality_reasons: list = None):
        message_data = {
            "contact_id": contact_id,
            "content": content,
            "channel": channel,
            "generation_source": "ai",
            "status": status_val,
            "version": 1,
            "copied_count": 0,
            "ai_model": settings.OPENAI_MODEL,
            "ai_provider": AIService._detect_provider(),
            "prompt_version": prompt_version,
            "generation_duration_ms": duration_ms,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "estimated_cost_usd": estimated_cost,
            "prompt_hash": prompt_hash,
            "is_outdated": False
        }
        
        if ai_quality_score is not None:
            message_data["quality_score"] = ai_quality_score
            # We also map to ai_quality_score for legacy support if needed, but quality_score is the new column
            message_data["ai_quality_score"] = ai_quality_score
            
        if quality_label is not None:
            message_data["quality_label"] = quality_label
            
        if quality_reasons is not None:
            message_data["quality_reasons"] = quality_reasons
            
        if error:
            message_data["generation_error"] = error

        result = supabase.table('messages').insert(message_data).execute()
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={"code": "AI_GENERATION_FAILED", "message": "Unable to save generated message."}
            )
        return result.data[0]

    @staticmethod
    def log_usage(supabase, user_id: str, message_id: str, channel: str, cache_hit: bool, 
                  input_tokens: int, output_tokens: int, estimated_cost: float, prompt_version: str):
        usage_data = {
            "user_id": user_id,
            "message_id": message_id,
            "model": settings.OPENAI_MODEL,
            "prompt_version": prompt_version,
            "channel": channel,
            "cache_hit": cache_hit,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "estimated_cost_usd": estimated_cost
        }
        # Log to db, we ignore errors to not fail the request if logging fails
        try:
            supabase.table('ai_usage').insert(usage_data).execute()
        except Exception as e:
            print(f"Failed to log usage: {e}")

    @staticmethod
    def generate_message(contact_id: str, channel: str, user_id: str) -> MessageGenerateResponse:
        MessageService._verify_contact_ownership(contact_id, user_id)
        supabase = get_supabase_client()
        
        AIService.check_daily_limit(supabase, user_id)
        
        cached_msg = AIService.get_cached_message(supabase, contact_id, channel)
        if cached_msg:
            # Determine prompt version safely for cache fallback
            from app.utils.prompt_versions import PromptVersions
            pv = PromptVersions.get_default_prompt_version()
            
            # Re-calculate or reuse tokens? We will log cache hit with 0 cost
            AIService.log_usage(supabase, user_id, cached_msg['id'], channel, cache_hit=True, 
                                input_tokens=0, output_tokens=0, estimated_cost=0.0, prompt_version=pv)
            return MessageGenerateResponse(cached=True, message=MessageResponse(**cached_msg))

        contact_res = supabase.table('contacts').select(
            'name, job_title, company, city, campaign_id, campaigns(name, course_name, business_type, offering_type, offering_name, target_goal, business_config)'
        ).eq('id', contact_id).execute()
        
        if not contact_res.data:
            raise HTTPException(status_code=404, detail="Contact not found")
            
        c_data = contact_res.data[0]
        campaign_data = c_data.get('campaigns', {})
        business_type = campaign_data.get('business_type') or 'education'
        
        # Ensure business_config is a dict
        business_config = campaign_data.get('business_config')
        if not isinstance(business_config, dict):
            business_config = {}
            
        language = business_config.get('language', 'english')
        industry_notes = business_config.get('industry_notes', '')
        
        sanitized_context = AIService.sanitize_context(c_data, campaign_data)
        
        system_prompt, channel_prompt_template = PromptService.build_complete_prompt(
            channel, business_type, language=language, industry_notes=industry_notes
        )
        
        # Determine prompt version
        from app.utils.prompt_versions import PromptVersions
        prompt_version_to_use = PromptVersions.get_prompt_version(business_type)
        
        prompt_hash = generate_prompt_hash(system_prompt, channel_prompt_template, str(sanitized_context))
        user_prompt = AIService.build_prompt(channel_prompt_template, sanitized_context)
        
        start_time = time.time()
        try:
            response = AIService.generate_completion_with_validation(system_prompt, user_prompt, channel, business_type)
        except Exception as e:
            import logging
            logging.error(f"AI Generation failed: {str(e)}")
            
            error_msg = str(e)
            error_type = "Provider Error"
            if "Timeout" in error_msg:
                error_type = "Timeout"
            elif "RateLimit" in error_msg or "429" in error_msg:
                error_type = "Rate Limit"
            elif "Contains placeholders" in error_msg or "validation" in error_msg.lower():
                error_type = "Prompt Validation Failed"
            elif "Empty output" in error_msg:
                error_type = "Invalid Output"
                
            duration_ms = int((time.time() - start_time) * 1000)
            
            # Save failed message
            AIService.save_message(
                supabase, contact_id, channel, "[GENERATION FAILED]", duration_ms,
                0, 0, 0.0, prompt_hash, prompt_version_to_use, status_val="failed", error=error_type
            )
            
            # We log failed usages too to track attempts
            AIService.log_usage(supabase, user_id, None, channel, cache_hit=False,
                                input_tokens=0, output_tokens=0, estimated_cost=0.0, prompt_version=prompt_version_to_use)
            
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={"code": "AI_GENERATION_FAILED", "message": "Unable to generate a valid message right now. Check server logs."}
            )
            
        generation_duration_ms = int((time.time() - start_time) * 1000)
        
        # Content is guaranteed to be validated and stripped at this point
        content = response.choices[0].message.content.strip()
            
        input_tokens = response.usage.prompt_tokens if response.usage else 0
        output_tokens = response.usage.completion_tokens if response.usage else 0
        estimated_cost = calculate_cost(input_tokens, output_tokens, settings.OPENAI_MODEL)
        
        quality_score, quality_label, quality_reasons = QualityService.evaluate_message(content)
        
        saved_msg = AIService.save_message(
            supabase, contact_id, channel, content, generation_duration_ms,
            input_tokens, output_tokens, estimated_cost, prompt_hash, prompt_version_to_use,
            ai_quality_score=quality_score,
            quality_label=quality_label,
            quality_reasons=quality_reasons
        )
        
        AIService.log_usage(supabase, user_id, saved_msg['id'], channel, cache_hit=False,
                            input_tokens=input_tokens, output_tokens=output_tokens, estimated_cost=estimated_cost,
                            prompt_version=prompt_version_to_use)
                            
        return MessageGenerateResponse(cached=False, message=MessageResponse(**saved_msg))

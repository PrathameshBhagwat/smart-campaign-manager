from fastapi import HTTPException
from app.middleware.auth import get_supabase_client
from app.schemas.template import TemplateCreate, TemplateUpdate
from app.utils.template_renderer import validate_variables

class TemplateService:
    @staticmethod
    def create_template(user_id: str, data: TemplateCreate):
        validate_variables(data.content)
        
        supabase = get_supabase_client()
        payload = data.model_dump(exclude_unset=True)
        payload['user_id'] = user_id
        
        # If it's the first template for this scope/channel/business, maybe set is_default
        # Not strictly required, but good practice.
        
        result = supabase.table('message_templates').insert(payload).execute()
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create template")
        return result.data[0]
        
    @staticmethod
    def get_templates(user_id: str):
        supabase = get_supabase_client()
        result = supabase.table('message_templates').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
        return {"templates": result.data or []}
        
    @staticmethod
    def update_template(user_id: str, template_id: str, data: TemplateUpdate):
        if data.content:
            validate_variables(data.content)
            
        supabase = get_supabase_client()
        
        # Ensure ownership
        existing = supabase.table('message_templates').select('id, version').eq('id', template_id).eq('user_id', user_id).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Template not found")
            
        payload = data.model_dump(exclude_unset=True)
        if not payload:
            return existing.data[0]
            
        # Bump version if content changed
        if data.content:
            payload['version'] = existing.data[0]['version'] + 1
            
        result = supabase.table('message_templates').update(payload).eq('id', template_id).eq('user_id', user_id).execute()
        return result.data[0]
        
    @staticmethod
    def delete_template(user_id: str, template_id: str):
        supabase = get_supabase_client()
        existing = supabase.table('message_templates').select('id').eq('id', template_id).eq('user_id', user_id).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Template not found")
            
        supabase.table('message_templates').delete().eq('id', template_id).execute()
        return {"success": True}
        
    @staticmethod
    def duplicate_template(user_id: str, template_id: str):
        supabase = get_supabase_client()
        existing = supabase.table('message_templates').select('*').eq('id', template_id).eq('user_id', user_id).execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Template not found")
            
        original = existing.data[0]
        
        new_template = {
            'user_id': user_id,
            'name': original['name'] + " (Copy)",
            'description': original.get('description'),
            'channel': original['channel'],
            'business_type': original['business_type'],
            'template_scope': original['template_scope'],
            'campaign_id': original.get('campaign_id'),
            'content': original['content'],
            'is_default': False,
            'version': 1,
            'usage_count': 0
        }
        
        result = supabase.table('message_templates').insert(new_template).execute()
        return result.data[0]
        
    @staticmethod
    def increment_usage(template_id: str):
        # We don't have atomic increment in postgrest easily without rpc, so we fetch and update.
        # Ideally this is a DB trigger or RPC. We'll do a simple update for now.
        supabase = get_supabase_client()
        existing = supabase.table('message_templates').select('usage_count').eq('id', template_id).execute()
        if existing.data:
            count = existing.data[0]['usage_count'] or 0
            supabase.table('message_templates').update({'usage_count': count + 1}).eq('id', template_id).execute()

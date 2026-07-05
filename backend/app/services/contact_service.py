from typing import Optional, List
from fastapi import HTTPException, status
from app.middleware.auth import get_supabase_client
from app.schemas.contact import ContactResponse, ContactStatusUpdate, PaginatedContacts

class ContactService:
    @staticmethod
    def get_contacts_paginated(
        campaign_id: str,
        user_id: str,
        page: int = 1,
        limit: int = 20,
        search: Optional[str] = None,
        status_filter: Optional[str] = None,
        city_filter: Optional[str] = None,
        company_filter: Optional[str] = None
    ) -> PaginatedContacts:
        supabase = get_supabase_client()
        
        # Verify campaign ownership
        camp = supabase.table('campaigns').select('id').eq('id', campaign_id).eq('user_id', user_id).execute()
        if not camp.data:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Campaign not found or access denied")
        
        # Start building the query
        # Since we need total count, we execute a count query first
        query = supabase.table('contacts').select('*, messages(status, generation_source)', count='exact').eq('campaign_id', campaign_id)
        
        # Apply filters
        if status_filter:
            query = query.eq('status', status_filter)
        if city_filter:
            query = query.ilike('city', f"%{city_filter}%")
        if company_filter:
            query = query.ilike('company', f"%{company_filter}%")
            
        if search:
            # Supabase or() syntax: or=(name.ilike.%query%,email.ilike.%query%,company.ilike.%query%,job_title.ilike.%query%,city.ilike.%query%)
            search_pattern = f"%{search}%"
            or_filter = f"name.ilike.{search_pattern},email.ilike.{search_pattern},company.ilike.{search_pattern},job_title.ilike.{search_pattern},city.ilike.{search_pattern}"
            query = query.or_(or_filter)
            
        # Execute query for data and count
        start = (page - 1) * limit
        end = start + limit - 1
        
        result = query.order('created_at', desc=True).range(start, end).execute()
        
        total_count = result.count if result.count is not None else 0
        total_pages = (total_count + limit - 1) // limit if total_count > 0 else 1
        
        contacts = []
        for item in result.data:
            ai_msgs = [m for m in item.get('messages', []) if m.get('generation_source') == 'ai']
            if ai_msgs:
                statuses = [m.get('status') for m in ai_msgs]
                if 'ready' in statuses:
                    item['latest_ai_message_status'] = 'ready'
                elif 'failed' in statuses:
                    item['latest_ai_message_status'] = 'failed'
                elif 'processing' in statuses:
                    item['latest_ai_message_status'] = 'processing'
                else:
                    item['latest_ai_message_status'] = statuses[0] if statuses else None
            else:
                item['latest_ai_message_status'] = None
            contacts.append(ContactResponse(**item))
        
        return PaginatedContacts(
            contacts=contacts,
            total_count=total_count,
            current_page=page,
            total_pages=total_pages
        )

    @staticmethod
    def update_contact_status(contact_id: str, update: ContactStatusUpdate, user_id: str) -> ContactResponse:
        supabase = get_supabase_client()
        
        # Ensure contact belongs to a campaign owned by user
        # RLS handles this implicitly, but explicitly checking is safe
        # RLS: Users can manage contacts in their campaigns
        
        update_data = {"status": update.status}
        result = supabase.table('contacts').update(update_data).eq('id', contact_id).execute()
        
        if not result.data:
            # This happens if contact doesn't exist or RLS blocks it
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found or access denied")
            
        return ContactResponse(**result.data[0])

    @staticmethod
    def get_imports_paginated(campaign_id: str, user_id: str, page: int = 1, limit: int = 20):
        supabase = get_supabase_client()
        
        # Verify campaign ownership
        camp = supabase.table('campaigns').select('id').eq('id', campaign_id).eq('user_id', user_id).execute()
        if not camp.data:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Campaign not found or access denied")
        
        query = supabase.table('imports').select('*', count='exact').eq('campaign_id', campaign_id)
        
        start = (page - 1) * limit
        end = start + limit - 1
        
        result = query.order('created_at', desc=True).range(start, end).execute()
        
        total_count = result.count if result.count is not None else 0
        total_pages = (total_count + limit - 1) // limit if total_count > 0 else 1
        
        from app.schemas.imports import ImportSummary, PaginatedImports
        imports = [ImportSummary(**item) for item in result.data]
        
        return PaginatedImports(
            imports=imports,
            total_count=total_count,
            current_page=page,
            total_pages=total_pages
        )

    @staticmethod
    def get_contact_stats(campaign_id: str, user_id: str):
        supabase = get_supabase_client()
        
        # Verify campaign ownership
        camp = supabase.table('campaigns').select('id').eq('id', campaign_id).eq('user_id', user_id).execute()
        if not camp.data:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Campaign not found or access denied")
            
        # Get count per status
        # Since Supabase postgREST doesn't directly do group by without RPC, we'll fetch just statuses and count in python if < 10k,
        # but 10k is large to fetch. Wait, Supabase allows exact count on filtered queries. We can run 5 concurrent count queries,
        # or we can write a Postgres function, or just fetch `status` only and count them.
        # Given we want stats quickly and don't have RPC setup, doing 1 query fetching all statuses is faster than 5 separate count queries
        result = supabase.table('contacts').select('status').eq('campaign_id', campaign_id).execute()
        
        total = 0
        new_c = 0
        contacted_c = 0
        interested_c = 0
        enrolled_c = 0
        
        for row in result.data:
            total += 1
            st = row.get('status')
            if st == 'New': new_c += 1
            elif st == 'Contacted': contacted_c += 1
            elif st == 'Interested': interested_c += 1
            elif st == 'Enrolled': enrolled_c += 1
            
        from app.schemas.imports import ContactStats
        return ContactStats(
            total_contacts=total,
            new_contacts=new_c,
            contacted_contacts=contacted_c,
            interested_contacts=interested_c,
            enrolled_contacts=enrolled_c
        )

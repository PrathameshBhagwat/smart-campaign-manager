import io
import csv
from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from app.middleware.auth import get_supabase_client
import openpyxl

class ExportService:
    @staticmethod
    def export_messages(campaign_id: str, channel: str, format_type: str, user_id: str):
        supabase = get_supabase_client()
        
        # Verify campaign ownership
        camp_res = supabase.table('campaigns').select('id').eq('id', campaign_id).eq('user_id', user_id).execute()
        if not camp_res.data:
            raise HTTPException(status_code=403, detail="Campaign not found")
            
        # Get all contacts for this campaign
        contacts_res = supabase.table('contacts').select('id, name, email, linkedin_url').eq('campaign_id', campaign_id).execute()
        if not contacts_res.data:
            raise HTTPException(status_code=400, detail="No contacts found")
            
        contact_map = {c['id']: c for c in contacts_res.data}
        cids = list(contact_map.keys())
        
        # Get messages
        query = supabase.table('messages').select('contact_id, channel, content, status, ai_quality_score, is_outdated').in_('contact_id', cids)
        if channel and channel != 'all':
            query = query.eq('channel', channel)
            
        messages_res = query.execute()
        
        rows = []
        # Header
        headers = ["Name", "Email", "LinkedIn", "Channel", "Status", "AI Quality Score", "Outdated", "Message Content"]
        
        for m in messages_res.data:
            c = contact_map.get(m['contact_id'], {})
            rows.append([
                c.get('name', ''),
                c.get('email', ''),
                c.get('linkedin_url', ''),
                m.get('channel', ''),
                m.get('status', ''),
                m.get('ai_quality_score', ''),
                'Yes' if m.get('is_outdated') else 'No',
                m.get('content', '')
            ])
            
        if format_type == 'csv':
            return ExportService._export_csv(headers, rows)
        elif format_type == 'xlsx':
            return ExportService._export_xlsx(headers, rows)
        else:
            raise HTTPException(status_code=400, detail="Invalid format type. Must be 'csv' or 'xlsx'")

    @staticmethod
    def _export_csv(headers, rows):
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(headers)
        writer.writerows(rows)
        output.seek(0)
        
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=exported_messages.csv"}
        )

    @staticmethod
    def _export_xlsx(headers, rows):
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Messages"
        
        ws.append(headers)
        for row in rows:
            ws.append(row)
            
        output = io.BytesIO()
        wb.save(output)
        output.seek(0)
        
        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=exported_messages.xlsx"}
        )

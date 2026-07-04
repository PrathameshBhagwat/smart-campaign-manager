import pandas as pd
import io
import re
from fastapi import UploadFile, HTTPException, status
from app.middleware.auth import get_supabase_client
from app.schemas.imports import ImportSummary

class CSVService:
    REQUIRED_COLUMNS = ['name', 'email', 'phone', 'company', 'job_title', 'city']

    @staticmethod
    def _normalize_email(email):
        if pd.isna(email) or not str(email).strip():
            return None
        return str(email).strip().lower()

    @staticmethod
    def _normalize_phone(phone):
        if pd.isna(phone) or not str(phone).strip():
            return None
        # Remove spaces, dashes, brackets
        p = str(phone)
        p = re.sub(r'[\s\-\(\)]+', '', p)
        # Assuming normalize country code means keeping '+' and digits
        p = re.sub(r'[^\d\+]', '', p)
        return p if p else None

    @staticmethod
    def _normalize_name(name):
        if pd.isna(name) or not str(name).strip():
            return "Unknown" # fallback
        return str(name).strip()

    @staticmethod
    def _normalize_linkedin(url):
        if pd.isna(url) or not str(url).strip():
            return None
            
        url_str = str(url).strip().lower()
        
        # reject invalid protocols
        invalid_protocols = ["javascript:", "data:", "vbscript:", "file:", "ftp:", "localhost", "127.0.0.1"]
        for p in invalid_protocols:
            if url_str.startswith(p) or p in url_str:
                return None
                
        # Handle "linkedin.com/..."
        if url_str.startswith("linkedin.com") or url_str.startswith("www.linkedin.com"):
            url_str = "https://" + url_str
            
        # Must start with https://linkedin.com or https://www.linkedin.com
        if not url_str.startswith("https://linkedin.com") and not url_str.startswith("https://www.linkedin.com"):
            return None
            
        return url_str[:500]

    @staticmethod
    async def process_file_upload(file: UploadFile, campaign_id: str, user_id: str) -> ImportSummary:
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File is empty")
        
        file_ext = file.filename.split('.')[-1].lower() if file.filename else ''
        if file_ext not in ['csv', 'xlsx', 'xls']:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported file format. Use .csv, .xls or .xlsx")

        try:
            if file_ext == 'csv':
                df = pd.read_csv(io.BytesIO(contents))
            else:
                df = pd.read_excel(io.BytesIO(contents))
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to parse file: {str(e)}")

        # Validate columns
        df.columns = [str(c).strip().lower() for c in df.columns]
        
        # Map linkedin headers
        linkedin_headers = ["linkedin", "linkedin_profile", "profile_url", "linkedin_link", "linkedin_profile_url"]
        for header in linkedin_headers:
            if header in df.columns and "linkedin_url" not in df.columns:
                df.rename(columns={header: "linkedin_url"}, inplace=True)
                break
                
        missing_cols = [col for col in CSVService.REQUIRED_COLUMNS if col not in df.columns]
        if missing_cols:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Missing required columns: {', '.join(missing_cols)}")

        # Normalize data
        df['name'] = df['name'].apply(CSVService._normalize_name)
        df['email'] = df['email'].apply(CSVService._normalize_email)
        df['phone'] = df['phone'].apply(CSVService._normalize_phone)
        
        if 'linkedin_url' in df.columns:
            df['linkedin_url'] = df['linkedin_url'].apply(CSVService._normalize_linkedin)
        
        # Replace NaN with None for the dict conversion
        df = df.where(pd.notnull(df), None)

        supabase = get_supabase_client()
        
        # Verify campaign ownership
        camp_res = supabase.table('campaigns').select('id').eq('id', campaign_id).eq('user_id', user_id).execute()
        if not camp_res.data:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Campaign not found or access denied")

        # Fetch existing contacts to check duplicates
        existing_contacts = supabase.table('contacts').select('email', 'phone').eq('campaign_id', campaign_id).execute()
        existing_emails = set(c['email'] for c in existing_contacts.data if c.get('email'))
        existing_phones = set(c['phone'] for c in existing_contacts.data if c.get('phone'))

        new_contacts = []
        skipped_count = 0
        error_count = 0
        total_errors = 0
        error_details = []

        # Optional: drop file-internal duplicates as well (but we might lose row-level error reporting for them)
        # For Phase 4.5, let's keep iteration to capture skipped rows
        # df = df.drop_duplicates(subset=['email'], keep='first')
        
        for index, row in df.iterrows():
            row_num = index + 2 # 1-based + 1 for header
            email = row.get('email')
            phone = row.get('phone')
            original_data = row.to_dict()
            
            # Duplicate check
            is_dup = False
            if email and email in existing_emails:
                is_dup = True
            if phone and phone in existing_phones:
                is_dup = True

            if is_dup:
                skipped_count += 1
                continue

            # Check required fields (at least one contact method)
            if not email and not phone:
                total_errors += 1
                if len(error_details) < 500:
                    error_details.append({
                        "row": row_num,
                        "data": original_data,
                        "error": "Missing email and phone"
                    })
                continue

            contact_data = {
                "campaign_id": campaign_id,
                "name": row.get('name'),
                "email": email,
                "phone": phone,
                "company": str(row.get('company')) if row.get('company') else None,
                "job_title": str(row.get('job_title')) if row.get('job_title') else None,
                "city": str(row.get('city')) if row.get('city') else None,
                "linkedin_url": str(row.get('linkedin_url')) if 'linkedin_url' in df.columns and row.get('linkedin_url') else None,
                "status": "New"
            }
            new_contacts.append(contact_data)
            
            # update local cache to prevent internal duplicates if same phone/email in same batch
            if email: existing_emails.add(email)
            if phone: existing_phones.add(phone)

        imported_count = len(new_contacts)
        status_val = "completed"
        
        if new_contacts:
            # Batch insert
            try:
                insert_res = supabase.table('contacts').insert(new_contacts).execute()
                if not insert_res.data:
                    status_val = "failed"
            except Exception as e:
                status_val = "failed"
                total_errors += 1
                if len(error_details) < 500:
                    error_details.append({"row": 0, "data": {}, "error": f"DB Insert failed: {str(e)}"})
        
        if imported_count == 0 and total_errors > 0:
             status_val = "failed"
             
        # Record import history
        import_record = {
            "campaign_id": campaign_id,
            "file_name": file.filename or "unknown",
            "imported_count": imported_count,
            "skipped_count": skipped_count,
            "error_count": len(error_details), # The spec said error_count = stored errors, total_errors = all
            "total_errors": total_errors,
            "status": status_val,
            "error_details": error_details
        }
        hist_res = supabase.table('imports').insert(import_record).execute()
        if not hist_res.data:
             raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to record import history")

        return ImportSummary(**hist_res.data[0])

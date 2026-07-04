from typing import Optional
from datetime import datetime, timezone
from fastapi import HTTPException, status
from app.middleware.auth import get_supabase_client
from app.schemas.message import MessageCreate, MessageUpdate, MessageResponse, MessageListResponse, CopyResponse


class MessageService:

    VALID_CHANNELS = {"linkedin", "whatsapp", "email"}

    @staticmethod
    def _verify_contact_ownership(contact_id: str, user_id: str):
        """Verify that the contact belongs to a campaign owned by the current user."""
        supabase = get_supabase_client()
        result = supabase.table('contacts').select(
            'id, campaign_id, campaigns!inner(user_id)'
        ).eq('id', contact_id).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contact not found"
            )

        campaign_data = result.data[0].get('campaigns')
        if not campaign_data or campaign_data.get('user_id') != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this contact"
            )

        return result.data[0]

    @staticmethod
    def _verify_message_ownership(message_id: str, user_id: str):
        """Verify that a message belongs to a contact in a campaign owned by the current user."""
        supabase = get_supabase_client()
        result = supabase.table('messages').select(
            'id, contact_id, contacts!inner(campaign_id, campaigns!inner(user_id))'
        ).eq('id', message_id).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Message not found"
            )

        contact_data = result.data[0].get('contacts')
        if not contact_data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")

        campaign_data = contact_data.get('campaigns')
        if not campaign_data or campaign_data.get('user_id') != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this message"
            )

        return result.data[0]

    @staticmethod
    def get_messages(contact_id: str, user_id: str) -> MessageListResponse:
        """Get all messages for a contact."""
        MessageService._verify_contact_ownership(contact_id, user_id)

        supabase = get_supabase_client()
        result = supabase.table('messages').select('*').eq(
            'contact_id', contact_id
        ).order('created_at', desc=True).execute()

        messages = [MessageResponse(**item) for item in result.data]

        return MessageListResponse(
            messages=messages,
            total_count=len(messages)
        )

    @staticmethod
    def create_message(contact_id: str, data: MessageCreate, user_id: str) -> MessageResponse:
        """Create a new manual message for a contact."""
        MessageService._verify_contact_ownership(contact_id, user_id)

        # Validate channel
        if data.channel not in MessageService.VALID_CHANNELS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid channel: {data.channel}. Must be one of: {', '.join(MessageService.VALID_CHANNELS)}"
            )

        supabase = get_supabase_client()
        message_data = {
            "contact_id": contact_id,
            "content": data.content,
            "channel": data.channel,
            "generation_source": "manual",
            "version": 1,
            "copied_count": 0,
        }

        result = supabase.table('messages').insert(message_data).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create message"
            )

        return MessageResponse(**result.data[0])

    @staticmethod
    def update_message(message_id: str, data: MessageUpdate, user_id: str) -> MessageResponse:
        """Update an existing message's content and/or channel."""
        MessageService._verify_message_ownership(message_id, user_id)

        # Validate channel if provided
        if data.channel and data.channel not in MessageService.VALID_CHANNELS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid channel: {data.channel}. Must be one of: {', '.join(MessageService.VALID_CHANNELS)}"
            )

        update_data = {}
        if data.content is not None:
            update_data["content"] = data.content
        if data.channel is not None:
            update_data["channel"] = data.channel

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )

        # Update timestamp
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

        supabase = get_supabase_client()

        result = supabase.table('messages').update(update_data).eq('id', message_id).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update message"
            )

        return MessageResponse(**result.data[0])

    @staticmethod
    def delete_message(message_id: str, user_id: str) -> None:
        """Hard delete a message. Decision: Hard deletes for MVP simplicity."""
        MessageService._verify_message_ownership(message_id, user_id)

        supabase = get_supabase_client()
        result = supabase.table('messages').delete().eq('id', message_id).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Message not found or already deleted"
            )

    @staticmethod
    def copy_message(message_id: str, user_id: str) -> CopyResponse:
        """
        Atomically increment copied_count and update last_copied_at.
        Uses Supabase RPC to perform database-side increment to avoid race conditions.
        Fallback: read-modify-write if RPC is not available.
        """
        MessageService._verify_message_ownership(message_id, user_id)

        supabase = get_supabase_client()
        now = datetime.now(timezone.utc).isoformat()

        # Attempt atomic increment via RPC
        try:
            rpc_result = supabase.rpc('increment_copy_count', {
                'msg_id': message_id,
                'copy_time': now
            }).execute()

            if rpc_result.data:
                return CopyResponse(
                    message_id=message_id,
                    copied_count=rpc_result.data[0]['copied_count'],
                    last_copied_at=rpc_result.data[0]['last_copied_at']
                )
        except Exception:
            pass  # Fallback to non-atomic if RPC doesn't exist yet

        # Fallback: read current, then update
        current = supabase.table('messages').select('copied_count').eq('id', message_id).execute()
        if not current.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")

        new_count = current.data[0]['copied_count'] + 1

        result = supabase.table('messages').update({
            'copied_count': new_count,
            'last_copied_at': now
        }).eq('id', message_id).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update copy count"
            )

        return CopyResponse(
            message_id=message_id,
            copied_count=result.data[0]['copied_count'],
            last_copied_at=result.data[0]['last_copied_at']
        )

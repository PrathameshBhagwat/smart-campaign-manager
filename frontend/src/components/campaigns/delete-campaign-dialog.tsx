'use client'

import { Campaign } from '@/types/campaign'
import { CampaignService } from '@/services/campaign.service'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface DeleteCampaignDialogProps {
  campaign: Campaign | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function DeleteCampaignDialog({
  campaign,
  open,
  onOpenChange,
  onSuccess,
}: DeleteCampaignDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  if (!campaign) return null

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await CampaignService.deleteCampaign(campaign.id)
      toast.success('Campaign deleted successfully')
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete campaign')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Campaign</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the campaign <strong>"{campaign.name}"</strong>? 
            This action cannot be undone and will permanently remove all associated contacts and messages.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Campaign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

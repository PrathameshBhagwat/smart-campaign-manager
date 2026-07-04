import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Check, X, Bot, Loader2, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { BulkService } from '@/services/bulk.service'
import { BulkJobPreviewResponse } from '@/types/bulk'
import { toast } from 'sonner'

interface BulkActionToolbarProps {
  campaignId: string
  contactIds: string[]
  selectedCount: number
  onClear: () => void
  onGenerate: (channel: 'linkedin' | 'email' | 'whatsapp') => void
  isGenerating: boolean
}

export function BulkActionToolbar({ campaignId, contactIds, selectedCount, onClear, onGenerate, isGenerating }: BulkActionToolbarProps) {
  const [channel, setChannel] = useState<'linkedin' | 'email' | 'whatsapp'>('linkedin')
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const [previewData, setPreviewData] = useState<BulkJobPreviewResponse | null>(null)

  const handlePreviewClick = async () => {
    setIsLoadingPreview(true)
    try {
      const data = await BulkService.previewJob(campaignId, { contact_ids: contactIds, channel })
      setPreviewData(data)
      setIsPreviewOpen(true)
    } catch (error: any) {
      toast.error(error.response?.data?.detail?.message || error.message || 'Failed to fetch preview')
    } finally {
      setIsLoadingPreview(false)
    }
  }

  const handleConfirm = () => {
    setIsPreviewOpen(false)
    onGenerate(channel)
  }

  if (selectedCount === 0) return null

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-10 fade-in duration-300">
        <div className="bg-background border shadow-xl rounded-full px-6 py-3 flex items-center gap-6">
          <div className="flex items-center gap-3 border-r pr-6">
            <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              {selectedCount}
            </div>
            <span className="text-sm font-medium">Selected</span>
            <Button variant="ghost" size="sm" onClick={onClear} className="h-8 px-2 text-muted-foreground" disabled={isGenerating || isLoadingPreview}>
              <X className="w-4 h-4 mr-1" /> Clear
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Select value={channel} onValueChange={(val: any) => setChannel(val)} disabled={isGenerating || isLoadingPreview}>
              <SelectTrigger className="w-[140px] h-9 border-0 bg-muted/50 focus:ring-0">
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              onClick={handlePreviewClick} 
              disabled={isGenerating || isLoadingPreview}
              className="h-9 rounded-full px-6 shadow-md shadow-primary/20"
            >
              {(isGenerating || isLoadingPreview) ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
              ) : (
                <><Bot className="w-4 h-4 mr-2" /> Generate AI</>
              )}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Generation</DialogTitle>
            <DialogDescription>
              Review the details below before starting the AI generation process for {channel}.
            </DialogDescription>
          </DialogHeader>

          {previewData && (
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Contacts Selected</span>
                <span className="font-semibold">{previewData.total_selected}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Already Generated</span>
                <span className="font-semibold text-yellow-600">{previewData.already_generated}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">New Generations Required</span>
                <span className="font-semibold text-green-600">{previewData.new_generations_required}</span>
              </div>
              <div className="flex justify-between items-center py-2 bg-muted/50 rounded-md px-3 mt-4">
                <span className="text-sm font-medium">Estimated AI Cost</span>
                <span className="font-bold">${previewData.estimated_cost_usd.toFixed(4)}</span>
              </div>
              {previewData.new_generations_required === 0 && (
                <div className="flex items-start gap-2 text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md mt-4">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>All selected contacts already have a ready message for {channel}. No new generations will occur.</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirm} disabled={previewData?.new_generations_required === 0}>
              Confirm & Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

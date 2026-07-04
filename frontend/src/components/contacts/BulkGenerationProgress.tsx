import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { BulkService } from '@/services/bulk.service'
import { BulkJobProgressResponse } from '@/types/bulk'
import { Loader2, CheckCircle2, AlertCircle, PlayCircle, XCircle } from 'lucide-react'

interface BulkGenerationProgressProps {
  jobId: string | null
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export function BulkGenerationProgress({ jobId, isOpen, onClose, onComplete }: BulkGenerationProgressProps) {
  const [job, setJob] = useState<BulkJobProgressResponse | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    if (!jobId || !isOpen) return

    let interval: NodeJS.Timeout
    const fetchProgress = async () => {
      try {
        const data = await BulkService.getJobProgress(jobId)
        setJob(data)
        
        if (data.status === 'completed' || data.status === 'failed' || data.status === 'cancelled') {
          clearInterval(interval)
          if (data.status === 'completed') {
            onComplete()
          }
        }
      } catch (e) {
        console.error('Error polling job progress', e)
      }
    }

    fetchProgress() // initial
    interval = setInterval(fetchProgress, 2000)

    return () => clearInterval(interval)
  }, [jobId, isOpen, onComplete])

  const handleCancel = async () => {
    if (!jobId) return
    setIsCancelling(true)
    try {
      await BulkService.cancelJob(jobId)
      // fetch will update state next tick
    } catch (e) {
      console.error(e)
    } finally {
      setIsCancelling(false)
    }
  }

  const handleClose = () => {
    if (job?.status === 'completed' || job?.status === 'failed' || job?.status === 'cancelled') {
      onClose()
    }
  }

  if (!job) return null

  const isDone = job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled'

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="sm:max-w-md pointer-events-none"
      >
        <div className="pointer-events-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {!isDone ? (
                <><Loader2 className="w-5 h-5 animate-spin text-primary" /> Generating AI Messages</>
              ) : job.status === 'completed' ? (
                <><CheckCircle2 className="w-5 h-5 text-green-500" /> Generation Complete</>
              ) : job.status === 'cancelled' ? (
                <><XCircle className="w-5 h-5 text-yellow-500" /> Generation Cancelled</>
              ) : (
                <><AlertCircle className="w-5 h-5 text-red-500" /> Generation Failed</>
              )}
            </DialogTitle>
            <DialogDescription>
              {isDone ? 'The batch process has concluded.' : 'Please do not close this window while generation is running.'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-6">
            {!isDone && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Current: <span className="font-medium text-foreground">{job.current_contact_name || 'Starting...'}</span>
                </span>
                <span className="font-medium">{job.progress_percentage}%</span>
              </div>
            )}

            <Progress value={job.progress_percentage} className="h-2" />

            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-semibold">{job.total_contacts}</div>
                <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Total</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-semibold text-green-600">{job.completed_contacts}</div>
                <div className="text-[10px] uppercase text-green-600/80 tracking-wider">Generated</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-semibold text-yellow-600">{job.skipped_contacts}</div>
                <div className="text-[10px] uppercase text-yellow-600/80 tracking-wider">Skipped</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-semibold text-red-600">{job.failed_contacts}</div>
                <div className="text-[10px] uppercase text-red-600/80 tracking-wider">Failed</div>
              </div>
            </div>

            {isDone && job.result_summary && (
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Duration</span>
                  <span className="font-medium text-foreground">
                    {job.result_summary.duration_seconds || 0} seconds
                  </span>
                </div>
                {job.estimated_cost_usd > 0 && (
                  <div className="flex justify-between items-center text-muted-foreground mt-1">
                    <span>Est. Cost</span>
                    <span className="font-medium text-foreground">
                      ${job.estimated_cost_usd.toFixed(4)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            {!isDone ? (
              <Button 
                variant="destructive" 
                onClick={handleCancel} 
                disabled={isCancelling}
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Job'}
              </Button>
            ) : (
              <Button onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

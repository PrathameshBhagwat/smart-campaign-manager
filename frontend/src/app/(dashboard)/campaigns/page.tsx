'use client'

import { useState, useEffect, useCallback } from 'react'
import { Campaign } from '@/types/campaign'
import { CampaignService } from '@/services/campaign.service'
import { CampaignList } from '@/components/campaigns/campaign-list'
import { CampaignForm } from '@/components/campaigns/campaign-form'
import { DeleteCampaignDialog } from '@/components/campaigns/delete-campaign-dialog'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | undefined>(undefined)

  const fetchCampaigns = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await CampaignService.getCampaigns()
      setCampaigns(data)
    } catch (error: any) {
      toast.error('Failed to load campaigns')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  const handleCreateNew = () => {
    setSelectedCampaign(undefined)
    setIsFormOpen(true)
  }

  const handleEdit = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setIsFormOpen(true)
  }

  const handleDelete = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setIsDeleteOpen(true)
  }

  const handleSuccess = () => {
    fetchCampaigns()
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">Manage your outreach campaigns and courses.</p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <CampaignList 
          campaigns={campaigns} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      )}

      {/* Campaign Form (Create/Edit) */}
      <CampaignForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={handleSuccess}
        initialData={selectedCampaign}
      />

      {/* Delete Confirmation */}
      <DeleteCampaignDialog
        campaign={selectedCampaign || null}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onSuccess={handleSuccess}
      />
      
      {/* Toast notifications container */}
      <Toaster />
    </div>
  )
}

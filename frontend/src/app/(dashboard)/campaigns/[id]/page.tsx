'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Campaign } from '@/types/campaign'
import { Contact, PaginatedContacts, ImportSummary, ContactStats, PaginatedImports } from '@/types/contact'
import { CampaignService } from '@/services/campaign.service'
import { ContactService } from '@/services/contact.service'
import { UploadZone } from '@/components/contacts/upload-zone'
import { ContactTable } from '@/components/contacts/contact-table'
import { ContactStatsCards } from '@/components/contacts/contact-stats-cards'
import { ImportHistoryTable } from '@/components/contacts/import-history-table'
import { MessageList } from '@/components/messages/message-list'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Loader2, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import Link from 'next/link'

import { BulkActionToolbar } from '@/components/contacts/BulkActionToolbar'
import { BulkGenerationProgress } from '@/components/contacts/BulkGenerationProgress'
import { BulkService } from '@/services/bulk.service'
import { CampaignAISummaryCard } from '@/components/campaigns/CampaignAISummaryCard'
import { BulkJobHistoryList } from '@/components/campaigns/BulkJobHistoryList'
import { Download } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export default function CampaignDetailsPage() {
  const params = useParams()
  const campaignId = params.id as string

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [stats, setStats] = useState<ContactStats | null>(null)
  
  const [importHistory, setImportHistory] = useState<ImportSummary[]>([])
  const [historyPage, setHistoryPage] = useState(1)
  const [historyTotalPages, setHistoryTotalPages] = useState(1)
  
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  const [isLoadingContacts, setIsLoadingContacts] = useState(true)
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null)

  // Message Sheet state
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  // Bulk Generation State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [activeJobId, setActiveJobId] = useState<string | null>(null)
  const [isProgressOpen, setIsProgressOpen] = useState(false)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPage(1)
    }, 300)
    return () => clearTimeout(handler)
  }, [searchTerm])

  const fetchCampaign = useCallback(async () => {
    try {
      const data = await CampaignService.getCampaign(campaignId)
      setCampaign(data)
    } catch (error) {
      toast.error('Failed to load campaign details')
    }
  }, [campaignId])

  const fetchStats = useCallback(async () => {
    try {
      const data = await ContactService.getContactStats(campaignId)
      setStats(data)
    } catch (error) {
      console.error('Failed to load stats', error)
    }
  }, [campaignId])

  const fetchHistory = useCallback(async () => {
    try {
      const data = await ContactService.getImports(campaignId, historyPage, 5)
      setImportHistory(data.imports)
      setHistoryTotalPages(data.total_pages)
    } catch (error) {
      console.error('Failed to load import history', error)
    }
  }, [campaignId, historyPage])

  const fetchContacts = useCallback(async () => {
    try {
      setIsLoadingContacts(true)
      const data = await ContactService.getContacts(
        campaignId, 
        page, 
        20, 
        debouncedSearch, 
        statusFilter
      )
      setContacts(data.contacts)
      setTotalPages(data.total_pages)
      setTotalCount(data.total_count)
    } catch (error) {
      toast.error('Failed to load contacts')
    } finally {
      setIsLoadingContacts(false)
    }
  }, [campaignId, page, debouncedSearch, statusFilter])

  useEffect(() => {
    fetchCampaign()
    fetchStats()
  }, [fetchCampaign, fetchStats])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const checkActiveJob = useCallback(async () => {
    try {
      const job = await BulkService.getActiveJob(campaignId)
      if (job.job_id) {
        setActiveJobId(job.job_id)
        setIsProgressOpen(true)
      }
    } catch (e) {
      console.error(e)
    }
  }, [campaignId])

  useEffect(() => {
    checkActiveJob()
  }, [checkActiveJob])

  const handleSelect = (id: string, selected: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (selected) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const handleSelectAll = (selected: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (selected) {
        contacts.forEach(c => next.add(c.id))
      } else {
        contacts.forEach(c => next.delete(c.id))
      }
      return next
    })
  }

  const handleGenerateAI = async (channel: 'linkedin' | 'email' | 'whatsapp') => {
    try {
      const ids = Array.from(selectedIds)
      const res = await BulkService.createJob(campaignId, { contact_ids: ids, channel })
      setActiveJobId(res.job_id)
      setIsProgressOpen(true)
      setSelectedIds(new Set())
    } catch (error: any) {
      toast.error(error.response?.data?.detail?.message || error.message || 'Failed to start bulk generation')
    }
  }

  const handleUpload = async (file: File) => {
    try {
      const summary = await ContactService.uploadContacts(campaignId, file)
      setImportSummary(summary)
      toast.success('Contacts imported successfully')
      fetchContacts()
      fetchStats()
      fetchHistory()
    } catch (error: any) {
      toast.error(error.message || 'Failed to import contacts')
    }
  }

  const handleStatusChange = async (contactId: string, newStatus: string) => {
    try {
      setContacts(prev => prev.map(c => c.id === contactId ? { ...c, status: newStatus as any } : c))
      await ContactService.updateContactStatus(contactId, newStatus)
      toast.success('Status updated')
      fetchStats() // refresh stats on status change
    } catch (error) {
      toast.error('Failed to update status')
      fetchContacts()
    }
  }

  const handleViewMessages = (contact: Contact) => {
    setSelectedContact(contact)
    setIsSheetOpen(true)
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/campaigns">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{campaign?.name || 'Loading Campaign...'}</h1>
          <p className="text-muted-foreground">Manage your contacts for this campaign.</p>
        </div>
      </div>

      <ContactStatsCards stats={stats} />
      
      <CampaignAISummaryCard campaignId={campaignId} />

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Import Contacts</CardTitle>
            <CardDescription>Upload a CSV or XLSX file containing contact information.</CardDescription>
          </CardHeader>
          <CardContent>
            <UploadZone onUpload={handleUpload} />
          </CardContent>
        </Card>

        {importSummary && (
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle>Last Import Summary</CardTitle>
              <CardDescription>File: {importSummary.file_name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-background rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{importSummary.imported_count}</div>
                  <div className="text-xs text-muted-foreground uppercase">Imported</div>
                </div>
                <div className="p-4 bg-background rounded-lg border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-600">{importSummary.skipped_count}</div>
                  <div className="text-xs text-muted-foreground uppercase">Skipped</div>
                </div>
                <div className="p-4 bg-background rounded-lg border border-red-200">
                  <div className="text-2xl font-bold text-red-600">{importSummary.error_count}</div>
                  <div className="text-xs text-muted-foreground uppercase">Errors</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold tracking-tight">Import History</h3>
        <ImportHistoryTable 
          imports={importHistory} 
          page={historyPage} 
          totalPages={historyTotalPages} 
          onPageChange={setHistoryPage} 
        />
      </div>

      <div className="space-y-4 pt-6 border-t">
        <h3 className="text-xl font-semibold tracking-tight">Bulk Generation History</h3>
        <BulkJobHistoryList campaignId={campaignId} />
      </div>

      <div className="space-y-4 pt-6 border-t">
        <h3 className="text-xl font-semibold tracking-tight">Contact List</h3>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex w-full sm:w-auto items-center gap-2">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val || 'all'); setPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Contacted">Contacted</SelectItem>
                <SelectItem value="Interested">Interested</SelectItem>
                <SelectItem value="Enrolled">Enrolled</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10">
                <Download className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => window.open(BulkService.getExportUrl(campaignId, 'all', 'csv'), '_blank')}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(BulkService.getExportUrl(campaignId, 'all', 'xlsx'), '_blank')}>
                  Export as XLSX
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            Showing {totalCount > 0 ? (page - 1) * 20 + 1 : 0} - {Math.min(page * 20, totalCount)} of {totalCount} contacts
          </div>
        </div>

        {isLoadingContacts ? (
          <div className="flex justify-center items-center py-20 border rounded-md">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ContactTable 
            contacts={contacts} 
            selectedIds={selectedIds}
            onSelect={handleSelect}
            onSelectAll={handleSelectAll}
            onStatusChange={handleStatusChange} 
            onViewMessages={handleViewMessages}
          />
        )}

        {totalCount > 0 && (
          <div className="flex items-center justify-end gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isLoadingContacts}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <div className="text-sm px-2">Page {page} of {totalPages}</div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isLoadingContacts}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* Bulk Action Toolbar */}
      <BulkActionToolbar 
        campaignId={campaignId}
        contactIds={Array.from(selectedIds)}
        selectedCount={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
        onGenerate={handleGenerateAI}
        isGenerating={isProgressOpen && !!activeJobId}
      />

      {/* Bulk Generation Progress Modal */}
      <BulkGenerationProgress 
        jobId={activeJobId}
        isOpen={isProgressOpen}
        onClose={() => {
          setIsProgressOpen(false)
          setActiveJobId(null)
          fetchContacts()
        }}
        onComplete={() => {
          fetchContacts()
        }}
      />

      {/* Message Sheet Drawer */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full md:max-w-2xl overflow-y-auto overflow-x-hidden">
          <SheetHeader>
            <SheetTitle>Messages for {selectedContact?.name}</SheetTitle>
            <SheetDescription>
              {selectedContact?.email || selectedContact?.phone || 'No contact info'} • {selectedContact?.company || 'No company'}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {selectedContact && (
              <MessageList 
                contact={selectedContact}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Toaster />
    </div>
  )
}

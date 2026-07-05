'use client'

import { Contact } from '@/types/contact'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Users, MessageSquare } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox' // trigger recompile
import { LinkedInButton } from '@/components/contacts/LinkedInButton'
import { EmailButton } from '@/components/contacts/EmailButton'

interface ContactTableProps {
  contacts: Contact[]
  selectedIds: Set<string>
  onSelect: (id: string, selected: boolean) => void
  onSelectAll: (selected: boolean) => void
  onStatusChange: (contactId: string, newStatus: string) => Promise<void>
  onViewMessages: (contact: Contact) => void
}

const statusColors: Record<string, string> = {
  New: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  Contacted: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  Interested: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  Enrolled: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800'
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

export function ContactTable({ 
  contacts, 
  selectedIds,
  onSelect,
  onSelectAll,
  onStatusChange, 
  onViewMessages 
}: ContactTableProps) {
  const allSelected = contacts.length > 0 && contacts.every(c => selectedIds.has(c.id))

  if (contacts.length === 0) {
    return (
      <EmptyState 
        title="No contacts found" 
        description="Try adjusting your search or filters, or upload a new file to get started." 
        icon={<Users className="w-8 h-8 text-muted-foreground" />} 
      />
    )
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox 
                checked={allSelected} 
                onCheckedChange={(checked: boolean | 'indeterminate') => onSelectAll(!!checked)}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow key={contact.id} data-state={selectedIds.has(contact.id) ? "selected" : undefined} className="group hover:bg-muted/30">
              <TableCell>
                <Checkbox 
                  checked={selectedIds.has(contact.id)}
                  onCheckedChange={(checked: boolean | 'indeterminate') => onSelect(contact.id, !!checked)}
                  aria-label={`Select ${contact.name}`}
                />
              </TableCell>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-primary-foreground font-bold text-xs shadow-sm">
                    {getInitials(contact.name)}
                  </div>
                  <div>
                    <div className="text-foreground flex items-center gap-2">
                      {contact.name}
                      {contact.latest_ai_message_status === 'ready' && (
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] shrink-0" title="AI outreach message generated" />
                      )}
                      {contact.latest_ai_message_status === 'failed' && (
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)] shrink-0" title="AI message generation failed" />
                      )}
                      {contact.latest_ai_message_status === 'processing' && (
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shadow-[0_0_8px_rgba(245,158,11,0.5)] shrink-0" title="AI message is generating..." />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{contact.job_title}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{contact.email || '-'}</TableCell>
              <TableCell>{contact.phone || '-'}</TableCell>
              <TableCell>{contact.company || '-'}</TableCell>
              <TableCell>{contact.city || '-'}</TableCell>
              <TableCell>
                <Select
                  value={contact.status}
                  onValueChange={(val) => {
                    if (val) onStatusChange(contact.id, val)
                  }}
                >
                  <SelectTrigger className={`h-7 w-[120px] text-xs font-semibold rounded-full border ${statusColors[contact.status]}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Contacted">Contacted</SelectItem>
                    <SelectItem value="Interested">Interested</SelectItem>
                    <SelectItem value="Enrolled">Enrolled</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100">
                  <LinkedInButton url={contact.linkedin_url} />
                  <EmailButton email={contact.email} contactName={contact.name} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                    onClick={() => onViewMessages(contact)}
                    title="View Messages"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}


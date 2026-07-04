'use client'

import { ImportSummary } from '@/types/contact'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Download, ChevronLeft, ChevronRight, FileX } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'

interface ImportHistoryTableProps {
  imports: ImportSummary[]
  page: number
  totalPages: number
  onPageChange: (newPage: number) => void
}

export function ImportHistoryTable({ imports, page, totalPages, onPageChange }: ImportHistoryTableProps) {
  const downloadErrors = (importRecord: ImportSummary) => {
    if (!importRecord.error_details || importRecord.error_details.length === 0) return

    const rows = importRecord.error_details.map(err => {
      return `"${err.row}","${err.error.replace(/"/g, '""')}","${JSON.stringify(err.data).replace(/"/g, '""')}"`
    })

    const csvContent = ['"Row","Error","Original Data"', ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `errors_${importRecord.file_name}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (imports.length === 0) {
    return <EmptyState title="No import history" description="Files you upload will appear here along with their success or failure status." icon={<FileX className="w-8 h-8 text-muted-foreground" />} />
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Imported</TableHead>
              <TableHead className="text-right">Skipped</TableHead>
              <TableHead className="text-right">Errors</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {imports.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{record.file_name}</TableCell>
                <TableCell>{new Date(record.created_at).toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={record.status === 'completed' ? 'default' : record.status === 'processing' ? 'secondary' : 'destructive'}>
                    {record.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-green-600 font-medium">{record.imported_count}</TableCell>
                <TableCell className="text-right text-yellow-600 font-medium">{record.skipped_count}</TableCell>
                <TableCell className="text-right text-red-600 font-medium">{record.total_errors}</TableCell>
                <TableCell className="text-right">
                  {record.error_details && record.error_details.length > 0 && (
                    <Button variant="outline" size="sm" onClick={() => downloadErrors(record)}>
                      <Download className="w-4 h-4 mr-1" /> Errors
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <div className="text-sm px-2">Page {page} of {totalPages}</div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}

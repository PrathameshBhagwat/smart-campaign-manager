'use client'

import { useState, useCallback } from 'react'
import { UploadCloud, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UploadZoneProps {
  onUpload: (file: File) => Promise<void>
}

export function UploadZone({ onUpload }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      await processFile(file)
    }
  }, [onUpload])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await processFile(file)
    }
  }

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('Only .csv, .xls, and .xlsx files are supported')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }
    
    setIsUploading(true)
    try {
      await onUpload(file)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${
        isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="p-3 bg-primary/10 rounded-full">
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          ) : (
            <UploadCloud className="w-8 h-8 text-primary" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold">Upload Contacts</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
            Drag and drop your .csv or .xlsx file here, or click to browse. Max size 10MB.
          </p>
        </div>
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".csv, .xls, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          onChange={handleFileSelect}
          disabled={isUploading}
        />
        <Button onClick={() => document.getElementById('file-upload')?.click()} disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Select File'}
        </Button>
      </div>
    </div>
  )
}

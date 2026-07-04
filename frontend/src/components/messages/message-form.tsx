'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Message, MessageCreate, MessageUpdate } from '@/types/message'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

const formSchema = z.object({
  channel: z.enum(['linkedin', 'whatsapp', 'email']),
  content: z.string()
    .min(10, 'Message must be at least 10 characters long.')
    .max(2000, 'Message must be 2000 characters or fewer.')
})

type FormData = z.infer<typeof formSchema>

interface MessageFormProps {
  initialData?: Message | null
  onSubmit: (data: MessageCreate | MessageUpdate) => Promise<void>
  onCancel: () => void
}

export function MessageForm({ initialData, onSubmit, onCancel }: MessageFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!initialData

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      channel: initialData?.channel || 'linkedin',
      content: initialData?.content || ''
    }
  })

  const { register, handleSubmit, formState: { errors }, watch, setValue } = form
  const contentValue = watch('content')

  const onSubmitForm = async (values: FormData) => {
    setIsSubmitting(true)
    try {
      if (isEditing) {
        const updateData: MessageUpdate = {}
        if (values.content !== initialData?.content) updateData.content = values.content
        if (values.channel !== initialData?.channel) updateData.channel = values.channel
        await onSubmit(updateData)
      } else {
        await onSubmit(values as MessageCreate)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="channel">Channel</Label>
        <Select 
          value={watch('channel')} 
          onValueChange={(val) => { if (val) setValue('channel', val as 'linkedin' | 'whatsapp' | 'email') }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="linkedin">LinkedIn</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="email">Email</SelectItem>
          </SelectContent>
        </Select>
        {errors.channel && <p className="text-xs text-destructive">{errors.channel.message}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="content">Message Content</Label>
          <span className={`text-xs ${(contentValue?.length || 0) > 2000 ? 'text-destructive' : 'text-muted-foreground'}`}>
            {contentValue?.length || 0}/2000
          </span>
        </div>
        <Textarea
          id="content"
          placeholder="Write your outreach message here..."
          {...register('content')}
          rows={6}
          className="resize-none"
        />
        {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isEditing ? 'Update Message' : 'Create Message'}
        </Button>
      </div>
    </form>
  )
}

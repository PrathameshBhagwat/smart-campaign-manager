'use client'

import { useState, useEffect, useCallback } from 'react'
import { Message, MessageCreate, MessageUpdate } from '@/types/message'
import { MessageService } from '@/services/message.service'
import { MessageCard } from '@/components/messages/message-card'
import { MessageForm } from '@/components/messages/message-form'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

import { Contact } from '@/types/contact'
import { LinkedInButton } from '@/components/contacts/LinkedInButton'
import { EmailButton } from '@/components/contacts/EmailButton'

interface MessageListProps {
  contact: Contact
}

export function MessageList({ contact }: MessageListProps) {
  const contactId = contact.id
  const contactName = contact.name

  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await MessageService.getMessages(contactId)
      setMessages(data.messages)
    } catch (error: any) {
      toast.error(error.message || 'Failed to load messages')
    } finally {
      setIsLoading(false)
    }
  }, [contactId])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  const handleCreate = async (data: MessageCreate | MessageUpdate) => {
    try {
      await MessageService.createMessage(contactId, data as MessageCreate)
      toast.success('Message created successfully')
      setShowForm(false)
      fetchMessages()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create message')
    }
  }

  const handleUpdate = async (data: MessageCreate | MessageUpdate) => {
    if (!editingMessage) return
    try {
      await MessageService.updateMessage(editingMessage.id, data as MessageUpdate)
      toast.success('Message updated successfully')
      setEditingMessage(null)
      fetchMessages()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update message')
    }
  }

  const handleCopy = async (messageId: string) => {
    setMessages(prev =>
      prev.map(m =>
        m.id === messageId
          ? { ...m, copied_count: m.copied_count + 1, last_copied_at: new Date().toISOString() }
          : m
      )
    )
    try {
      await MessageService.copyMessage(messageId)
      toast.success('Message copied to clipboard')
    } catch (error: any) {
      setMessages(prev =>
        prev.map(m =>
          m.id === messageId
            ? { ...m, copied_count: m.copied_count - 1 }
            : m
        )
      )
      toast.error(error.message || 'Failed to record copy')
    }
  }

  const handleDelete = async (messageId: string) => {
    const previousMessages = [...messages]
    setMessages(prev => prev.filter(m => m.id !== messageId))
    try {
      await MessageService.deleteMessage(messageId)
      toast.success('Message deleted')
    } catch (error: any) {
      setMessages(previousMessages)
      toast.error(error.message || 'Failed to delete message')
    }
  }

  const handleEdit = (message: Message) => {
    setEditingMessage(message)
    setShowForm(false)
  }

  const [loadingText, setLoadingText] = useState('Analyzing contact profile...')

  useEffect(() => {
    if (isGeneratingAI) {
      setLoadingText('Analyzing contact profile...')
      const timer = setTimeout(() => {
        setLoadingText('Creating personalized message...')
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isGeneratingAI])

  const [cachedIds, setCachedIds] = useState<Set<string>>(new Set())

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true)
    try {
      // We will generate for linkedin by default for the AI outreach feature unless specified
      const res = await MessageService.generateMessage(contactId, 'linkedin')
      toast.success('AI message generated successfully')
      if (res.cached && res.message?.id) {
        setCachedIds(prev => new Set(prev).add(res.message.id))
      }
      fetchMessages()
    } catch (error: any) {
      toast.error(error.message || 'Unable to generate message right now. Please try again.')
    } finally {
      setIsGeneratingAI(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const handleCopyNote = async () => {
    const note = `Hi ${contactName.split(' ')[0]},\nI came across your profile and would love to connect.`
    try {
      await navigator.clipboard.writeText(note)
      toast.success('Connection note copied to clipboard')
    } catch {
      toast.error('Failed to copy note')
    }
  }

  const hasAIMessage = messages.some(m => m.generation_source === 'ai')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          {messages.length} {messages.length === 1 ? 'message' : 'messages'} for {contactName}
        </h3>
        <div className="flex items-center gap-2">
          {contact.linkedin_url && (
            <Button variant="outline" size="sm" onClick={handleCopyNote} title="Copy LinkedIn Connection Note">
              Copy Note
            </Button>
          )}
          <LinkedInButton url={contact.linkedin_url} />
          <EmailButton email={contact.email} messages={messages} contactName={contactName} />
        </div>
      </div>
      
      <div className="flex items-center justify-end border-b pb-4">
        <div className="flex items-center gap-2">
          {!hasAIMessage && (
            <Button 
              size="sm" 
              variant="secondary"
              onClick={handleGenerateAI} 
              disabled={isGeneratingAI}
            >
              {isGeneratingAI ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {loadingText}</>
              ) : (
                <>Generate AI Message</>
              )}
            </Button>
          )}
          {!showForm && !editingMessage && (
            <Button size="sm" onClick={() => setShowForm(true)} disabled={isGeneratingAI}>
              <Plus className="w-4 h-4 mr-1" /> New Message
            </Button>
          )}
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="rounded-lg border bg-muted/20 p-4">
          <h4 className="text-sm font-semibold mb-3">Create Message</h4>
          <MessageForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {/* Edit Form */}
      {editingMessage && (
        <div className="rounded-lg border bg-muted/20 p-4">
          <h4 className="text-sm font-semibold mb-3">Edit Message</h4>
          <MessageForm
            initialData={editingMessage}
            onSubmit={handleUpdate}
            onCancel={() => setEditingMessage(null)}
          />
        </div>
      )}

      {/* Message Cards */}
      {messages.length === 0 ? (
        <EmptyState
          title="No messages yet"
          description="Create a message manually."
          icon={<MessageSquare className="w-8 h-8 text-muted-foreground" />}
        />
      ) : (
        <div className="space-y-3">
          {messages.map(message => (
            <MessageCard
              key={message.id}
              message={message}
              onCopy={handleCopy}
              onEdit={handleEdit}
              onDelete={handleDelete}
              disabled={isGeneratingAI}
              cached={cachedIds.has(message.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

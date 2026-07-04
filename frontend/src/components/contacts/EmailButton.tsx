import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'
import { Message } from '@/types/message'
import { toast } from 'sonner'

interface EmailButtonProps {
  email?: string | null
  messages?: Message[]
  contactName?: string
}

export function EmailButton({ email, messages = [], contactName = '' }: EmailButtonProps) {
  if (!email) {
    return (
      <Button variant="outline" size="sm" disabled className="h-8 text-xs opacity-50" title="Email unavailable">
        <Mail className="w-3.5 h-3.5 mr-1" />
        No Email
      </Button>
    )
  }

  // Validate email minimally
  if (!email.includes('@')) {
    return (
      <Button variant="outline" size="sm" disabled className="h-8 text-xs opacity-50 text-red-500" title="Invalid email address">
        <Mail className="w-3.5 h-3.5 mr-1" />
        Invalid Email
      </Button>
    )
  }

  const handleLaunch = () => {
    try {
      // Find latest ready AI email message
      let targetMessage = messages.find(m => m.channel === 'email' && m.status === 'ready' && m.generation_source === 'ai')
      
      // Fallback 1: Latest Manual Email Message
      if (!targetMessage) {
        targetMessage = messages.find(m => m.channel === 'email' && m.status === 'ready' && m.generation_source === 'manual')
      }

      let subject = 'Professional Opportunity'
      let body = `Hi ${contactName || 'there'},\n\nI hope you're doing well.\n\nRegards`

      if (targetMessage) {
        // Assume first line or two can be extracted as subject, or just default.
        // For simplicity, we use default subject since messages.content doesn't separate subject/body natively right now
        // But if the body has "Subject: ", we could parse it.
        const contentLines = targetMessage.content.split('\n')
        if (contentLines[0].toLowerCase().startsWith('subject:')) {
          subject = contentLines[0].replace(/subject:/i, '').trim()
          body = contentLines.slice(1).join('\n').trim()
        } else {
          body = targetMessage.content
        }
      }

      const safeBody = body.substring(0, 5000)
      const encodedSubject = encodeURIComponent(subject)
      const encodedBody = encodeURIComponent(safeBody)
      
      const mailtoUrl = `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`
      window.location.href = mailtoUrl
    } catch (e) {
      toast.error('Unable to launch email client.')
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="h-8 text-xs hover:bg-orange-50 hover:text-orange-700 dark:hover:bg-orange-900/20"
      onClick={handleLaunch}
      title="Compose Email"
    >
      <Mail className="w-3.5 h-3.5 mr-1" />
      Email
    </Button>
  )
}

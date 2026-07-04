import { Button } from '@/components/ui/button'
import { Link } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface LinkedInButtonProps {
  url?: string | null
}

export function LinkedInButton({ url }: LinkedInButtonProps) {
  const { toast } = useToast()

  if (!url) {
    return (
      <Button variant="outline" size="sm" disabled className="h-8 text-xs opacity-50" title="No Profile">
        <Link className="w-3.5 h-3.5 mr-1" />
        No Profile
      </Button>
    )
  }

  try {
    new URL(url)
  } catch (e) {
    return (
      <Button variant="outline" size="sm" disabled className="h-8 text-xs opacity-50 text-red-500" title="Invalid LinkedIn URL">
        <Link className="w-3.5 h-3.5 mr-1" />
        Invalid URL
      </Button>
    )
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
      onClick={() => {
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
        if (!newWindow) {
          toast({ variant: 'destructive', description: 'Unable to open profile. Please allow popups.' })
        }
      }}
      title="Open LinkedIn Profile"
    >
      <Link className="w-3.5 h-3.5 mr-1" />
      Open LinkedIn
    </Button>
  )
}

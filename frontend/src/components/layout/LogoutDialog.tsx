'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LogOut, Coffee, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface LogoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogoutDialog({ open, onOpenChange }: LogoutDialogProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      
      onOpenChange(false);
      setIsLoggingOut(false);
      toast.success('Successfully logged out. See you next time!', {
        icon: <Sparkles className="w-4 h-4 text-primary" />,
      });
      
      // Force a full browser reload to /login to completely clear client state and cache
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
      setIsLoggingOut(false);
      toast.error('Failed to log out. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Coffee className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">Calling it a day?</DialogTitle>
          <DialogDescription className="text-center">
            You've done great work today! You generated <strong>24 messages</strong> and reviewed <strong>3 campaigns</strong>. 
            <br/><br/>
            Are you sure you want to log out?
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex sm:justify-center gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoggingOut}>
            Cancel, keep working
          </Button>
          <Button variant="default" onClick={handleLogout} disabled={isLoggingOut} className="gap-2 bg-primary hover:bg-primary/90">
            {isLoggingOut ? 'Logging out...' : (
              <>
                <LogOut className="w-4 h-4" />
                Yes, log out
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

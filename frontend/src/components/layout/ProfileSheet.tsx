'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Trophy, TrendingUp, Mail, Save, User as UserIcon, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileSheet({ open, onOpenChange }: ProfileSheetProps) {
  const [signature, setSignature] = useState('Best regards,\nYour Name\nCEO, Example Corp');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSignature = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Global signature saved successfully');
    }, 600);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold flex items-center gap-2">
            <UserIcon className="w-6 h-6 text-primary" /> My Profile
          </SheetTitle>
          <SheetDescription>
            View your stats and manage global defaults.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-8">
          {/* Avatar and Level Badge */}
          <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-2xl border">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-primary-foreground font-bold text-4xl shadow-lg">
                JD
              </div>
              <div className="absolute -bottom-3 -right-3 bg-background rounded-full p-1.5 shadow-md">
                <div className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Trophy className="w-3 h-3" /> Lvl 5
                </div>
              </div>
            </div>
            <h3 className="mt-6 font-bold text-lg">John Doe</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <Mail className="w-3.5 h-3.5" /> john@example.com
            </p>
          </div>

          {/* Gamified Stats Heatmap / Cards */}
          <div>
            <h4 className="font-semibold text-sm mb-3 text-foreground/80 uppercase tracking-wider">Weekly Activity</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex flex-col items-center text-center">
                <TrendingUp className="w-5 h-5 text-primary mb-2" />
                <span className="text-2xl font-bold text-primary">142</span>
                <span className="text-xs text-muted-foreground">Messages Sent</span>
              </div>
              <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10 flex flex-col items-center text-center">
                <Calendar className="w-5 h-5 text-blue-500 mb-2" />
                <span className="text-2xl font-bold text-blue-500">12</span>
                <span className="text-xs text-muted-foreground">Active Campaigns</span>
              </div>
            </div>
          </div>

          {/* Global Signature Setup */}
          <div className="pt-2">
            <h4 className="font-semibold text-sm mb-3 text-foreground/80 uppercase tracking-wider">Global Email Signature</h4>
            <div className="space-y-3">
              <Textarea 
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Type your global signature here..."
                rows={4}
                className="resize-none"
              />
              <Button onClick={handleSaveSignature} disabled={isSaving} className="w-full gap-2">
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Signature'}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

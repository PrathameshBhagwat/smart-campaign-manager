'use client';

import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trophy, TrendingUp, Mail, Save, User as UserIcon, Calendar, Briefcase, Building } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';

interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileSheet({ open, onOpenChange }: ProfileSheetProps) {
  const { user } = useAuth();
  
  const [name, setName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [signature, setSignature] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && user) {
      setName(user.user_metadata?.name || user.user_metadata?.full_name || '');
      setJobTitle(localStorage.getItem('profile_job_title') || 'Outreach Specialist');
      setCompany(localStorage.getItem('profile_company') || 'My Organization');
      setSignature(localStorage.getItem('profile_signature') || `Best regards,\n${user.user_metadata?.name || 'Your Name'}\nCEO, Example Corp`);
    }
  }, [open, user]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // 1. Update Supabase Metadata
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: { name: name }
      });
      
      if (error) throw error;

      // 2. Update localStorage Settings
      localStorage.setItem('profile_job_title', jobTitle);
      localStorage.setItem('profile_company', company);
      localStorage.setItem('profile_signature', signature);

      toast.success('Profile updated successfully');
      
      // Auto-close sheet after save with a tiny delay
      setTimeout(() => onOpenChange(false), 300);
    } catch (e: any) {
      toast.error(e.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (userName: string) => {
    return userName
      ? userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      : 'U';
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold flex items-center gap-2">
            <UserIcon className="w-6 h-6 text-primary" /> My Profile
          </SheetTitle>
          <SheetDescription>
            Manage your personal details and global signature template.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 pb-6">
          {/* Avatar and Level Card */}
          <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-muted/50 to-muted/20 rounded-2xl border border-muted/50">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-primary-foreground font-bold text-3xl shadow-lg">
                {getInitials(name || user?.email || '')}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-1 shadow-sm">
                <div className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Trophy className="w-3 h-3" /> Lvl 5
                </div>
              </div>
            </div>
            <h3 className="mt-4 font-bold text-lg text-foreground">{name || 'Your Name'}</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Mail className="w-3.5 h-3.5" /> {user?.email}
            </p>
          </div>

          {/* Gamified Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex flex-col items-center text-center">
              <TrendingUp className="w-5 h-5 text-primary mb-1.5" />
              <span className="text-xl font-bold text-primary">142</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Messages Sent</span>
            </div>
            <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10 flex flex-col items-center text-center">
              <Calendar className="w-5 h-5 text-blue-500 mb-1.5" />
              <span className="text-xl font-bold text-blue-500">12</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Active Campaigns</span>
            </div>
          </div>

          <hr className="border-muted/60" />

          {/* Edit Profile Form */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-foreground/80 uppercase tracking-wider">Edit Profile</h4>
            
            <div className="space-y-1.5">
              <Label htmlFor="profile-name">Full Name</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-job">Job Title</Label>
              <div className="relative">
                <Briefcase className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="profile-job"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Sales Director"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-company">Company</Label>
              <div className="relative">
                <Building className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="profile-company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <hr className="border-muted/60" />

          {/* Global Signature Setup */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-foreground/80 uppercase tracking-wider">Email Signature</h4>
            <Textarea 
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Type your signature..."
              rows={4}
              className="resize-none"
            />
          </div>

          <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full gap-2 mt-4 shadow-sm">
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Profile Details'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

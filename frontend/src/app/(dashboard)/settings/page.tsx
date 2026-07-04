'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from 'next-themes';
import { Save, Bell, Monitor, Zap, Globe, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [preferences, setPreferences] = useState({
    language: 'en',
    reducedMotion: false,
    defaultProvider: 'openai',
    defaultChannel: 'linkedin',
    autoGenerate: true,
  });

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('app-preferences');
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('app-preferences', JSON.stringify(preferences));
    toast.success('Preferences saved successfully');
  };

  if (!mounted) return null;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b"
      >
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and defaults.
          </p>
        </div>
        <Button onClick={handleSave} className="gap-2 shrink-0">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </motion.div>

      <div className="grid gap-6">
        <SettingSection title="Appearance" icon={<Monitor className="w-5 h-5 text-primary" />}>
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
              <div className="space-y-0.5">
                <Label className="text-base">Theme Preference</Label>
                <p className="text-sm text-muted-foreground">Select your interface theme</p>
              </div>
              <Select value={theme} onValueChange={(val) => val && setTheme(val)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
              <div className="space-y-0.5">
                <Label className="text-base">Reduced Motion</Label>
                <p className="text-sm text-muted-foreground">Disable unnecessary animations</p>
              </div>
              <Switch 
                checked={preferences.reducedMotion}
                onCheckedChange={(c) => setPreferences({ ...preferences, reducedMotion: c })}
              />
            </div>
          </div>
        </SettingSection>

        <SettingSection title="AI Defaults" icon={<Zap className="w-5 h-5 text-primary" />}>
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
              <div className="space-y-0.5">
                <Label className="text-base">Default Provider</Label>
                <p className="text-sm text-muted-foreground">The AI model used for generation</p>
              </div>
              <Select 
                value={preferences.defaultProvider} 
                onValueChange={(v) => v && setPreferences({ ...preferences, defaultProvider: v })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI (GPT-4o)</SelectItem>
                  <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                  <SelectItem value="google">Google (Gemini)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
              <div className="space-y-0.5">
                <Label className="text-base">Auto-Generate Mode</Label>
                <p className="text-sm text-muted-foreground">Generate draft messages immediately after import</p>
              </div>
              <Switch 
                checked={preferences.autoGenerate}
                onCheckedChange={(c) => setPreferences({ ...preferences, autoGenerate: c })}
              />
            </div>
          </div>
        </SettingSection>

        <SettingSection title="Regional" icon={<Globe className="w-5 h-5 text-primary" />}>
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
            <div className="space-y-0.5">
              <Label className="text-base">Language</Label>
              <p className="text-sm text-muted-foreground">Interface and AI prompt language</p>
            </div>
            <Select 
              value={preferences.language} 
              onValueChange={(v) => v && setPreferences({ ...preferences, language: v })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English (US)</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </SettingSection>
      </div>
    </div>
  );
}

function SettingSection({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="space-y-4"
    >
      <h3 className="text-lg font-semibold flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {children}
    </motion.section>
  );
}

'use client';

import * as React from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { Search, Plus, Upload, Play, LayoutDashboard, FileText, BarChart } from 'lucide-react';
import './CommandBar.css';

export function CommandBar() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  if (!open) return null;

  return (
    <div className="cmdk-overlay z-50">
      <div className="cmdk-dialog">
        <Command label="Global Command Menu" loop>
          <div className="flex items-center px-3 border-b cmdk-input-wrapper">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <Command.Input autoFocus placeholder="Type a command or search..." />
          </div>
          <Command.List className="p-2 h-[300px] overflow-y-auto">
            <Command.Empty className="p-4 text-center text-sm text-muted-foreground">No results found.</Command.Empty>

            <Command.Group heading="Quick Actions">
              <Command.Item onSelect={() => runCommand(() => router.push('/campaigns'))}>
                <Plus className="mr-2 h-4 w-4" /> Create Campaign
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => router.push('/contacts'))}>
                <Upload className="mr-2 h-4 w-4" /> Import Contacts
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => router.push('/messages'))}>
                <Play className="mr-2 h-4 w-4" /> Generate AI
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Navigation">
              <Command.Item onSelect={() => runCommand(() => router.push('/dashboard'))}>
                <LayoutDashboard className="mr-2 h-4 w-4" /> Go to Dashboard
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => router.push('/templates'))}>
                <FileText className="mr-2 h-4 w-4" /> Open Templates
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => router.push('/analytics'))}>
                <BarChart className="mr-2 h-4 w-4" /> Open Analytics
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

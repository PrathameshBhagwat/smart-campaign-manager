'use client';

import { Search, Bell, User, Settings, LogOut } from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePathname, useRouter } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ProfileSheet } from './ProfileSheet';
import { LogoutDialog } from './LogoutDialog';
import { useState } from 'react';

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  
  const isUUID = (str: string) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
  };

  const breadcrumbs = pathname?.split('/').filter(Boolean).map(p => {
    if (isUUID(p)) return 'Details';
    return p.charAt(0).toUpperCase() + p.slice(1);
  }) || ['Dashboard'];

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      
      {/* Left side: Breadcrumbs */}
      <div className="flex items-center gap-2 ml-10 md:ml-0 text-sm font-medium text-muted-foreground">
        {breadcrumbs.map((crumb, idx) => (
          <div key={idx} className="flex items-center gap-2">
            {idx > 0 && <span>/</span>}
            <span className={idx === breadcrumbs.length - 1 ? 'text-foreground' : ''}>
              {crumb}
            </span>
          </div>
        ))}
      </div>

      {/* Right side: Search, Theme, Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        
        {/* Command Palette Trigger */}
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search... (Ctrl+K)" 
            className="pl-9 bg-muted/50 border-none h-9 text-sm focus-visible:ring-1"
            readOnly
          />
        </div>

        <Button variant="ghost" size="icon" className="md:hidden">
          <Search className="w-5 h-5" />
        </Button>

        <ThemeSwitcher />
        
        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="relative" />}>
            <Bell className="w-5 h-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <div className="p-4 text-sm text-center text-muted-foreground">
              No new notifications
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="rounded-full bg-muted overflow-hidden" />}>
            <User className="w-5 h-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-danger focus:bg-danger/10 focus:text-danger"
              onClick={() => setIsLogoutOpen(true)}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ProfileSheet open={isProfileOpen} onOpenChange={setIsProfileOpen} />
      <LogoutDialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen} />
    </header>
  );
}

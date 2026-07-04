'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { LogOut, LayoutDashboard, Users, BookOpen } from 'lucide-react'

export function Navbar() {
  const { user, loading, signOut } = useAuth()

  return (
    <nav className="border-b bg-background">
      <div className="flex h-16 items-center px-4 max-w-7xl mx-auto w-full justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            AI Outreach
          </Link>
          
          {user && (
            <div className="hidden md:flex gap-4">
              <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link href="/campaigns" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                <Users className="h-4 w-4" />
                Campaigns
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground hidden sm:inline-block">
                    {user.email}
                  </span>
                  <Button variant="outline" size="sm" onClick={signOut} className="gap-2">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">Login</Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

'use client';

import { MessageSquare, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function MessagesPage() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Global Messages</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage all AI-generated messages</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center p-12 bg-card border rounded-xl shadow-sm text-center min-h-[400px]"
      >
        <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
          <MessageSquare className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">View Messages by Contact</h3>
        <p className="text-muted-foreground max-w-md mb-8">
          Messages are tied directly to contacts within your campaigns. 
          To view or generate messages, please navigate to a campaign and select a contact.
        </p>
        <Link href="/campaigns">
          <Button className="flex items-center gap-2">
            Go to Campaigns <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}

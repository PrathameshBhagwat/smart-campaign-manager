'use client';

import { Campaign } from '@/types/campaign';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Eye, Book, TrendingUp, Building, Users, Rocket } from 'lucide-react';
import Link from 'next/link';

interface Props {
  campaign: Campaign;
  onEdit: (campaign: Campaign) => void;
  onDelete: (campaign: Campaign) => void;
}

export function CampaignCard({ campaign, onEdit, onDelete }: Props) {
  const getIcon = () => {
    switch (campaign.business_type?.toLowerCase()) {
      case 'education': return <Book className="w-6 h-6 text-indigo-500" />;
      case 'finance': return <TrendingUp className="w-6 h-6 text-emerald-500" />;
      case 'real_estate': return <Building className="w-6 h-6 text-amber-500" />;
      case 'recruitment': return <Users className="w-6 h-6 text-purple-500" />;
      default: return <Rocket className="w-6 h-6 text-blue-500" />;
    }
  };

  const getBadgeColor = () => {
    switch (campaign.business_type?.toLowerCase()) {
      case 'education': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
      case 'finance': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'real_estate': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'recruitment': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-card rounded-xl border p-5 shadow-sm hover:shadow-md transition-all group flex flex-col"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-muted rounded-lg">
            {getIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground line-clamp-1">{campaign.name}</h3>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${getBadgeColor()}`}>
              {campaign.business_type ? campaign.business_type.charAt(0).toUpperCase() + campaign.business_type.slice(1).replace('_', ' ') : 'Generic'}
            </span>
          </div>
        </div>
        
        {/* Quick Actions (Fade in on hover on desktop, always visible on mobile) */}
        <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" onClick={() => onEdit(campaign)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(campaign)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 mb-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {campaign.offering_name || campaign.course_name} • {campaign.city}
        </p>
      </div>

      <div className="pt-4 border-t flex items-center justify-between mt-auto">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">Created</span>
            <span className="font-medium text-foreground">{new Date(campaign.created_at).toLocaleDateString()}</span>
          </div>
          {/* Mock metrics until backend includes them in list */}
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">Success Rate</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">TBD</span>
          </div>
        </div>
        
        <Link href={`/campaigns/${campaign.id}`}>
          <Button size="sm" className="gap-2">
            <Eye className="w-4 h-4" />
            View
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

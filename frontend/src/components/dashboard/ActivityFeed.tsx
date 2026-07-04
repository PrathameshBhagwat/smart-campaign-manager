'use client';

import { ActivityItem } from '@/types/dashboard';
import { Bot, FileText, CheckCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  activities: ActivityItem[];
}

export default function ActivityFeed({ activities }: Props) {
  if (!activities || activities.length === 0) {
    return (
      <div className="bg-card p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
        <p className="text-muted-foreground text-sm">No recent activities found.</p>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'generation': return <Bot className="h-4 w-4 text-purple-500" />;
      case 'import': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'bulk_generation': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="bg-card p-6 rounded-xl border shadow-sm">
      <h3 className="text-lg font-semibold text-foreground mb-6">Recent Activity</h3>
      
      <div className="space-y-6">
        {activities.map((item, index) => {
          let timeAgo = 'Just now';
          try {
            timeAgo = formatDistanceToNow(new Date(item.created_at), { addSuffix: true });
          } catch(e) {}
          
          return (
            <div key={index} className="flex gap-4">
              <div className="mt-1 h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                {getIcon(item.type)}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{item.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface Props {
  onAction?: () => void;
}

export function NoAnalytics({ onAction }: Props) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 text-center h-[50vh] border rounded-2xl bg-card border-dashed"
    >
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <BarChart3 className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">Analytics Not Available</h3>
      <p className="text-muted-foreground max-w-md mx-auto mb-8">
        Run your first campaign to start gathering insights on cost, quality, and engagement metrics.
      </p>
      {onAction && (
        <Button onClick={onAction} className="gap-2">
          Go to Campaigns
        </Button>
      )}
    </motion.div>
  );
}

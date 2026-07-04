import { Rocket, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface Props {
  onAction?: () => void;
}

export function NoCampaigns({ onAction }: Props) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 text-center h-[50vh] border rounded-2xl bg-card border-dashed"
    >
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Rocket className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">Launch Your First Campaign</h3>
      <p className="text-muted-foreground max-w-md mx-auto mb-8">
        Create outreach campaigns to manage contacts, generate AI messages, and scale your sales pipeline effectively.
      </p>
      {onAction && (
        <Button onClick={onAction} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Campaign
        </Button>
      )}
    </motion.div>
  );
}

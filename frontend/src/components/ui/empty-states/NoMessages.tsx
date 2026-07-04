import { MessageSquare, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface Props {
  onAction?: () => void;
}

export function NoMessages({ onAction }: Props) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 text-center h-[50vh] border rounded-2xl bg-card border-dashed"
    >
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <MessageSquare className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">No Messages Generated</h3>
      <p className="text-muted-foreground max-w-md mx-auto mb-8">
        Let the AI do the heavy lifting. Select your contacts and generate highly personalized outreach messages in seconds.
      </p>
      {onAction && (
        <Button onClick={onAction} className="gap-2">
          <Play className="w-4 h-4" />
          Generate Messages
        </Button>
      )}
    </motion.div>
  );
}

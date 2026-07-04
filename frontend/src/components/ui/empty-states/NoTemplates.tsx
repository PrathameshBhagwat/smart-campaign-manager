import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface Props {
  onAction?: () => void;
}

export function NoTemplates({ onAction }: Props) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 text-center h-[50vh] border rounded-2xl bg-card border-dashed"
    >
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <FileText className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">No Templates Available</h3>
      <p className="text-muted-foreground max-w-md mx-auto mb-8">
        Create reusable prompt templates to ensure consistent quality and tone across all your AI generation tasks.
      </p>
      {onAction && (
        <Button onClick={onAction} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Template
        </Button>
      )}
    </motion.div>
  );
}

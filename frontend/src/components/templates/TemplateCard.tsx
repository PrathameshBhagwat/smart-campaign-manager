'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit2, Copy, Trash2, Book, TrendingUp, Building, Users, Rocket, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface Template {
  id: string;
  name: string;
  content: string;
  business_type?: string;
  channel?: string;
  usage_count?: number;
  version?: number;
}

export function TemplateCard({ template }: { template: Template }) {
  const [previewOpen, setPreviewOpen] = useState(false);

  const getIcon = () => {
    switch (template.business_type?.toLowerCase()) {
      case 'education': return <Book className="w-5 h-5 text-indigo-500" />;
      case 'finance': return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      case 'real_estate': return <Building className="w-5 h-5 text-amber-500" />;
      case 'recruitment': return <Users className="w-5 h-5 text-purple-500" />;
      default: return <Rocket className="w-5 h-5 text-blue-500" />;
    }
  };

  // Safe live rendering for preview (replaces {{var}} with "...")
  const safeRender = (content: string) => {
    try {
      return content.replace(/\{\{([^}]+)\}\}/g, (match, p1) => {
        return `<span class="bg-primary/20 text-primary px-1 rounded mx-0.5 text-xs font-mono">${p1}</span>`;
      });
    } catch {
      return content;
    }
  };

  return (
    <>
      <motion.div 
        whileHover={{ y: -4 }}
        className="bg-card rounded-xl border p-5 shadow-sm hover:shadow-md transition-all flex flex-col group"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              {getIcon()}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground line-clamp-1">{template.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                {template.business_type && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {template.business_type.charAt(0).toUpperCase() + template.business_type.slice(1).replace('_', ' ')}
                  </span>
                )}
                <span className="text-xs text-muted-foreground border px-2 py-0.5 rounded-full">
                  v{template.version || 1}.0
                </span>
              </div>
            </div>
          </div>
          
          <Badge variant="outline" className="capitalize shrink-0 bg-background">{template.channel || 'All'}</Badge>
        </div>

        <div className="flex-1 mb-4 bg-muted/30 rounded-lg p-3 border relative overflow-hidden group/preview">
          <p className="text-sm text-muted-foreground line-clamp-3 font-mono text-xs">
            {template.content}
          </p>
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end justify-center pb-2 opacity-0 group-hover/preview:opacity-100 transition-opacity">
            <Button size="sm" variant="secondary" onClick={() => setPreviewOpen(true)} className="h-7 text-xs shadow-sm">
              <Eye className="w-3 h-3 mr-1" /> Live Preview
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t flex items-center justify-between mt-auto">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            Used {template.usage_count || 0} times
          </div>
          
          <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Live Preview: {template.name}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 p-4 bg-muted/30 rounded-lg border text-sm leading-relaxed whitespace-pre-wrap font-sans" dangerouslySetInnerHTML={{ __html: safeRender(template.content) }} />
          <div className="flex justify-end mt-4 gap-2">
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Close</Button>
            <Button className="gap-2"><Edit2 className="w-4 h-4" /> Edit Template</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

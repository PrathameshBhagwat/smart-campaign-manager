'use client';

import { DashboardOverview } from '@/types/dashboard';
import { 
  Users, Rocket, Bot, DollarSign, CheckCircle, FileText 
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  overview: DashboardOverview | null;
}

export default function DashboardCards({ overview }: Props) {
  if (!overview) return null;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
    >
      <Card 
        title="Contacts" 
        value={overview.total_contacts} 
        icon={<Users className="h-5 w-5 text-indigo-500" />} 
        variants={item}
      />
      <Card 
        title="Campaigns" 
        value={overview.total_campaigns} 
        icon={<Rocket className="h-5 w-5 text-blue-500" />} 
        variants={item}
      />
      <Card 
        title="AI Messages" 
        value={overview.ai_messages} 
        icon={<Bot className="h-5 w-5 text-purple-500" />} 
        variants={item}
      />
      <Card 
        title="Cost" 
        value={`$${overview.estimated_cost_usd.toFixed(2)}`} 
        icon={<DollarSign className="h-5 w-5 text-yellow-500" />} 
        variants={item}
      />
      <Card 
        title="Success Rate" 
        value={`${overview.success_rate}%`} 
        icon={<CheckCircle className="h-5 w-5 text-emerald-500" />} 
        variants={item}
      />
      <Card 
        title="Templates" 
        value={overview.most_used_templates?.length || 0} 
        icon={<FileText className="h-5 w-5 text-cyan-500" />} 
        variants={item}
      />
    </motion.div>
  );
}

function Card({ title, value, icon, variants }: { title: string; value: string | number; icon: React.ReactNode; variants: any }) {
  return (
    <motion.div 
      variants={variants}
      whileHover={{ y: -4 }}
      className="bg-card p-6 rounded-xl border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="p-2 bg-muted/50 rounded-lg">
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-bold text-foreground">{value}</h3>
    </motion.div>
  );
}

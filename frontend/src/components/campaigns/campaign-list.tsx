'use client'

import { Campaign } from '@/types/campaign'
import { CampaignCard } from './CampaignCard'
import { NoCampaigns } from '@/components/ui/empty-states/NoCampaigns'
import { motion } from 'framer-motion'

interface CampaignListProps {
  campaigns: Campaign[]
  onEdit: (campaign: Campaign) => void
  onDelete: (campaign: Campaign) => void
}

export function CampaignList({ campaigns, onEdit, onDelete }: CampaignListProps) {
  if (campaigns.length === 0) {
    return <NoCampaigns onAction={() => onEdit({} as Campaign)} />
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {campaigns.map((campaign) => (
        <motion.div key={campaign.id} variants={item}>
          <CampaignCard 
            campaign={campaign} 
            onEdit={onEdit} 
            onDelete={onDelete} 
          />
        </motion.div>
      ))}
    </motion.div>
  )
}

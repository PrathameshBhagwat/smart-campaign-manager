'use client';

import { TopCampaign } from '@/types/dashboard';
import { Trophy, Users, Bot, DollarSign } from 'lucide-react';

interface Props {
  campaigns: TopCampaign[];
}

export default function CampaignLeaderboard({ campaigns }: Props) {
  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="bg-card p-6 rounded-xl border shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top Campaigns
        </h3>
        <p className="text-muted-foreground text-sm">No campaigns found.</p>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 rounded-xl border shadow-sm overflow-hidden">
      <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-yellow-500" />
        Top Campaigns
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-muted-foreground">
              <th className="pb-3 font-medium">Rank</th>
              <th className="pb-3 font-medium">Campaign</th>
              <th className="pb-3 font-medium">Contacts</th>
              <th className="pb-3 font-medium">Messages</th>
              <th className="pb-3 font-medium text-right">Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {campaigns.map((camp, idx) => (
              <tr key={idx} className="hover:bg-muted/50 transition-colors">
                <td className="py-4">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-100 text-gray-700' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'text-muted-foreground'}`}>
                    {idx + 1}
                  </span>
                </td>
                <td className="py-4 font-medium text-foreground">{camp.campaign_name}</td>
                <td className="py-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> {camp.contacts}
                  </div>
                </td>
                <td className="py-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Bot className="h-3 w-3" /> {camp.messages}
                  </div>
                </td>
                <td className="py-4 text-foreground text-right font-medium">
                  ${camp.cost.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

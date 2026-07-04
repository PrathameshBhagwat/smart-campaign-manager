import { useEffect, useState } from "react";
import { BulkService } from "@/services/bulk.service";
import { CampaignAIUsageSummary } from "@/types/bulk";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bot, CheckCircle2, Clock, XCircle, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function CampaignAISummaryCard({ campaignId }: { campaignId: string }) {
  const [summary, setSummary] = useState<CampaignAIUsageSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, [campaignId]);

  const loadSummary = async () => {
    try {
      const data = await BulkService.getAISummary(campaignId);
      setSummary(data);
    } catch (err) {
      console.error("Failed to load AI summary", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Skeleton className="w-full h-32 rounded-xl" />;
  }

  if (!summary) return null;

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-background border-indigo-100 dark:border-indigo-900/50">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-indigo-500" />
          <CardTitle className="text-lg">AI Generation Summary</CardTitle>
        </div>
        <CardDescription>Overview of AI usage and estimated costs for this campaign</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
          <div>
            <div className="text-sm text-muted-foreground flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500"/> Generated</div>
            <div className="text-2xl font-bold">{summary.generated_messages}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3 text-yellow-500"/> Pending</div>
            <div className="text-2xl font-bold">{summary.pending_generation}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground flex items-center gap-1"><XCircle className="w-3 h-3 text-red-500"/> Failed</div>
            <div className="text-2xl font-bold">{summary.failed_generations}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground flex items-center gap-1"><DollarSign className="w-3 h-3 text-blue-500"/> Est. Cost</div>
            <div className="text-2xl font-bold">${summary.estimated_cost_usd.toFixed(3)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

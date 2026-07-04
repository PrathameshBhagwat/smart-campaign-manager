import { useEffect, useState } from "react";
import { BulkService } from "@/services/bulk.service";
import { BulkJobProgressResponse } from "@/types/bulk";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export function BulkJobHistoryList({ campaignId }: { campaignId: string }) {
  const [jobs, setJobs] = useState<BulkJobProgressResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, [campaignId]);

  const loadJobs = async () => {
    try {
      const data = await BulkService.getJobHistory(campaignId);
      setJobs(data);
    } catch (err) {
      console.error("Failed to load job history", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Skeleton className="w-full h-48 rounded-xl" />;
  }

  if (jobs.length === 0) {
    return <div className="text-center py-8 text-muted-foreground border rounded-md">No bulk generation jobs run yet.</div>;
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell className="whitespace-nowrap text-xs">
                {new Date(job.created_at || job.started_at || new Date().toISOString()).toLocaleString()}
              </TableCell>
              <TableCell className="capitalize">{job.channel}</TableCell>
              <TableCell>
                <Badge variant={
                  job.status === 'completed' ? 'success' :
                  job.status === 'failed' ? 'destructive' : 'secondary'
                } className="capitalize text-[10px]">
                  {job.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="text-xs">
                  {job.completed_contacts} Gen / {job.failed_contacts} Fail / {job.skipped_contacts} Skip
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/campaigns/${campaignId}/bulk-jobs/${job.id}`}>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4 mr-2" /> View Details
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

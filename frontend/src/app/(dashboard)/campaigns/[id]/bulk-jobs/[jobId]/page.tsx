"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BulkService } from "@/services/bulk.service";
import { BulkJobDetailsResponse } from "@/types/bulk";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, XCircle, ArrowLeft, RotateCcw, Clock, Eye } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { MessageList } from "@/components/messages/message-list";
import { Contact } from "@/types/contact";

export default function BulkJobDetailsPage() {
  const { id: campaignId, jobId } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [details, setDetails] = useState<BulkJobDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    loadDetails();
  }, [jobId]);

  const loadDetails = async () => {
    try {
      const data = await BulkService.getJobDetails(jobId as string);
      setDetails(data);
    } catch (err: any) {
      toast({
        title: "Error loading job details",
        description: err.response?.data?.detail || err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    setRetrying(true);
    try {
      const data = await BulkService.retryFailedContacts(jobId as string);
      toast({
        title: "Retry started",
        description: "A new job has been spawned for the failed contacts.",
      });
      router.push(`/campaigns/${campaignId}`);
    } catch (err: any) {
      toast({
        title: "Retry failed",
        description: err.response?.data?.detail || err.message,
        variant: "destructive",
      });
    } finally {
      setRetrying(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading job details...</div>;
  if (!details) return <div className="p-8 text-center text-red-500">Job not found</div>;

  const { summary, generated, skipped, failed } = details;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Bulk Generation Job</h1>
        <Badge variant={
          summary.status === 'completed' ? 'success' :
          summary.status === 'failed' ? 'destructive' : 'secondary'
        } className="ml-auto capitalize text-sm">
          {summary.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.completed_contacts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.failed_contacts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              Skipped
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.skipped_contacts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <div className="font-semibold text-xl">
                {summary.result_summary?.duration_seconds || 0}s <span className="text-xs font-normal text-muted-foreground">total</span>
              </div>
              {summary.average_generation_time_ms && (
                <div className="text-xs text-muted-foreground mt-1">
                  ~{(summary.average_generation_time_ms / 1000).toFixed(2)}s per contact
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="failed" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="failed">Failed ({failed.length})</TabsTrigger>
          <TabsTrigger value="generated">Generated ({generated.length})</TabsTrigger>
          <TabsTrigger value="skipped">Skipped ({skipped.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="failed" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Failed Contacts</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Contacts that failed during AI generation.</p>
              </div>
              {failed.length > 0 && (
                <Button onClick={handleRetry} disabled={retrying}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {retrying ? "Spawning Job..." : "Retry Failed Contacts"}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {failed.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No failed contacts.</div>
              ) : (
                <div className="space-y-4">
                  {failed.map((f) => (
                    <div key={f.contact_id} className="border p-4 rounded-md bg-red-50/50 dark:bg-red-950/20">
                      <div className="font-medium text-red-700 dark:text-red-400">{f.name}</div>
                      <div className="text-sm text-red-600 dark:text-red-300 mt-1 font-mono text-xs">{f.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generated" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {generated.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No generated contacts.</div>
              ) : (
                <div className="space-y-2">
                  {generated.map((g) => (
                    <div key={g.contact_id} className="border p-3 rounded-md flex justify-between items-center bg-green-50/50 dark:bg-green-950/20">
                      <div className="flex items-center gap-4">
                        <span className="font-medium">{g.name}</span>
                        <span className="text-xs text-muted-foreground">{new Date(g.created_at).toLocaleString()}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => {
                        // Cast a partial Contact so we can open the sheet
                        setSelectedContact({ id: g.contact_id, name: g.name } as Contact);
                        setIsSheetOpen(true);
                      }}>
                        <Eye className="w-4 h-4 mr-2" /> View
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skipped" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {skipped.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No skipped contacts.</div>
              ) : (
                <div className="space-y-2">
                  {skipped.map((s) => (
                    <div key={s.contact_id} className="border p-3 rounded-md flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                      <div className="flex items-center gap-4">
                        <span className="font-medium text-muted-foreground">{s.name}</span>
                        <span className="text-xs text-muted-foreground">Already generated</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => {
                        setSelectedContact({ id: s.contact_id, name: s.name } as Contact);
                        setIsSheetOpen(true);
                      }}>
                        <Eye className="w-4 h-4 mr-2" /> View
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Message Sheet Drawer */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Messages for {selectedContact?.name}</SheetTitle>
            <SheetDescription>
              Review or edit messages for this contact
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {selectedContact && (
              <MessageList 
                contact={selectedContact}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

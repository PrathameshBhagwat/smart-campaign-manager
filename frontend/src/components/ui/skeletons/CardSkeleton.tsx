import { Skeleton } from '@/components/ui/skeleton';

export function CardSkeleton() {
  return (
    <div className="p-6 border rounded-xl bg-card space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-10 w-2/3" />
      <div className="pt-4 border-t">
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

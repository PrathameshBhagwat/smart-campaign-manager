import { Skeleton } from '@/components/ui/skeleton';
import { CardSkeleton } from './CardSkeleton';
import { ChartSkeleton } from './ChartSkeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ChartSkeleton height="h-[400px]" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartSkeleton height="h-[300px]" />
            <ChartSkeleton height="h-[300px]" />
          </div>
        </div>
        <div className="space-y-6">
          <ChartSkeleton height="h-[300px]" />
          <div className="border rounded-xl bg-card p-6 h-[500px]">
            <Skeleton className="h-6 w-1/3 mb-6" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Skeleton } from '@/components/ui/skeleton';

export function ChartSkeleton({ height = "h-96" }: { height?: string }) {
  return (
    <div className={`p-6 border rounded-xl bg-card flex flex-col ${height}`}>
      <Skeleton className="h-6 w-1/3 mb-8" />
      <div className="flex-1 flex items-end gap-2 px-4 pb-4">
        {[...Array(12)].map((_, i) => (
          <Skeleton 
            key={i} 
            className="w-full rounded-t-sm" 
            style={{ height: `${Math.max(20, Math.random() * 100)}%` }} 
          />
        ))}
      </div>
    </div>
  );
}

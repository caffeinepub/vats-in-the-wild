import { Skeleton } from "@/components/ui/skeleton";

export function PostCardSkeleton() {
  return (
    <div className="bg-card border border-border overflow-hidden">
      <Skeleton className="aspect-[16/9] w-full" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

export function FeaturedPostSkeleton() {
  return (
    <div className="bg-card border border-border overflow-hidden flex flex-col sm:flex-row">
      <Skeleton className="sm:w-1/3 aspect-[4/3] sm:aspect-auto" />
      <div className="flex-1 p-6 sm:p-8 space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}

export function ArticleSkeleton() {
  return (
    <div
      className="max-w-3xl mx-auto px-4 py-16 space-y-6"
      data-ocid="article.loading_state"
    >
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-3/4" />
      <div className="flex gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="aspect-[16/7] w-full" />
      <div className="space-y-4 pt-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}

export default function LoadingSkeleton({ count = 3 }: { count?: number }) {
  const items = Array.from({ length: count }, (_, i) => i);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((i) => (
        <PostCardSkeleton key={`skeleton-${i}`} />
      ))}
    </div>
  );
}

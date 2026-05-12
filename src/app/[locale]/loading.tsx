import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Hero Banner Skeleton */}
      <section>
        <Skeleton className="w-full h-48 sm:h-56 md:h-64 rounded-2xl" />
      </section>

      {/* Live Match Highlights Skeleton */}
      <section className="flex flex-col gap-4">
        <Skeleton className="h-7 w-36" />
        <div className="flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-64 flex-shrink-0 rounded-xl" />
          ))}
        </div>
      </section>

      {/* Today's Matches Skeleton */}
      <section className="flex flex-col gap-4">
        <Skeleton className="h-7 w-48" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </section>

      {/* AI Match of the Day Skeleton */}
      <section className="flex flex-col gap-4">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-72 rounded-xl" />
      </section>

      {/* Bottom 3-column grid Skeleton */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </section>

      {/* News Section Skeleton */}
      <section className="flex flex-col gap-4">
        <Skeleton className="h-7 w-36" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </section>
    </div>
  );
}

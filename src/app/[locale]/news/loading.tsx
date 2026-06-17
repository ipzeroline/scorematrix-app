import { Skeleton } from "@/components/ui/Skeleton";

export default function NewsLoading() {
  return (
    <div className="space-y-4 pb-6">
      <Skeleton className="h-36 rounded-xl" />
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, index) => (
          <Skeleton key={index} className="h-56 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

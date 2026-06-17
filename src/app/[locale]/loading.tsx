import { Skeleton } from "@/components/ui/Skeleton";

export default function LocaleLoading() {
  return (
    <div className="flex min-w-0 flex-col gap-4 pb-6">
      <Skeleton className="h-44 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
      <div className="grid gap-3 md:grid-cols-3">
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-36 rounded-xl" />
      </div>
    </div>
  );
}

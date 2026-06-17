import { Skeleton } from "@/components/ui/Skeleton";

export default function MemberLoading() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <div className="rounded-xl border border-cyan-400/15 bg-[#070b13] p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-7 w-56" />
          </div>
          <Skeleton className="hidden h-9 w-28 sm:block" />
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}

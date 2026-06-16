"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function LiveMatchRefresher({
  label,
  intervalMs = 30_000,
}: {
  label: string;
  intervalMs?: number;
}) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return (
    <div className="flex items-center justify-center gap-1.5">
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
      </span>
      <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-green-400">
        {label}
      </span>
    </div>
  );
}

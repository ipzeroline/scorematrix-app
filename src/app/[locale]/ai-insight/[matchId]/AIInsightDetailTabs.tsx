"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type TabKey = "summary" | "model" | "form" | "community";

type Props = {
  labels: Record<TabKey, string>;
  summary: ReactNode;
  model: ReactNode;
  form: ReactNode;
  community: ReactNode;
};

export default function AIInsightDetailTabs({
  labels,
  summary,
  model,
  form,
  community,
}: Props) {
  const [tab, setTab] = useState<TabKey>("summary");

  return (
    <div className="space-y-5">
      <div>
        <div className="grid grid-cols-4 gap-2 rounded-2xl border border-white/10 bg-[#0b1220] p-1.5">
          {(["summary", "model", "form", "community"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "min-w-0 rounded-xl px-2 py-2.5 text-center text-xs font-semibold transition-colors sm:px-4 sm:text-sm",
                tab === key
                  ? "bg-cyan-400 text-slate-950 shadow-[0_8px_30px_rgba(34,211,238,0.3)]"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              {labels[key]}
            </button>
          ))}
        </div>
      </div>

      {tab === "summary" ? summary : null}
      {tab === "model" ? model : null}
      {tab === "form" ? form : null}
      {tab === "community" ? community : null}
    </div>
  );
}

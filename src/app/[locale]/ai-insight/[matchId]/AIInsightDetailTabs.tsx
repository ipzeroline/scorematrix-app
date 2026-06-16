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
        <div className="grid grid-cols-2 gap-1.5 rounded-2xl border border-cyan-300/15 bg-[#070b13] p-1.5 shadow-lg shadow-cyan-950/10 sm:grid-cols-4">
          {(["summary", "model", "form", "community"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "min-w-0 rounded-xl px-2 py-2.5 text-center text-xs font-black uppercase tracking-wider transition-all sm:px-4 cursor-pointer",
                tab === key
                  ? "bg-primary text-slate-950 shadow-md shadow-primary/25"
                  : "text-text-secondary hover:bg-white/[0.05] hover:text-white"
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

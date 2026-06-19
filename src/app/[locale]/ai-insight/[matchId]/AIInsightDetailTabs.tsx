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
                  ? "border border-cyan-300/35 bg-[linear-gradient(135deg,rgba(34,211,238,0.18),rgba(217,70,239,0.12))] text-cyan-50 shadow-[0_0_22px_rgba(34,211,238,0.16),inset_0_1px_0_rgba(255,255,255,0.08)]"
                  : "border border-transparent text-slate-400 hover:border-cyan-300/15 hover:bg-white/[0.05] hover:text-cyan-100"
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

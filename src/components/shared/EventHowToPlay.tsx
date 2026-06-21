"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Medal,
  MousePointerClick,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import type { SpecialEvent } from "@/types/event";

type Props = {
  event: SpecialEvent;
};

export function EventHowToPlay({ event }: Props) {
  const t = useTranslations("events");
  const { locale } = useParams<{ locale: string }>();
  const isFree =
    (event.entryFeePoints ?? 0) <= 0 && (event.entryFeeCredits ?? 0) <= 0;

  const steps = [
    {
      icon: <MousePointerClick size={20} className="text-cyan-300" />,
      title: t("howToPlay.step1Title"),
      description: isFree
        ? t("howToPlay.step1FreeDesc")
        : t("howToPlay.step1Desc", {
            points: (event.entryFeePoints ?? 0).toLocaleString(),
            credits: (event.entryFeeCredits ?? 0).toLocaleString(),
          }),
      color: "border-cyan-400/20 bg-cyan-400/5",
    },
    {
      icon: <Target size={20} className="text-green-300" />,
      title: t("howToPlay.step2Title"),
      description: t("howToPlay.step2Desc"),
      color: "border-green-400/20 bg-green-400/5",
    },
    {
      icon: <CheckCircle2 size={20} className="text-amber-300" />,
      title: t("howToPlay.step3Title"),
      description: t("howToPlay.step3Desc"),
      color: "border-amber-400/20 bg-amber-400/5",
    },
    {
      icon: <Users size={20} className="text-purple-300" />,
      title: t("howToPlay.step4Title"),
      description: t("howToPlay.step4Desc"),
      color: "border-purple-400/20 bg-purple-400/5",
    },
    {
      icon: <Trophy size={20} className="text-amber-300" />,
      title: t("howToPlay.step5Title"),
      description: t("howToPlay.step5Desc", {
        tiers: event.rewards.length.toLocaleString(),
      }),
      color: "border-amber-400/20 bg-amber-400/5",
      highlight: true,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Intro banner */}
      <div className="rounded-2xl border border-cyan-400/15 bg-[#0a0f18] p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">
            <Medal size={18} className="text-cyan-300" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{t("howToPlay.title")}</h2>
            <p className="mt-1 text-sm leading-6 text-gray-400">
              {t("howToPlay.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="relative space-y-0">
        {steps.map((step, index) => (
          <div key={index} className="relative flex gap-4">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                  step.highlight
                    ? "border-amber-400/30 bg-amber-400/10 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                    : step.color
                }`}
              >
                {step.icon}
              </div>
              {index < steps.length - 1 && (
                <div className="mt-1 h-full min-h-[24px] w-px bg-gradient-to-b from-cyan-400/20 to-transparent" />
              )}
            </div>
            <div
              className={`mb-3 flex-1 rounded-xl border p-4 ${
                step.highlight
                  ? "border-amber-400/15 bg-amber-400/[0.03]"
                  : "border-white/5 bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/10 bg-black/30 text-[10px] font-bold text-gray-400">
                  {index + 1}
                </span>
                <h3
                  className={`text-sm font-semibold ${
                    step.highlight ? "text-amber-200" : "text-white"
                  }`}
                >
                  {step.title}
                </h3>
              </div>
              <p className="mt-2 text-sm leading-6 text-gray-400">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex justify-center">
        <Link
          href={`/${locale}/predict`}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-black transition-colors hover:bg-cyan-400"
        >
          {t("howToPlay.goPredict")}
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

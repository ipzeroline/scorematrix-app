"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Coins, Gift, Lock, ShieldCheck, Sparkles, Target, Ticket, Wallet } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { registerEvent } from "@/lib/events-api";
import { ApiClientError } from "@/lib/api-client";
import { useEventStore } from "@/stores/event-store";
import { useNotificationStore } from "@/stores/notification-store";
import { useUserStore } from "@/stores/user-store";
import type { SpecialEvent } from "@/types/event";
import { cn } from "@/lib/utils";

export function EventDetailClient({
  event,
}: {
  event: SpecialEvent;
}) {
  const t = useTranslations("events");
  const { locale } = useParams<{ locale: string }>();
  const [showConfirm, setShowConfirm] = useState(false);
  const [entered, setEntered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const registerForEvent = useEventStore((state) => state.registerForEvent);
  const freePoints = useUserStore((state) => state.freePoints);
  const premiumCredits = useUserStore((state) => state.premiumCredits);
  const syncWallet = useUserStore((state) => state.syncWallet);
  const addToast = useNotificationStore((state) => state.addToast);

  const alreadyRegistered =
    Boolean(event.isRegistered) ||
    entered;
  const pointsFee = Number(event.entryFeePoints ?? 0);
  const creditsFee = Number(event.entryFeeCredits ?? 0);
  const canAffordPoints = freePoints >= pointsFee;
  const canAffordCredits = premiumCredits >= creditsFee;
  const canAfford = canAffordPoints && canAffordCredits;
  const isFree = pointsFee <= 0 && creditsFee <= 0;
  const registrationClosed = event.status === "ended";

  const handleEnter = async () => {
    if (isSubmitting || registrationClosed || alreadyRegistered) {
      setShowConfirm(false);
      return;
    }

    if (!canAfford) {
      addToast({
        type: "error",
        title: t("insufficientBalance"),
        message: t("buyCreditsOrEarnPoints"),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await registerEvent(event.id, { locale });
      const wallet = response.data.wallet;

      if (wallet) {
        const nextWallet: {
          freePoints?: number;
          premiumCredits?: number;
        } = {};

        if (typeof wallet.freePoints === "number") {
          nextWallet.freePoints = wallet.freePoints;
        }
        if (typeof wallet.premiumCredits === "number") {
          nextWallet.premiumCredits = wallet.premiumCredits;
        }

        syncWallet(nextWallet);
      }

      registerForEvent(response.data.eventId || event.id);
      setEntered(response.data.isRegistered);
      setShowConfirm(false);
      addToast({
        type: "success",
        title: t("eventEntered"),
        message: t("registeredForEvent", { event: event.name }),
      });
    } catch (error) {
      if (isAlreadyRegisteredError(error)) {
        registerForEvent(event.id);
        setEntered(true);
        setShowConfirm(false);
        addToast({
          type: "success",
          title: t("registeredStatus"),
          message: t("registeredForEvent", { event: event.name }),
        });
        return;
      }

      addToast({
        type: "error",
        title: isInsufficientBalanceError(error)
          ? t("insufficientBalance")
          : t("registration"),
        message:
          error instanceof Error
            ? error.message
            : t("buyCreditsOrEarnPoints"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="sticky top-20 overflow-hidden border-cyan-500/10 bg-[linear-gradient(180deg,_rgba(34,211,238,0.06)_0%,_rgba(18,18,26,1)_26%)] p-0">
        <div className="border-b border-cyan-500/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <Ticket size={16} className="text-cyan-300" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white">
              {t("registration")}
            </h2>
          </div>
        </div>

        <div className="space-y-4 p-5">
          {alreadyRegistered ? (
            <div className="space-y-3">
              <div className="rounded-2xl border border-green-500/20 bg-green-500/[0.06] p-4 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-green-400/30 bg-green-400/10">
                  <CheckCircle2 size={22} className="text-green-300" />
                </div>
                <h3 className="mt-3 text-base font-semibold text-white">{t("youAreIn")}</h3>
                <p className="mt-1 text-sm text-gray-300">{t("registeredStatus")}</p>
              </div>

              {/* Next steps after registration */}
              <div className="rounded-2xl border border-cyan-400/15 bg-[#0d1118] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-cyan-300">
                  {t("nextSteps.title")}
                </p>
                <div className="mt-3 space-y-2">
                  <a
                    href={`/${locale}/predict`}
                    className="flex items-center gap-2 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.04] px-3 py-2.5 text-sm text-gray-200 transition-colors hover:border-cyan-400/30 hover:bg-cyan-400/[0.08]"
                  >
                    <Target size={14} className="text-cyan-300 shrink-0" />
                    <span className="flex-1">{t("nextSteps.goPredict")}</span>
                    <ArrowRight size={14} className="text-cyan-400 shrink-0" />
                  </a>
                  {event.matches && event.matches.length > 0 && (
                    <a
                      href={`/${locale}/events/${event.id}`}
                      className="flex items-center gap-2 rounded-xl border border-purple-400/15 bg-purple-400/[0.04] px-3 py-2.5 text-sm text-gray-200 transition-colors hover:border-purple-400/30 hover:bg-purple-400/[0.08]"
                    >
                      <Sparkles size={14} className="text-purple-300 shrink-0" />
                      <span className="flex-1">
                        {t("nextSteps.checkMatches", { count: event.matches.length })}
                      </span>
                      <ArrowRight size={14} className="text-purple-400 shrink-0" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-gray-800/80 bg-black/15 p-4">
                <div className="space-y-3">
                  <BalanceRow
                    icon={<ShieldCheck size={15} className="text-green-300" />}
                    label={t("pointsFee")}
                    value={pointsFee > 0 ? t("pointsAmount", { amount: pointsFee.toLocaleString() }) : t("free")}
                  />
                  <BalanceRow
                    icon={<Coins size={15} className="text-amber-300" />}
                    label={t("creditsFee")}
                    value={creditsFee > 0 ? t("creditsAmount", { amount: creditsFee.toLocaleString() }) : t("free")}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-gray-800/80 bg-black/15 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Wallet size={15} className="text-cyan-300" />
                  <p className="text-xs uppercase tracking-[0.14em] text-gray-400">{t("yourBalance")}</p>
                </div>
                <div className="space-y-3">
                  <BalanceRow
                    icon={<ShieldCheck size={15} className="text-green-300" />}
                    label={t("pointsBalance")}
                    value={t("pointsAmount", { amount: freePoints.toLocaleString() })}
                  />
                  <BalanceRow
                    icon={<Coins size={15} className="text-amber-300" />}
                    label={t("creditsBalance")}
                    value={t("creditsAmount", { amount: premiumCredits.toLocaleString() })}
                  />
                </div>
              </div>

              {/* What you can win — mini rewards preview */}
              {event.rewards && event.rewards.length > 0 && (
                <div className="rounded-2xl border border-amber-400/15 bg-[#0d1118] p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Gift size={15} className="text-amber-300" />
                    <p className="text-xs uppercase tracking-[0.14em] text-amber-300/80">
                      {t("whatYouCanWin")}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {/* Top reward */}
                    {(() => {
                      const top = event.rewards[0];
                      if (!top) return null;
                      const parts: string[] = [];
                      if (top.freePoints > 0) {
                        parts.push(t("pointsAmount", { amount: top.freePoints.toLocaleString() }));
                      }
                      if (top.premiumCredits && top.premiumCredits > 0) {
                        parts.push(
                          t("creditsAmount", { amount: top.premiumCredits.toLocaleString() })
                        );
                      }
                      return (
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span className="text-gray-400">{t("topReward")}</span>
                          <span className="font-semibold text-amber-200">
                            {parts.join(" + ")}
                          </span>
                        </div>
                      );
                    })()}
                    {/* Badge count */}
                    {event.badges && event.badges.length > 0 && (
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="text-gray-400">{t("exclusiveBadges")}</span>
                        <span className="inline-flex items-center gap-1 font-semibold text-purple-200">
                          <Sparkles size={13} />
                          {t("badgeCount", { count: event.badges.length })}
                        </span>
                      </div>
                    )}
                    {/* Tier count */}
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-gray-400">{t("rewardTiers")}</span>
                      <span className="font-semibold text-cyan-200">
                        {t("rewardTierCount", { count: event.rewards.length })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowConfirm(true)}
                disabled={isSubmitting || registrationClosed || (!isFree && !canAfford)}
                className={cn(
                  "w-full rounded-xl px-4 py-3 text-sm font-bold transition-colors",
                  registrationClosed
                    ? "cursor-not-allowed bg-gray-800 text-gray-500"
                    : isFree
                      ? "bg-green-500 text-black hover:bg-green-400"
                      : canAfford
                        ? "bg-cyan-500 text-black hover:bg-cyan-400"
                        : "cursor-not-allowed bg-gray-800 text-gray-500"
                )}
              >
                {registrationClosed
                  ? t("registrationClosed")
                  : isFree
                    ? t("joinFree")
                    : canAfford
                      ? t("enterNow")
                      : t("insufficientBalance")}
              </button>

              {!registrationClosed && !isFree && !canAfford && (
                <p className="text-center text-xs text-gray-500">{t("buyCreditsOrEarnPoints")}</p>
              )}
            </>
          )}

          <div className="rounded-2xl border border-gray-800/80 bg-[#0d1118] p-4">
            <div className="mb-3 flex items-center gap-2">
              <Lock size={15} className="text-magenta-300" />
              <p className="text-xs uppercase tracking-[0.14em] text-gray-400">{t("registrationStatus")}</p>
            </div>
            <p className="text-sm font-semibold text-white">
              {alreadyRegistered
                ? t("registeredStatus")
                : registrationClosed
                  ? t("registrationClosed")
                  : t("notRegisteredStatus")}
            </p>
          </div>
        </div>
      </Card>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-[#12121a] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">{t("confirmEntry")}</h3>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              {isFree
                ? t("joinFreeQuestion")
                : t("enterWithMixedFeeQuestion", {
                    points: pointsFee.toLocaleString(),
                    credits: creditsFee.toLocaleString(),
                  })}
            </p>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border border-gray-700 px-4 py-3 text-sm font-medium text-gray-300 transition-colors hover:text-white"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleEnter}
                disabled={isSubmitting}
                className="flex-1 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-bold text-black transition-colors hover:bg-cyan-400"
              >
                {t("confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function isAlreadyRegisteredError(error: unknown) {
  return getEventErrorText(error).some((value) =>
    value.includes("already_registered") ||
    value.includes("already registered") ||
    value.includes("ลงทะเบียนแล้ว") ||
    value.includes("สมัครแล้ว")
  );
}

function isInsufficientBalanceError(error: unknown) {
  return getEventErrorText(error).some((value) =>
    value.includes("insufficient") ||
    value.includes("not enough") ||
    value.includes("ยอดคงเหลือไม่พอ") ||
    value.includes("เครดิตไม่พอ") ||
    value.includes("แต้มไม่เพียงพอ")
  );
}

function getEventErrorText(error: unknown) {
  const values: string[] = [];

  if (error instanceof Error) values.push(error.message);
  if (error instanceof ApiClientError) {
    if (error.code) values.push(error.code);
    values.push(String(error.status));
    collectPayloadText(error.payload, values);
  }

  return values.map((value) => value.toLowerCase());
}

function collectPayloadText(payload: unknown, values: string[]) {
  if (!payload || typeof payload !== "object") return;
  const record = payload as Record<string, unknown>;

  for (const key of ["code", "error_code", "message"]) {
    const value = record[key];
    if (typeof value === "string") values.push(value);
  }

  const details = record.details;
  if (details && typeof details === "object") {
    collectPayloadText(details, values);
  }
}

function BalanceRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-2 text-gray-400">
        {icon}
        <span>{label}</span>
      </div>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

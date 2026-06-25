"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Coins,
  CreditCard,
  History,
  ReceiptText,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  getCreditPurchases,
  sortCreditPurchasesByIdDesc,
  type CreditPurchaseItem,
} from "@/lib/credit-purchases-api";
import { isAuthSessionExpiredError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;
const STATUSES = ["all", "completed", "pending", "failed", "refunded"] as const;
type StatusFilter = (typeof STATUSES)[number];

export function CreditPurchaseHistoryClient() {
  const { locale } = useParams<{ locale: string }>();
  const t = useTranslations("wallet");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [items, setItems] = useState<CreditPurchaseItem[]>([]);
  const [totalSpentThb, setTotalSpentThb] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const signal = { cancelled: false };

    const load = async () => {
      setLoading(true);
      setFailed(false);

      try {
        const result = await getCreditPurchases({
          status,
          page: 1,
          limit: PAGE_SIZE,
          locale,
        });
        if (signal.cancelled) return;
        setItems(sortCreditPurchasesByIdDesc(result.items));
        setTotalSpentThb(result.totalSpentThb);
        setHasMore(result.hasMore);
        setPage(1);
      } catch (error) {
        if (signal.cancelled) return;
        if (!isAuthSessionExpiredError(error)) {
          console.error("Error loading credit purchases:", error);
        }
        setItems([]);
        setHasMore(false);
        setFailed(true);
      } finally {
        if (!signal.cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      signal.cancelled = true;
    };
  }, [locale, status]);

  const loadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const result = await getCreditPurchases({
        status,
        page: nextPage,
        limit: PAGE_SIZE,
        locale,
      });
      setItems((current) =>
        sortCreditPurchasesByIdDesc([...current, ...result.items])
      );
      setTotalSpentThb(result.totalSpentThb);
      setHasMore(result.hasMore);
      setPage(nextPage);
    } catch (error) {
      if (!isAuthSessionExpiredError(error)) {
        console.error("Error loading more credit purchases:", error);
      }
    } finally {
      setLoadingMore(false);
    }
  };

  const completedCount = useMemo(
    () => items.filter((item) => item.status === "completed").length,
    [items]
  );
  const totalCredits = useMemo(
    () =>
      items
        .filter((item) => item.status === "completed")
        .reduce((sum, item) => sum + item.totalCredits, 0),
    [items]
  );

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-8 sm:space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#070b13] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-6 lg:p-7">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.13),transparent_34%),linear-gradient(315deg,rgba(245,158,11,0.12),transparent_30%),linear-gradient(rgba(148,163,184,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.045)_1px,transparent_1px)] bg-[auto,auto,34px_34px,34px_34px]" />
        <div className="relative grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="flex min-h-[300px] flex-col justify-between rounded-2xl border border-white/10 bg-black/24 p-4 sm:p-5">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge variant="cyan" size="md" className="uppercase tracking-wider">
                  {t("purchaseHistoryCommand")}
                </Badge>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-200">
                  <ShieldCheck size={14} />
                  {t("skillNotice")}
                </span>
              </div>
              <h1 className="font-display text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
                {t("purchaseHistoryTitle")}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-gray-300 sm:text-lg">
                {t("purchaseHistoryHint")}
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/${locale}/wallet`}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-4 text-base font-black text-cyan-200 transition-colors hover:border-cyan-300/50 hover:bg-cyan-500/15"
              >
                <ArrowLeft size={18} />
                {t("backToWallet")}
              </Link>
              <Link
                href={`/${locale}/credits`}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 text-base font-black text-black transition-colors hover:bg-cyan-400"
              >
                <Coins size={18} />
                {t("buyCredits")}
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <HistoryMetric
              icon={ReceiptText}
              label={t("totalSpent")}
              value={formatThb(totalSpentThb, locale)}
              tone="text-amber-300"
              className="sm:col-span-2"
            />
            <HistoryMetric
              icon={CheckCircle2}
              label={t("completedPurchases")}
              value={completedCount.toLocaleString()}
              tone="text-green-300"
            />
            <HistoryMetric
              icon={Coins}
              label={t("creditsReceived")}
              value={totalCredits.toLocaleString()}
              tone="text-cyan-300"
            />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#080d17] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
              <History size={20} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-cyan-300">
                {t("purchaseLedger")}
              </p>
              <h2 className="mt-1 text-xl font-black text-white">
                {t("purchaseHistoryTitle")}
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-400">
                {t("purchaseLedgerHint")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-[#080d17] p-2">
          {STATUSES.map((key) => (
            <button
              key={key}
              onClick={() => setStatus(key)}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center rounded-xl px-4 text-sm font-black transition-colors",
                status === key
                  ? "border border-cyan-400/30 bg-cyan-500/12 text-white shadow-[0_0_18px_rgba(34,211,238,0.12)]"
                  : "border border-transparent text-gray-400 hover:border-white/10 hover:bg-white/[0.03] hover:text-gray-200"
              )}
            >
              {t(`purchaseStatuses.${key}`)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full" />
            ))}
          </div>
        ) : failed ? (
          <EmptyState icon={<ReceiptText size={48} />} title={t("purchaseHistoryError")} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={<ReceiptText size={48} />}
            title={t("noPurchaseHistory")}
            description={t("noPurchaseHistoryHint")}
          />
        ) : (
          <>
            <div className="space-y-3">
              {items.map((item) => (
                <PurchaseRow key={item.id} item={item} locale={locale} />
              ))}
            </div>
            {hasMore && (
              <Button
                type="button"
                variant="outline"
                onClick={() => void loadMore()}
                loading={loadingMore}
                className="min-h-11 w-full text-sm font-black"
              >
                {loadingMore ? t("loading") : t("loadMore")}
              </Button>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function PurchaseRow({
  item,
  locale,
}: {
  item: CreditPurchaseItem;
  locale: string;
}) {
  const t = useTranslations("wallet");
  const statusTone = getStatusTone(item.status);
  const statusIcon =
    item.status === "completed"
      ? CheckCircle2
      : item.status === "failed"
        ? XCircle
        : item.status === "refunded"
          ? ReceiptText
          : Clock3;
  const StatusIcon = statusIcon;

  return (
    <Card className="relative overflow-hidden border-white/10 bg-[#0b111d] p-4 sm:p-5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={statusTone} size="md">
              <StatusIcon size={13} className="mr-1" />
              {t(`purchaseStatuses.${normalizeStatus(item.status)}`)}
            </Badge>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/24 px-3 py-1 text-xs font-bold text-gray-300">
              <CreditCard size={13} className="text-cyan-300" />
              {formatPaymentMethod(item.paymentMethod, t)}
            </span>
          </div>
          <h3 className="mt-3 text-xl font-black leading-tight text-white">
            {item.packageName ?? t("premiumCreditsTitle")}
          </h3>
          <p className="mt-1 text-sm leading-6 text-gray-400">
            {item.createdAt
              ? formatDateTime(item.createdAt, locale)
              : t("purchaseDateUnavailable")}
          </p>
          {item.transactionId && (
            <p className="mt-1 truncate font-mono text-xs text-gray-500">
              {item.transactionId}
            </p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[430px]">
          <MiniValue
            label={t("amountPaid")}
            value={formatThb(item.amountThb, locale)}
            tone="text-amber-300"
          />
          <MiniValue
            label={t("creditsReceived")}
            value={item.totalCredits.toLocaleString()}
            tone="text-cyan-300"
          />
          <MiniValue
            label={t("bonusCredits")}
            value={`+${item.bonusCredits.toLocaleString()}`}
            tone="text-green-300"
          />
        </div>
      </div>
    </Card>
  );
}

function HistoryMetric({
  icon: Icon,
  label,
  value,
  tone,
  className,
}: {
  icon: typeof Coins;
  label: string;
  value: string;
  tone: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-black/28 p-4",
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-gray-400">{label}</p>
          <p className="mt-2 font-mono text-3xl font-black leading-none text-white sm:text-4xl">
            {value}
          </p>
        </div>
        <Icon size={22} className={tone} />
      </div>
    </div>
  );
}

function MiniValue({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-black/24 p-3">
      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p className={cn("mt-1 font-mono text-lg font-black", tone)}>{value}</p>
    </div>
  );
}

function getStatusTone(status: string) {
  if (status === "completed") return "green";
  if (status === "failed") return "red";
  if (status === "refunded") return "purple";
  return "gold";
}

function normalizeStatus(status: string): StatusFilter {
  return STATUSES.includes(status as StatusFilter)
    ? (status as StatusFilter)
    : "pending";
}

function formatPaymentMethod(
  method: string | null,
  t: ReturnType<typeof useTranslations<"wallet">>
) {
  if (!method) return t("paymentMethods.unknown");
  if (["promptpay", "credit_card", "truemoney", "rabbit_linepay"].includes(method)) {
    return t(`paymentMethods.${method}`);
  }
  return method;
}

function formatThb(amount: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateTime(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

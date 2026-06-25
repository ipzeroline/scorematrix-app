"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useShallow } from "zustand/react/shallow";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useUserStore } from "@/stores/user-store";
import { isAuthSessionExpiredError } from "@/lib/api-client";
import {
  dispatchMemberWalletRefresh,
  MEMBER_WALLET_REFRESH_EVENT,
} from "@/lib/member-refresh-event";
import {
  CATEGORY_ORDER,
  CATEGORY_TYPES,
  fetchActivityFeed,
  isKnownActivityType,
  sortActivitiesByIdDesc,
  type ActivityCategory,
  type ActivityItem,
  type ActivityType,
} from "@/lib/activities-api";
import { cn, formatRelativeTime } from "@/lib/utils";
import {
  AlertTriangle,
  Coins,
  Gem,
  History,
  Inbox,
  ReceiptText,
  ShieldCheck,
  Trophy,
  WalletCards,
} from "lucide-react";
import {
  ACCENT_CHIP,
  ACCENT_TEXT,
  getActivityMeta,
} from "./activity-meta";

const PAGE_SIZE = 20;

export function WalletClient() {
  const { locale } = useParams<{ locale: string }>();
  const t = useTranslations("wallet");

  const { isLoggedIn, freePoints, premiumCredits } = useUserStore(
    useShallow((s) => ({
      isLoggedIn: s.isLoggedIn,
      freePoints: s.freePoints,
      premiumCredits: s.premiumCredits,
    }))
  );

  // The global Header keeps the wallet store fresh; nudge it on mount so the
  // balances reflect the latest server state when landing here directly.
  useEffect(() => {
    if (isLoggedIn) dispatchMemberWalletRefresh();
  }, [isLoggedIn]);

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-8 sm:space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#070b13] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-6 lg:p-7">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.13),transparent_34%),linear-gradient(315deg,rgba(245,158,11,0.12),transparent_30%),linear-gradient(rgba(148,163,184,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.045)_1px,transparent_1px)] bg-[auto,auto,34px_34px,34px_34px]" />
        <div className="relative grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex min-h-[320px] flex-col justify-between rounded-2xl border border-white/10 bg-black/24 p-4 sm:p-5">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge variant="cyan" size="md" className="uppercase tracking-wider">
                  {t("commandCenter")}
                </Badge>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-200">
                  <ShieldCheck size={14} />
                  {t("skillNotice")}
                </span>
              </div>
              <h1 className="font-display text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
                {t("title")}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-gray-300 sm:text-lg">
                {t("walletHint")}
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/${locale}/credits`}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 text-base font-black text-black transition-colors hover:bg-cyan-400"
              >
                <Coins size={18} />
                {t("buyCredits")}
              </Link>
              <Link
                href={`/${locale}/wallet/credit-history`}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-4 text-base font-black text-cyan-200 transition-colors hover:border-cyan-300/50 hover:bg-cyan-500/15"
              >
                <ReceiptText size={18} />
                {t("viewPurchaseHistory")}
              </Link>
            </div>
          </div>

          <div className="grid gap-3">
            <BalanceCard
              icon={Trophy}
              title={t("freePointsTitle")}
              value={freePoints.toLocaleString()}
              description={t("freePointsDescription")}
              tone="green"
            />
            <BalanceCard
              icon={Gem}
              title={t("premiumCreditsTitle")}
              value={premiumCredits.toLocaleString()}
              description={t("premiumCreditsDescription")}
              tone="gold"
              action={
                <Link
                  href={`/${locale}/wallet/credit-history`}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-amber-400/25 bg-amber-500/10 px-3 text-sm font-black text-amber-200 transition-colors hover:border-amber-300/50 hover:bg-amber-500/15"
                >
                  <History size={16} />
                  {t("purchaseHistoryTitle")}
                </Link>
              }
            />
          </div>
        </div>
      </section>

      <Card className="border-red-500/20 bg-red-500/[0.04] p-4 sm:p-5">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 text-red-300">
            <AlertTriangle size={18} />
          </div>
          <p className="text-sm font-medium leading-6 text-gray-300">
            <strong className="text-red-300">{t("importantLabel")}</strong>{" "}
            {t("legalPrefix")} <strong>{t("noCashValue")}</strong>.{" "}
            {t("legalSuffix")}
          </p>
        </div>
      </Card>

      <ActivityHistory isLoggedIn={isLoggedIn} locale={locale} />
    </div>
  );
}

function ActivityHistory({
  isLoggedIn,
  locale,
}: {
  isLoggedIn: boolean;
  locale: string;
}) {
  const t = useTranslations("wallet");

  const [category, setCategory] = useState<ActivityCategory>("all");
  const [activeType, setActiveType] = useState<ActivityType | null>(null);
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(isLoggedIn);
  const [loadingMore, setLoadingMore] = useState(false);
  const [failed, setFailed] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  // Bumped to force a reload (e.g. after a prediction/check-in).
  const [reloadKey, setReloadKey] = useState(0);

  const onCategoryChange = useCallback((key: string) => {
    setCategory(key as ActivityCategory);
    setActiveType(null);
    setPage(1);
  }, []);

  const onChipChange = useCallback((type: ActivityType | null) => {
    setActiveType(type);
    setPage(1);
  }, []);

  // Narrow a merged feed to the active category client-side (the backend filters by
  // a single type only, while a category spans several types).
  const filterByCategory = useCallback(
    (list: ActivityItem[]) => {
      if (activeType || category === "all") return list;
      const allowed = new Set<string>(CATEGORY_TYPES[category]);
      return list.filter((item) => allowed.has(item.type));
    },
    [activeType, category]
  );

  // Load page 1 whenever the filter or reload key changes.
  useEffect(() => {
    if (!isLoggedIn) return;
    const signal = { cancelled: false };

    const load = async () => {
      setLoading(true);
      setFailed(false);
      try {
        const result = await fetchActivityFeed({
          type: activeType,
          page: 1,
          limit: PAGE_SIZE,
          locale,
        });
        if (signal.cancelled) return;
        setHasMore(result.hasMore);
        setItems(sortActivitiesByIdDesc(filterByCategory(result.items)));
      } catch (error) {
        if (signal.cancelled) return;
        if (!isAuthSessionExpiredError(error)) {
          console.error("Error loading activities:", error);
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
  }, [isLoggedIn, locale, activeType, filterByCategory, reloadKey]);

  // Reload the feed when the wallet refresh event fires (new prediction, etc.).
  useEffect(() => {
    const handler = () => setReloadKey((k) => k + 1);
    window.addEventListener(MEMBER_WALLET_REFRESH_EVENT, handler);
    return () => window.removeEventListener(MEMBER_WALLET_REFRESH_EVENT, handler);
  }, []);

  const loadMore = useCallback(() => {
    const next = page + 1;
    setPage(next);
    setLoadingMore(true);
    const signal = { cancelled: false };

    const load = async () => {
      try {
        const result = await fetchActivityFeed({
          type: activeType,
          page: next,
          limit: PAGE_SIZE,
          locale,
        });
        if (signal.cancelled) return;
        setHasMore(result.hasMore);
        setItems((prev) =>
          sortActivitiesByIdDesc([...prev, ...filterByCategory(result.items)])
        );
      } catch (error) {
        if (!isAuthSessionExpiredError(error)) {
          console.error("Error loading more activities:", error);
        }
      } finally {
        if (!signal.cancelled) setLoadingMore(false);
      }
    };

    void load();
  }, [page, activeType, locale, filterByCategory]);

  const tabs = useMemo(
    () =>
      CATEGORY_ORDER.map((key) => ({
        key,
        label: t(`categories.${key}`),
      })),
    [t]
  );

  const chips = category === "all" ? [] : CATEGORY_TYPES[category];

  return (
    <Card className="space-y-4 border-cyan-400/15 bg-[#0b111d] p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
            <WalletCards size={20} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-cyan-300">
              {t("activityLedger")}
            </p>
            <h3 className="mt-1 text-xl font-black text-white">
              {t("activityTitle")}
            </h3>
            <p className="mt-1 text-sm leading-6 text-gray-400">
              {t("activityHint")}
            </p>
          </div>
        </div>
        <Link
          href={`/${locale}/wallet/credit-history`}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-3 text-sm font-black text-cyan-200 transition-colors hover:border-cyan-300/50 hover:bg-cyan-500/15"
        >
          <ReceiptText size={16} />
          {t("viewPurchaseHistory")}
        </Link>
      </div>

      <Tabs
        tabs={tabs}
        activeTab={category}
        onChange={onCategoryChange}
        className="rounded-2xl border border-white/10 bg-black/20 px-2"
      />

      {chips.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Chip
            label={t("categories.all")}
            active={activeType === null}
            onClick={() => onChipChange(null)}
          />
          {chips.map((type) => (
            <Chip
              key={type}
              label={t(`activityTypes.${type}`)}
              active={activeType === type}
              onClick={() => onChipChange(type)}
            />
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : !isLoggedIn ? (
        <EmptyState icon={<Inbox size={48} />} title={t("loginRequired")} />
      ) : failed ? (
        <EmptyState icon={<Inbox size={48} />} title={t("activityError")} />
      ) : items.length === 0 ? (
        <EmptyState icon={<Inbox size={48} />} title={t("noActivities")} />
      ) : (
        <>
          <div className="space-y-2">
            {items.map((item) => (
              <ActivityRow key={item.id} item={item} locale={locale} />
            ))}
          </div>
          {hasMore && (
            <Button
              type="button"
              variant="outline"
              onClick={loadMore}
              loading={loadingMore}
              className="mt-2 min-h-11 w-full text-sm font-black"
            >
              {loadingMore ? t("loading") : t("loadMore")}
            </Button>
          )}
        </>
      )}
    </Card>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "min-h-9 px-3 rounded-full text-xs font-bold whitespace-nowrap border transition-colors cursor-pointer",
        active
          ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
          : "bg-transparent text-gray-500 border-gray-800 hover:text-gray-300 hover:border-gray-700"
      )}
    >
      {label}
    </button>
  );
}

function ActivityRow({
  item,
  locale,
}: {
  item: ActivityItem;
  locale: string;
}) {
  const t = useTranslations("wallet");
  const meta = getActivityMeta(item.type);
  const Icon = meta.icon;

  const title = isKnownActivityType(item.type)
    ? t(`activityTypes.${item.type}`)
    : item.type;

  const relativeTime = item.createdAt
    ? formatRelativeTime(item.createdAt, locale)
    : null;
  const subtitle = [item.context, relativeTime].filter(Boolean).join(" · ");

  const amountLabel = formatAmount(item.amount, meta.sign);

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-800 bg-black/20 p-3">
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          ACCENT_CHIP[meta.accent]
        )}
      >
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-gray-100">{title}</p>
        {subtitle && (
          <p className="mt-1 truncate text-xs text-gray-500">{subtitle}</p>
        )}
      </div>
      {amountLabel && (
        <span
          className={cn(
            "shrink-0 font-mono text-sm font-black",
            ACCENT_TEXT[meta.accent]
          )}
        >
          {amountLabel}
        </span>
      )}
    </div>
  );
}

function formatAmount(
  amount: number | null,
  sign: "+" | "-" | null
): string | null {
  if (amount === null || amount === 0) return null;
  const magnitude = Math.abs(amount).toLocaleString();
  const resolvedSign = amount < 0 ? "-" : sign ?? "+";
  return `${resolvedSign}${magnitude}`;
}

function BalanceCard({
  icon: Icon,
  title,
  value,
  description,
  tone,
  action,
}: {
  icon: typeof Coins;
  title: string;
  value: string;
  description: string;
  tone: "green" | "gold";
  action?: React.ReactNode;
}) {
  const toneClasses =
    tone === "green"
      ? {
          border: "border-green-400/20",
          bg: "bg-green-500/[0.04]",
          icon: "border-green-400/20 bg-green-500/10 text-green-300",
          value: "text-green-300",
        }
      : {
          border: "border-amber-400/20",
          bg: "bg-amber-500/[0.04]",
          icon: "border-amber-400/20 bg-amber-500/10 text-amber-300",
          value: "text-amber-300",
        };

  return (
    <Card className={cn("relative overflow-hidden p-4 sm:p-5", toneClasses.border, toneClasses.bg)}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-black text-white">{title}</p>
          <p className={cn("mt-2 font-mono text-4xl font-black leading-none", toneClasses.value)}>
            {value}
          </p>
        </div>
        <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border", toneClasses.icon)}>
          <Icon size={22} />
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-gray-400">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </Card>
  );
}

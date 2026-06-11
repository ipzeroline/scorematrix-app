"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useShallow } from "zustand/react/shallow";
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
  type ActivityCategory,
  type ActivityItem,
  type ActivityType,
} from "@/lib/activities-api";
import { cn, formatRelativeTime } from "@/lib/utils";
import { Inbox } from "lucide-react";
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
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-xl font-bold font-display text-white">{t("title")}</h1>

      {/* Legal Disclaimer */}
      <div className="rounded-xl border-2 border-red-500/30 bg-red-500/5 p-4">
        <p className="text-sm text-gray-300 font-medium leading-relaxed">
          <strong className="text-red-400">{t("importantLabel")}</strong>{" "}
          {t("legalPrefix")} <strong>{t("noCashValue")}</strong>.{" "}
          {t("legalSuffix")}
        </p>
      </div>

      {/* Dual Currency Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-5 border-green-500/20 bg-green-500/[0.03]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🟢</span>
            <h3 className="text-sm font-semibold text-green-400">
              {t("freePointsTitle")}
            </h3>
          </div>
          <div className="text-3xl font-bold font-mono text-green-400 mb-3">
            {freePoints.toLocaleString()}
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            {t("freePointsDescription")}
          </p>
        </Card>

        <Card className="p-5 border-amber-500/20 bg-amber-500/[0.03]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🟡</span>
            <h3 className="text-sm font-semibold text-amber-400">
              {t("premiumCreditsTitle")}
            </h3>
          </div>
          <div className="text-3xl font-bold font-mono text-amber-400 mb-3">
            {premiumCredits.toLocaleString()}
          </div>
          <p className="text-xs text-gray-500 leading-relaxed mb-3">
            {t("premiumCreditsDescription")}
          </p>
          <Link
            href={`/${locale}/credits`}
            className="inline-block px-4 py-2 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
          >
            {t("buyCredits")}
          </Link>
        </Card>
      </div>

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

  // Narrow a merged feed to the active category client-side (the API filters by
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
        setItems(filterByCategory(result.items));
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
        setItems((prev) => [...prev, ...filterByCategory(result.items)]);
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
    <Card className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-white">{t("activityTitle")}</h3>

      <Tabs tabs={tabs} activeTab={category} onChange={onCategoryChange} />

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
          <div className="space-y-1">
            {items.map((item) => (
              <ActivityRow key={item.id} item={item} locale={locale} />
            ))}
          </div>
          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="w-full mt-2 py-2.5 rounded-lg text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loadingMore ? t("loading") : t("loadMore")}
            </button>
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
        "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors cursor-pointer",
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
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-800/50 last:border-0">
      <div
        className={cn(
          "shrink-0 w-9 h-9 rounded-lg flex items-center justify-center",
          ACCENT_CHIP[meta.accent]
        )}
      >
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-200 truncate">{title}</p>
        {subtitle && (
          <p className="text-[10px] text-gray-600 truncate">{subtitle}</p>
        )}
      </div>
      {amountLabel && (
        <span
          className={cn(
            "text-xs font-mono font-bold shrink-0",
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

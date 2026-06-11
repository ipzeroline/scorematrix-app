"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  User,
  Wallet,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { PointsBadge } from "@/components/shared/PointsBadge";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { logout as logoutApi } from "@/lib/auth-api";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/stores/notification-store";
import { useUserStore } from "@/stores/user-store";

interface UserMenuProps {
  isLoggedIn?: boolean;
  username?: string;
  avatar?: string | null;
  freePoints?: number;
  premiumCredits?: number;
  rank?: string;
  xp?: number;
  level?: number;
  memberInfoReady?: boolean;
}

export function UserMenu({
  isLoggedIn = false,
  username = "Guest",
  avatar = null,
  freePoints = 0,
  premiumCredits = 0,
  rank = "bronze",
  xp = 0,
  level = 1,
  memberInfoReady = true,
}: UserMenuProps) {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const logoutUser = useUserStore((s) => s.logout);
  const addToast = useNotificationStore((s) => s.addToast);
  const xpProgress = getLevelXpProgress(xp, level);

  const handleLogout = async () => {
    try {
      await logoutApi({ locale });
      addToast({
        type: "success",
        title: t("auth.logoutSuccess"),
      });
    } catch (error) {
      addToast({
        type: "warning",
        title: t("auth.logoutSuccess"),
        message: error instanceof Error ? error.message : undefined,
      });
    } finally {
      logoutUser();
      router.push(`/${locale}`);
      router.refresh();
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="flex min-w-0 shrink-0 items-center gap-1 sm:gap-2">
        <Link
          href={`/${locale}/auth/register`}
          className="inline-flex max-w-[72px] items-center justify-center rounded-lg bg-cyan-500 px-2.5 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-cyan-400 sm:max-w-none sm:px-3 sm:py-1.5 sm:text-sm"
        >
          <span className="sm:hidden">สมัคร</span>
          <span className="hidden sm:inline">{t("auth.register")}</span>
        </Link>
        <Link
          href={`/${locale}/auth/login`}
          className="inline-flex max-w-[92px] items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1.5 text-xs font-semibold text-cyan-200 transition-colors hover:border-cyan-400/50 hover:text-white sm:max-w-none sm:border-transparent sm:bg-transparent sm:px-3 sm:py-1.5 sm:text-sm sm:font-medium sm:text-gray-400"
        >
          <span className="truncate">{t("auth.login")}</span>
        </Link>
      </div>
    );
  }

  return (
    <Dropdown
      className="w-[min(92vw,296px)] overflow-hidden border-gray-800/90 bg-[#111722] py-0"
      trigger={
        <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
          {memberInfoReady ? (
            <Avatar src={avatar} fallback={username} size="sm" />
          ) : (
            <span
              aria-hidden="true"
              className="h-8 w-8 shrink-0 rounded-full border border-gray-700 bg-white/[0.04]"
            />
          )}
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex items-center gap-2">
              {memberInfoReady ? (
                <>
                  <PointsBadge type="free" amount={freePoints} size="sm" />
                  <PointsBadge type="premium" amount={premiumCredits} size="sm" />
                </>
              ) : (
                <>
                  <WalletBadgeSkeleton className="w-16" />
                  <WalletBadgeSkeleton className="w-14" />
                </>
              )}
            </div>
            <ChevronDown size={14} className="text-gray-500" />
          </div>
        </div>
      }
    >
      <div className="border-b border-gray-800 bg-[#0d121b]">
        <div className="p-3.5">
          <div className="flex items-center gap-3">
            {memberInfoReady ? (
              <Avatar
                src={avatar}
                fallback={username}
                size="md"
                className="shrink-0 border-cyan-400/25 bg-cyan-400/10"
              />
            ) : (
              <span
                aria-hidden="true"
                className="h-10 w-10 shrink-0 rounded-full border border-gray-700 bg-white/[0.04]"
              />
            )}
            <div className="min-w-0 flex-1">
              {memberInfoReady ? (
                <>
                  <p className="truncate text-sm font-semibold text-white">
                    {username}
                  </p>
                  <p className="mt-0.5 text-[11px] text-gray-500">
                    {t("nav.profile")}
                  </p>
                </>
              ) : (
                <>
                  <WalletBadgeSkeleton className="h-4 w-28" />
                  <WalletBadgeSkeleton className="mt-2 h-3 w-16" />
                </>
              )}
            </div>
          </div>

          {memberInfoReady ? (
            <MemberRankLevel rank={rank} level={level} />
          ) : (
            <MemberRankLevelSkeleton />
          )}

          <div className="mt-3 rounded-lg border border-gray-800 bg-[#090d14] p-2.5">
            {memberInfoReady ? (
              <>
                <div className="mb-1.5 flex items-center justify-between text-[10px] uppercase tracking-[0.12em] text-gray-500">
                  <span>{t("gamification.xp")}</span>
                  <span className="font-mono text-cyan-200">
                    {xpProgress.current.toLocaleString()} / {xpProgress.target.toLocaleString()}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-800">
                  <div
                    className="h-full rounded-full bg-cyan-300"
                    style={{ width: `${xpProgress.percent}%` }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="mb-2 flex items-center justify-between">
                  <WalletBadgeSkeleton className="h-3 w-10" />
                  <WalletBadgeSkeleton className="h-3 w-20" />
                </div>
                <WalletBadgeSkeleton className="h-1.5 w-full" />
              </>
            )}
          </div>

          <div className="mt-2 rounded-lg border border-gray-700/80 bg-[#090d14] px-3 py-2.5">
            {memberInfoReady ? (
              <div className="flex items-center justify-between gap-3">
                <WalletBalance
                  label={t("common.points")}
                  value={freePoints}
                  dotClassName="bg-green-300"
                  valueClassName="text-green-300"
                />
                <div className="h-7 w-px shrink-0 bg-gray-800" />
                <WalletBalance
                  label={t("common.credits")}
                  value={premiumCredits}
                  align="right"
                  dotClassName="bg-amber-300"
                  valueClassName="text-amber-300"
                />
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <WalletBalanceSkeleton />
                <div className="h-7 w-px shrink-0 bg-gray-800" />
                <WalletBalanceSkeleton align="right" />
              </div>
            )}
          </div>
        </div>
      </div>
      <Link href={`/${locale}/profile`}>
        <DropdownItem>
          <span className="flex items-center gap-2">
            <User size={14} /> {t("nav.profile")}
          </span>
        </DropdownItem>
      </Link>
      <Link href={`/${locale}/wallet`}>
        <DropdownItem>
          <span className="flex items-center gap-2">
            <Wallet size={14} /> {t("nav.wallet")}
          </span>
        </DropdownItem>
      </Link>
      <Link href={`/${locale}/settings`}>
        <DropdownItem>
          <span className="flex items-center gap-2">
            <Settings size={14} /> {t("nav.settings")}
          </span>
        </DropdownItem>
      </Link>
      <div className="border-t border-gray-800 mt-1 pt-1">
        <DropdownItem danger onClick={handleLogout}>
          <span className="flex items-center gap-2">
            <LogOut size={14} /> {t("auth.logout")}
          </span>
        </DropdownItem>
      </div>
    </Dropdown>
  );
}

function MemberRankLevel({ rank, level }: { rank: string; level: number }) {
  const t = useTranslations();

  return (
    <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-gray-800 bg-white/[0.025] px-3 py-2">
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-gray-500">
          {t("gamification.level")}
        </p>
        <p className="mt-0.5 font-mono text-sm font-semibold text-white">
          {level}
        </p>
      </div>
      <div className="h-7 w-px shrink-0 bg-gray-800" />
      <div className="min-w-0 text-right">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-gray-500">
          {t("gamification.rank")}
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-cyan-200">
          {formatRankLabel(rank)}
        </p>
      </div>
    </div>
  );
}

function MemberRankLevelSkeleton() {
  return (
    <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-gray-800 bg-white/[0.025] px-3 py-2">
      <div className="min-w-0">
        <WalletBadgeSkeleton className="h-3 w-12" />
        <WalletBadgeSkeleton className="mt-2 h-4 w-8" />
      </div>
      <div className="h-7 w-px shrink-0 bg-gray-800" />
      <div className="flex min-w-0 flex-col items-end">
        <WalletBadgeSkeleton className="h-3 w-12" />
        <WalletBadgeSkeleton className="mt-2 h-4 w-16" />
      </div>
    </div>
  );
}

function WalletBalance({
  label,
  value,
  align = "left",
  dotClassName,
  valueClassName,
}: {
  label: string;
  value: number;
  align?: "left" | "right";
  dotClassName?: string;
  valueClassName?: string;
}) {
  return (
    <div className={cn("min-w-0 flex-1", align === "right" && "text-right")}>
      <div
        className={cn(
          "flex items-center gap-1.5",
          align === "right" && "justify-end"
        )}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", dotClassName)} />
        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-gray-500">
          {label}
        </p>
      </div>
      <p className={cn("mt-0.5 truncate font-mono text-base font-bold", valueClassName)}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function WalletBalanceSkeleton({ align = "left" }: { align?: "left" | "right" }) {
  return (
    <div className={cn("flex min-w-0 flex-1 flex-col", align === "right" && "items-end")}>
      <WalletBadgeSkeleton className="h-3 w-14" />
      <WalletBadgeSkeleton className="mt-2 h-4 w-16" />
    </div>
  );
}

function WalletBadgeSkeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex h-5 rounded-full border border-gray-700 bg-white/[0.04]",
        className
      )}
    />
  );
}

function formatRankLabel(rank: string) {
  return rank
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getLevelXpProgress(xp: number, level: number) {
  const target = 1000;
  const current = Math.max(0, xp - Math.max(0, level - 1) * target);
  const clampedCurrent = Math.min(current, target);

  return {
    current: clampedCurrent,
    target,
    percent: Math.round((clampedCurrent / target) * 100),
  };
}

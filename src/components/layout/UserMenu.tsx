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
  ChevronRight,
  Zap,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { PointsBadge } from "@/components/shared/PointsBadge";
import { Dropdown } from "@/components/ui/Dropdown";
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
  const compactAuthLabel = COMPACT_AUTH_LABELS[locale] ?? {
    register: t("auth.register"),
    login: t("auth.login"),
  };

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
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <Link
          href={`/${locale}/auth/register`}
          className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg bg-cyan-500 px-3 text-sm font-bold leading-none text-black transition-colors hover:bg-cyan-400 max-[380px]:px-2.5 max-[380px]:text-[13px] sm:px-3.5"
        >
          <span className="whitespace-nowrap sm:hidden">{compactAuthLabel.register}</span>
          <span className="hidden whitespace-nowrap sm:inline">{t("auth.register")}</span>
        </Link>
        <Link
          href={`/${locale}/auth/login`}
          className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 text-sm font-bold leading-none text-cyan-100 transition-colors hover:border-cyan-400/50 hover:text-white max-[380px]:px-2.5 max-[380px]:text-[13px] sm:border-transparent sm:bg-transparent sm:px-3.5 sm:font-semibold sm:text-gray-300"
        >
          <span className="whitespace-nowrap sm:hidden">{compactAuthLabel.login}</span>
          <span className="hidden whitespace-nowrap sm:inline">{t("auth.login")}</span>
        </Link>
      </div>
    );
  }

  return (
    <Dropdown
      className="w-[min(90vw,286px)] overflow-hidden rounded-2xl border-cyan-400/20 bg-[#080d16] p-0 shadow-[0_18px_48px_rgba(0,0,0,0.5),0_0_0_1px_rgba(103,232,249,0.08)]"
      trigger={
        <div className="group flex min-h-12 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1.5 pr-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors hover:border-cyan-300/30 hover:bg-cyan-300/[0.06]">
          {memberInfoReady ? (
            <Avatar
              src={avatar}
              fallback={username}
              size="sm"
              level={level}
              className="border-cyan-300/25 bg-cyan-300/10"
            />
          ) : (
            <span
              aria-hidden="true"
              className="h-8 w-8 shrink-0 rounded-full border border-gray-700 bg-white/[0.04]"
            />
          )}
          <div className="hidden min-w-0 items-center gap-2 sm:flex">
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
            <ChevronDown
              size={16}
              className="shrink-0 text-gray-500 transition-colors group-hover:text-cyan-200"
            />
          </div>
        </div>
      }
    >
      <div className="bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(8,13,22,0.98))]">
        <div className="h-0.5 bg-gradient-to-r from-cyan-300 via-lime-300 to-amber-300" />
        <div className="p-3">
          <div className="flex items-center gap-2.5">
            {memberInfoReady ? (
              <Avatar
                src={avatar}
                fallback={username}
                size="md"
                level={level}
                className="shrink-0 border-cyan-300/30 bg-cyan-300/10"
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
                  <p className="truncate text-base font-black leading-tight text-white">
                    {username}
                  </p>
                  <p className="mt-0.5 truncate text-xs font-semibold text-cyan-100/70">
                    {formatRankLabel(rank)}
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

          <div className="mt-3 grid gap-2">
            {memberInfoReady ? (
              <MemberRankLevel rank={rank} level={level} />
            ) : (
              <MemberRankLevelSkeleton />
            )}
            <div className="rounded-xl border border-cyan-300/15 bg-black/28 px-3 py-2.5">
              {memberInfoReady ? (
                <>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2 text-xs font-bold text-gray-300">
                      <Zap size={14} className="shrink-0 text-cyan-200" />
                      <span className="truncate">{t("gamification.xp")}</span>
                    </div>
                    <span className="shrink-0 text-xs font-black text-cyan-100">
                      {xpProgress.percent}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-lime-300"
                      style={{ width: `${xpProgress.percent}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-right text-[10px] font-semibold text-gray-400">
                    {xpProgress.current.toLocaleString()} / {xpProgress.target.toLocaleString()}
                  </p>
                </>
              ) : (
                <>
                  <div className="mb-2 flex items-center justify-between">
                    <WalletBadgeSkeleton className="h-4 w-16" />
                    <WalletBadgeSkeleton className="h-4 w-10" />
                  </div>
                  <WalletBadgeSkeleton className="h-2 w-full" />
                  <WalletBadgeSkeleton className="ml-auto mt-2 h-3 w-20" />
                </>
              )}
            </div>
          </div>

          <div className="mt-2 rounded-xl border border-white/10 bg-[#080d16] px-3 py-2">
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
      <div className="space-y-1 border-t border-white/10 bg-[#0b111d] p-2">
        <MenuLink href={`/${locale}/profile`} icon={User} label={t("nav.profile")} />
        <MenuLink href={`/${locale}/wallet`} icon={Wallet} label={t("nav.wallet")} />
        <MenuLink href={`/${locale}/settings`} icon={Settings} label={t("nav.settings")} />
      </div>
      <div className="border-t border-white/10 bg-[#0b111d] p-2">
        <button
          type="button"
          onClick={handleLogout}
          className="flex min-h-10 w-full items-center justify-between gap-2 rounded-xl border border-red-400/15 bg-red-500/[0.06] px-2.5 py-2 text-left text-sm font-bold text-red-300 transition-colors hover:border-red-300/30 hover:bg-red-500/10 hover:text-red-200"
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-red-300/15 bg-black/25">
              <LogOut size={16} />
            </span>
            <span className="truncate">{t("auth.logout")}</span>
          </span>
          <ChevronRight size={16} className="shrink-0" />
        </button>
      </div>
    </Dropdown>
  );
}

const COMPACT_AUTH_LABELS: Record<string, { register: string; login: string }> = {
  th: { register: "สมัคร", login: "เข้าใช้" },
  en: { register: "Register", login: "Login" },
  lo: { register: "ສະໝັກ", login: "ເຂົ້າ" },
  my: { register: "စာရင်းသွင်း", login: "ဝင်ရန်" },
  km: { register: "ចុះឈ្មោះ", login: "ចូល" },
  zh: { register: "注册", login: "登录" },
};

function MemberRankLevel({ rank, level }: { rank: string; level: number }) {
  const t = useTranslations();

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/28 px-3 py-2">
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-gray-400">
          {t("gamification.level")}
        </p>
        <p className="mt-0.5 text-lg font-black leading-none text-white">
          {level}
        </p>
      </div>
      <div className="h-8 w-px shrink-0 bg-white/10" />
      <div className="min-w-0 text-right">
        <p className="text-[11px] font-bold text-gray-400">
          {t("gamification.rank")}
        </p>
        <p className="mt-0.5 truncate text-sm font-black leading-none text-cyan-100">
          {formatRankLabel(rank)}
        </p>
      </div>
    </div>
  );
}

function MemberRankLevelSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/28 px-3 py-2">
      <div className="min-w-0">
        <WalletBadgeSkeleton className="h-3 w-12" />
        <WalletBadgeSkeleton className="mt-2 h-6 w-8" />
      </div>
      <div className="h-8 w-px shrink-0 bg-white/10" />
      <div className="flex min-w-0 flex-col items-end">
        <WalletBadgeSkeleton className="h-3 w-12" />
        <WalletBadgeSkeleton className="mt-2 h-5 w-16" />
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
        <p className="truncate text-[11px] font-bold text-gray-400">
          {label}
        </p>
      </div>
      <p className={cn("mt-0.5 truncate text-lg font-black leading-none", valueClassName)}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof User;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-10 items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-2.5 py-2 text-sm font-bold text-gray-200 transition-colors hover:border-cyan-300/25 hover:bg-cyan-300/[0.08] hover:text-white"
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-cyan-300/15 bg-black/25 text-cyan-200 transition-colors group-hover:border-cyan-200/30">
          <Icon size={16} />
        </span>
        <span className="truncate">{label}</span>
      </span>
      <ChevronRight
        size={16}
        className="shrink-0 text-gray-500 transition-colors group-hover:text-cyan-200"
      />
    </Link>
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

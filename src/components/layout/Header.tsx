"use client";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Activity,
  BarChart3,
  Bell,
  Brain,
  Calendar,
  Check,
  Coins,
  Gift,
  Home,
  LockKeyhole,
  Mail,
  Menu,
  Newspaper,
  Share2,
  Sparkles,
  Target,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { UserMenu } from "./UserMenu";
import { cn } from "@/lib/utils";
import {
  getCurrentUser,
  type CurrentUserData,
  type CurrentUserResponse,
} from "@/lib/auth-api";
import { MEMBER_WALLET_REFRESH_EVENT } from "@/lib/member-refresh-event";
import { useNotificationStore } from "@/stores/notification-store";
import { useUserStore } from "@/stores/user-store";

const NAV_LINKS = [
  { href: "/livescore", label: "livescore" },
  { href: "/matches", label: "matches" },
  { href: "/predict", label: "predict" },
  { href: "/ai-insight", label: "aiInsight" },
  { href: "/news", label: "news" },
  { href: "/leaderboard", label: "leaderboard" },
  { href: "/missions", label: "missions", authRequired: true },
  { href: "/rewards", label: "rewards", authRequired: true },
  { href: "/legal/contact", label: "contactTeam" },
];

const MOBILE_NAV_LINKS = [
  { href: "", label: "home", icon: Home },
  { href: "/livescore", label: "livescore", icon: Activity },
  { href: "/matches", label: "matches", icon: Calendar },
  { href: "/predict", label: "predict", icon: Target },
  { href: "/ai-insight", label: "aiInsight", icon: Brain },
  { href: "/news", label: "news", icon: Newspaper },
  { href: "/leaderboard", label: "leaderboard", icon: Trophy, authRequired: true },
  { href: "/missions", label: "missions", icon: Zap, authRequired: true },
  { href: "/events", label: "events", icon: Sparkles, authRequired: true },
  { href: "/rewards", label: "rewards", icon: Gift, authRequired: true },
  { href: "/credits", label: "credits", icon: Coins, authRequired: true },
  { href: "/stats", label: "stats", icon: BarChart3, authRequired: true },
  { href: "/affiliate", label: "affiliate", icon: Share2, authRequired: true },
  { href: "/leagues", label: "leagues", icon: Users, authRequired: true },
  { href: "/legal/contact", label: "contactTeam", icon: Mail },
];

const emptySubscribe = () => () => {};

interface HeaderProps {
  initialHasAuthSession?: boolean;
}

export function Header({ initialHasAuthSession = false }: HeaderProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { locale } = useParams<{ locale: string }>();
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [serverAuthHint, setServerAuthHint] = useState(initialHasAuthSession);
  const [loadedMemberInfoKey, setLoadedMemberInfoKey] = useState<string | null>(null);
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const username = useUserStore((s) => s.username);
  const avatarUrl = useUserStore((s) => s.avatarUrl);
  const freePoints = useUserStore((s) => s.freePoints);
  const premiumCredits = useUserStore((s) => s.premiumCredits);
  const xp = useUserStore((s) => s.xp);
  const level = useUserStore((s) => s.level);
  const rank = useUserStore((s) => s.rank);
  const syncWallet = useUserStore((s) => s.syncWallet);
  const effectiveIsLoggedIn = serverAuthHint || (isMounted && isLoggedIn);
  const memberInfoKey = `${locale}:authenticated`;
  const memberInfoReady = !effectiveIsLoggedIn || loadedMemberInfoKey === memberInfoKey;
  const visibleNavLinks = NAV_LINKS.filter((link) => !link.authRequired || effectiveIsLoggedIn);

  const refreshMemberInfo = useCallback(
    async () => {
      if (!effectiveIsLoggedIn) {
        setLoadedMemberInfoKey(memberInfoKey);
        return;
      }

      try {
        const response = await getCurrentUser({ locale });
        const profile = extractCurrentUser(response);

        if (!profile) {
          if (!isLoggedIn) {
            setServerAuthHint(false);
          }
          return;
        }

        const stats = profile.stats;
        const nextStats = {
          freePoints: pickNumber(stats?.freePoints, profile.freePoints),
          premiumCredits: pickNumber(stats?.premiumCredits, profile.premiumCredits),
          xp: pickNumber(stats?.xp, profile.xp),
          level: pickNumber(stats?.level, profile.level),
          rank: pickString(stats?.rank, profile.rank),
        };
        const currentUser = useUserStore.getState();
        useUserStore.setState({
          userId: pickStringValue(profile.id, profile.code) ?? currentUser.userId,
          username:
            pickStringValue(profile.username, profile.user_name) ??
            currentUser.username,
          displayName:
            pickStringValue(profile.displayName, profile.display_name, profile.name) ??
            currentUser.displayName,
          avatarUrl:
            pickStringValue(profile.avatarUrl, profile.avatar_url, profile.imageUrl, profile.image_url, profile.avatar) ??
            currentUser.avatarUrl,
          entitlements: profile.entitlements ?? {},
        });
        syncWallet(stripUndefined(nextStats));
        setServerAuthHint(true);
      } catch (error) {
        if (!isLoggedIn) {
          setServerAuthHint(false);
        }
        throw error;
      } finally {
        setLoadedMemberInfoKey(memberInfoKey);
      }
    },
    [effectiveIsLoggedIn, isLoggedIn, locale, memberInfoKey, syncWallet]
  );

  useEffect(() => {
    let active = true;

    if (!serverAuthHint && !isLoggedIn) {
      fetch("/api/auth/session", { cache: "no-store" })
        .then((response) => (response.ok ? response.json() : null))
        .then((payload: { authenticated?: boolean } | null) => {
          if (active && payload?.authenticated) setServerAuthHint(true);
        })
        .catch(() => {});
    }

    queueMicrotask(() => {
      if (!active) return;
      refreshMemberInfo().catch(() => {
        if (!active) return;
      });
    });

    return () => {
      active = false;
    };
  }, [isLoggedIn, refreshMemberInfo, serverAuthHint]);

  useEffect(() => {
    const handleWalletRefresh = () => {
      void refreshMemberInfo();
    };

    window.addEventListener(MEMBER_WALLET_REFRESH_EVENT, handleWalletRefresh);

    return () => {
      window.removeEventListener(MEMBER_WALLET_REFRESH_EVENT, handleWalletRefresh);
    };
  }, [refreshMemberInfo]);

  const isActive = (href: string) =>
    pathname.includes(`/${locale}${href}`);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-gray-800 bg-[#0a0a0f]/95 shadow-[0_8px_24px_rgba(0,0,0,0.32)] backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[1440px] min-w-0 items-center gap-1.5 overflow-hidden px-2 sm:gap-3 sm:px-3 lg:px-4">
        {/* Mobile hamburger */}
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-300 hover:bg-white/5 hover:text-white lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? t("closeMenu") : t("openMenu")}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-main-menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Logo />

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5 ml-2">
          {visibleNavLinks.map((link) => (
            <Link
              key={link.href}
              href={`/${locale}${link.href}`}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-[13px] font-semibold transition-colors",
                isActive(link.href)
                  ? "text-cyan-400 bg-cyan-500/10"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              {t(link.label)}
            </Link>
          ))}
        </nav>

        <div className="min-w-0 flex-1" />

        {effectiveIsLoggedIn && <NotificationBell />}

        <div className="hidden sm:block">
          <LanguageSwitcher />
        </div>

        <UserMenu
          isLoggedIn={effectiveIsLoggedIn}
          username={username}
          avatar={avatarUrl || null}
          freePoints={freePoints}
          premiumCredits={premiumCredits}
          rank={rank}
          xp={xp}
          level={level}
          memberInfoReady={memberInfoReady}
        />

      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <nav
          id="mobile-main-menu"
          className="lg:hidden max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-t border-gray-800 bg-[#111722] p-2.5 pb-[calc(5rem+env(safe-area-inset-bottom))] animate-slide-up"
        >
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {MOBILE_NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const locked = Boolean(link.authRequired && !effectiveIsLoggedIn);
              const href = locked
                ? `/${locale}/auth/login?next=${encodeURIComponent(`/${locale}${link.href}`)}`
                : `/${locale}${link.href}`;

              return (
              <Link
                key={link.href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex min-h-12 items-center gap-2 rounded-xl border px-2.5 py-2 text-sm font-bold transition-colors",
                  !locked && isActive(link.href)
                    ? "border-cyan-400/25 bg-cyan-500/10 text-cyan-300"
                    : locked
                      ? "border-amber-300/15 bg-amber-300/[0.04] text-amber-200/80"
                      : "border-white/5 text-gray-300 hover:border-cyan-300/20 hover:bg-white/[0.04] hover:text-white"
                )}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-black/20">
                  <Icon size={16} />
                </span>
                <span className="min-w-0 flex-1 truncate">{t(link.label)}</span>
                {locked ? <LockKeyhole size={13} className="shrink-0" /> : null}
              </Link>
              );
            })}
            <div className="col-span-2 mt-2 border-t border-gray-800 pt-2 sm:col-span-3 sm:hidden">
              <LanguageSwitcher />
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

function extractCurrentUser(response: CurrentUserResponse): CurrentUserData | null {
  if (!response || typeof response !== "object") return null;
  if ("user" in response && response.user) return extractCurrentUser(response.user);
  if ("member" in response && response.member) return extractCurrentUser(response.member);
  if ("profile" in response && response.profile) return extractCurrentUser(response.profile);
  if ("data" in response && response.data) return extractCurrentUser(response.data);
  return response as CurrentUserData;
}

function pickNumber(...values: Array<number | string | null | undefined>) {
  const value = values.find((item) => item !== undefined && item !== null);
  if (value === undefined || value === null || value === "") return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function pickString(...values: Array<string | null | undefined>) {
  const value = values.find((item) => item !== undefined && item !== null && item.trim());
  return value?.trim();
}

function pickStringValue(...values: Array<string | number | null | undefined>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return undefined;
}

function stripUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined)
  ) as Partial<{
    freePoints: number;
    premiumCredits: number;
    xp: number;
    level: number;
    rank: string;
  }>;
}

function NotificationBell() {
  const { locale } = useParams<{ locale: string }>();
  const [open, setOpen] = useState(false);
  const hasMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const notifications = useNotificationStore((s) => s.notifications);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const unreadCount = hasMounted ? notifications.filter((n) => !n.read).length : 0;
  const recent = hasMounted ? notifications.slice(0, 5) : [];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
      >
        <Bell size={18} />
        {hasMounted && unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-[#12121a] border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-gray-800">
              <h3 className="text-sm font-semibold text-white">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-1.5 text-[10px] text-gray-500">({unreadCount} new)</span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <Check size={12} /> Mark all read
                </button>
              )}
            </div>
            {recent.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-500">No notifications yet</div>
            ) : (
              <div className="max-h-[320px] overflow-y-auto">
                {recent.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      markRead(n.id);
                      if (n.actionUrl) setOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2.5 border-b border-gray-800/50 hover:bg-white/[0.03] transition-colors",
                      !n.read && "bg-cyan-500/5"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {!n.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                      )}
                      <div>
                        <p className="text-xs font-medium text-white">{n.title}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{n.message}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <Link
              href={`/${locale}/notifications`}
              onClick={() => setOpen(false)}
              className="block text-center py-2.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 border-t border-gray-800 hover:bg-white/[0.02] transition-colors"
            >
              View all notifications
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

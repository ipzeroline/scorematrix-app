"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Menu, X, Bell, Check } from "lucide-react";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { UserMenu } from "./UserMenu";
import { cn } from "@/lib/utils";
import { getMemberProfile } from "@/lib/auth-api";
import { useNotificationStore } from "@/stores/notification-store";
import { useUserStore } from "@/stores/user-store";

const NAV_LINKS = [
  { href: "/livescore", label: "livescore" },
  { href: "/matches", label: "matches" },
  { href: "/predict", label: "predict" },
  { href: "/ai-insight", label: "aiInsight" },
  { href: "/leaderboard", label: "leaderboard" },
  { href: "/missions", label: "missions", authRequired: true },
  { href: "/rewards", label: "rewards", authRequired: true },
  { href: "/news", label: "news" },
];

const emptySubscribe = () => () => {};

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { locale } = useParams<{ locale: string }>();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const username = useUserStore((s) => s.username);
  const freePoints = useUserStore((s) => s.freePoints);
  const premiumCredits = useUserStore((s) => s.premiumCredits);
  const syncWallet = useUserStore((s) => s.syncWallet);
  const visibleNavLinks = NAV_LINKS.filter((link) => !link.authRequired || isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) return;

    let active = true;

    getMemberProfile({ locale })
      .then((response) => {
        if (!active || !response.data?.profile) return;
        const profile = response.data.profile;
        syncWallet({
          freePoints: Number(profile.point_deposit ?? profile.balance_free ?? 0),
          premiumCredits: Number(profile.credit ?? 0),
        });
      })
      .catch(() => {
        // Keep the last known wallet values in the navbar if profile sync fails.
      });

    return () => {
      active = false;
    };
  }, [isLoggedIn, locale, syncWallet]);

  const isActive = (href: string) =>
    pathname.includes(`/${locale}${href}`);

  return (
    <header className="sticky top-0 z-40 glass border-b border-gray-800/50">
      <div className="max-w-[1440px] mx-auto px-4 h-14 flex items-center gap-4">
        {/* Mobile hamburger */}
        <button
          className="lg:hidden p-2 text-gray-400 hover:text-white cursor-pointer"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Logo />

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1 ml-4">
          {visibleNavLinks.map((link) => (
            <Link
              key={link.href}
              href={`/${locale}${link.href}`}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                isActive(link.href)
                  ? "text-cyan-400 bg-cyan-500/10"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              {t(link.label)}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        <div className="hidden sm:block">
          <LanguageSwitcher />
        </div>

        {isLoggedIn && <NotificationBell />}

        <UserMenu
          isLoggedIn={isLoggedIn}
          username={username}
          freePoints={freePoints}
          premiumCredits={premiumCredits}
        />

      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <nav className="lg:hidden border-t border-gray-800 bg-[#12121a] p-4 animate-slide-up">
          <div className="flex flex-col gap-1">
            {visibleNavLinks.map((link) => (
              <Link
                key={link.href}
                href={`/${locale}${link.href}`}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "text-cyan-400 bg-cyan-500/10"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                {t(link.label)}
              </Link>
            ))}
            <div className="mt-2 pt-2 border-t border-gray-800 sm:hidden">
              <LanguageSwitcher />
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

function NotificationBell() {
  const { locale } = useParams<{ locale: string }>();
  const [open, setOpen] = useState(false);
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const notifications = useNotificationStore((s) => s.notifications);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const unreadCount = isMounted ? notifications.filter((n) => !n.read).length : 0;
  const recent = isMounted ? notifications.slice(0, 5) : [];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
      >
        <Bell size={18} />
        {isMounted && unreadCount > 0 && (
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

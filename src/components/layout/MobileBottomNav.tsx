"use client";
import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Home, Activity, Target, Trophy, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user-store";

const BOTTOM_LINKS = [
  { href: "", label: "home", icon: Home },
  { href: "/livescore", label: "livescoreShort", icon: Activity },
  { href: "/predict", label: "predict", icon: Target },
  { href: "/leaderboard", label: "rankShort", icon: Trophy, authRequired: true },
  { href: "/rewards", label: "rewards", icon: Gift, authRequired: true },
];

const emptySubscribe = () => () => {};

interface MobileBottomNavProps {
  initialHasAuthSession?: boolean;
}

export function MobileBottomNav({ initialHasAuthSession = false }: MobileBottomNavProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { locale } = useParams<{ locale: string }>();
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const effectiveIsLoggedIn = initialHasAuthSession || (isMounted && isLoggedIn);
  const isActive = (href: string) => {
    if (href === "") return pathname === `/${locale}`;
    return pathname.startsWith(`/${locale}${href}`);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-800 bg-[#0a0a0f]/95 shadow-[0_-8px_24px_rgba(0,0,0,0.32)] safe-area-bottom backdrop-blur lg:hidden">
      <div className="mx-auto flex h-[60px] max-w-md items-center justify-between px-1.5">
        {BOTTOM_LINKS.map((link) => {
          const Icon = link.icon;
          const locked = Boolean(link.authRequired && !effectiveIsLoggedIn);
          const active = !locked && isActive(link.href);
          const href = locked
            ? `/${locale}/auth/login?next=${encodeURIComponent(`/${locale}${link.href}`)}`
            : `/${locale}${link.href}`;
          return (
            <Link
              key={link.href}
              href={href}
              aria-label={locked ? `${t(link.label)} locked` : undefined}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1 transition-colors",
                active ? "text-cyan-400" : locked ? "text-amber-300/70" : "text-gray-500"
              )}
            >
              <Icon size={18} className="shrink-0" />
              <span className="max-w-[70px] truncate text-[9px] font-semibold leading-none">
                {t(link.label)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

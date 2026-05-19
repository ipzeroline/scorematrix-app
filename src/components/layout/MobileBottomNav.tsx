"use client";
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
  { href: "/leaderboard", label: "rankShort", icon: Trophy },
  { href: "/rewards", label: "rewards", icon: Gift, authRequired: true },
];

export function MobileBottomNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { locale } = useParams<{ locale: string }>();
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const visibleLinks = BOTTOM_LINKS.filter((link) => !link.authRequired || isLoggedIn);

  const isActive = (href: string) => {
    if (href === "") return pathname === `/${locale}`;
    return pathname.startsWith(`/${locale}${href}`);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-gray-800 bg-[#0a0a0f] shadow-[0_-10px_30px_rgba(0,0,0,0.35)] safe-area-bottom">
      <div className="flex items-center justify-around h-14 px-2">
        {visibleLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={`/${locale}${link.href}`}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg min-w-0 transition-colors",
                active ? "text-cyan-400" : "text-gray-500"
              )}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium leading-none">
                {t(link.label)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

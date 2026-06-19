"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Activity,
  BarChart3,
  Brain,
  Calendar,
  Coins,
  Gift,
  Home,
  Mail,
  Newspaper,
  LockKeyhole,
  Share2,
  Sparkles,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user-store";

const emptySubscribe = () => () => {};

const SIDEBAR_LINKS = [
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
  { href: "/credits", label: "credits", icon: Coins },
  { href: "/stats", label: "stats", icon: BarChart3, authRequired: true },
  { href: "/affiliate", label: "affiliate", icon: Share2, authRequired: true },
  { href: "/leagues", label: "leagues", icon: Users, authRequired: true },
  { href: "/legal/contact", label: "contactTeam", icon: Mail },
];

interface SidebarProps {
  initialHasAuthSession?: boolean;
}

export function Sidebar({ initialHasAuthSession = false }: SidebarProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const { locale } = useParams<{ locale: string }>();
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const effectiveIsLoggedIn = initialHasAuthSession || (isMounted && isLoggedIn);
  const visibleLinks = SIDEBAR_LINKS;

  const isActive = (href: string) => {
    if (href === "") return pathname === `/${locale}`;
    return pathname.startsWith(`/${locale}${href}`);
  };

  return (
    <aside className="sticky top-14 hidden min-h-[calc(100vh-3.5rem)] w-56 shrink-0 flex-col border-r border-cyan-300/10 bg-[#0b0d14] p-3 lg:flex">
      <nav className="flex flex-col gap-1">
        {visibleLinks.map((link) => {
          const Icon = link.icon;
          const locked = Boolean(link.authRequired && !effectiveIsLoggedIn);
          const active = !locked && isActive(link.href);
          const accent = getSidebarAccent(link.label);
          const href = locked
            ? `/${locale}/auth/login?next=${encodeURIComponent(`/${locale}${link.href}`)}`
            : `/${locale}${link.href}`;
          return (
            <Link
              key={link.href}
              href={href}
              aria-label={locked ? `${t(`nav.${link.label}`)} locked` : undefined}
              className={cn(
                "group relative flex items-center gap-3 overflow-hidden rounded-xl border px-3 py-2.5 text-sm font-bold transition-all duration-200",
                active
                  ? cn("border-cyan-300/25 bg-cyan-300/10 text-cyan-200 shadow-[0_0_22px_rgba(34,211,238,0.08)]", accent.active)
                  : locked
                    ? "border-white/5 text-gray-500 hover:border-amber-300/20 hover:bg-amber-300/[0.05] hover:text-amber-100"
                    : "border-transparent text-gray-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-white",
              )}
            >
              {accent.highlight && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-y-2 left-0 w-0.5 rounded-full opacity-70 transition-opacity group-hover:opacity-100",
                    accent.bar
                  )}
                />
              )}
              <span
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-lg border transition-colors",
                  active
                    ? accent.iconActive
                    : locked
                      ? "border-amber-300/15 bg-amber-300/[0.04] text-amber-200/70 group-hover:text-amber-100"
                    : accent.highlight
                      ? accent.icon
                      : "border-transparent text-gray-400 group-hover:border-white/10 group-hover:bg-white/[0.04] group-hover:text-white"
                )}
              >
                <Icon size={18} />
              </span>
              <span className="min-w-0 truncate">{t(`nav.${link.label}`)}</span>
              {locked && (
                <span className="ml-auto grid h-6 w-6 shrink-0 place-items-center rounded-full border border-amber-300/15 bg-amber-300/[0.06] text-amber-200/80 transition-colors group-hover:text-amber-100">
                  <LockKeyhole size={12} aria-hidden="true" />
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="h-3 shrink-0" />
    </aside>
  );
}

function getSidebarAccent(label: string) {
  switch (label) {
    case "livescore":
      return {
        highlight: true,
        active: "bg-lime-300/10 text-lime-100",
        bar: "bg-lime-300 shadow-[0_0_12px_rgba(190,242,100,0.7)]",
        icon: "border-lime-300/15 bg-lime-300/[0.06] text-lime-200",
        iconActive: "border-lime-300/30 bg-lime-300/15 text-lime-100",
      };
    case "predict":
      return {
        highlight: true,
        active: "bg-cyan-300/10 text-cyan-100",
        bar: "bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.7)]",
        icon: "border-cyan-300/15 bg-cyan-300/[0.06] text-cyan-200",
        iconActive: "border-cyan-300/30 bg-cyan-300/15 text-cyan-100",
      };
    case "aiInsight":
      return {
        highlight: true,
        active: "bg-purple-300/10 text-purple-100",
        bar: "bg-purple-300 shadow-[0_0_12px_rgba(216,180,254,0.7)]",
        icon: "border-purple-300/15 bg-purple-300/[0.06] text-purple-200",
        iconActive: "border-purple-300/30 bg-purple-300/15 text-purple-100",
      };
    case "leaderboard":
      return {
        highlight: true,
        active: "bg-amber-300/10 text-amber-100",
        bar: "bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.7)]",
        icon: "border-amber-300/15 bg-amber-300/[0.06] text-amber-200",
        iconActive: "border-amber-300/30 bg-amber-300/15 text-amber-100",
      };
    case "missions":
      return {
        highlight: true,
        active: "bg-fuchsia-300/10 text-fuchsia-100",
        bar: "bg-fuchsia-300 shadow-[0_0_12px_rgba(240,171,252,0.7)]",
        icon: "border-fuchsia-300/15 bg-fuchsia-300/[0.06] text-fuchsia-200",
        iconActive: "border-fuchsia-300/30 bg-fuchsia-300/15 text-fuchsia-100",
      };
    default:
      return {
        highlight: false,
        active: "",
        bar: "",
        icon: "",
        iconActive: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
      };
  }
}

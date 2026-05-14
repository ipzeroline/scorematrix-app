"use client";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Home,
  Activity,
  Calendar,
  Brain,
  Trophy,
  Target,
  Gift,
  Users,
  Newspaper,
  Zap,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/ProgressBar";

const SIDEBAR_LINKS = [
  { href: "", label: "home", icon: Home },
  { href: "/livescore", label: "livescore", icon: Activity },
  { href: "/matches", label: "matches", icon: Calendar },
  { href: "/predict", label: "predict", icon: Target },
  { href: "/ai-insight", label: "aiInsight", icon: Brain },
  { href: "/leaderboard", label: "leaderboard", icon: Trophy },
  { href: "/missions", label: "missions", icon: Zap },
  { href: "/rewards", label: "rewards", icon: Gift },
  { href: "/affiliate", label: "affiliate", icon: Share2 },
  { href: "/leagues", label: "leagues", icon: Users },
  { href: "/news", label: "news", icon: Newspaper },
];

export function Sidebar() {
  const t = useTranslations();
  const pathname = usePathname();
  const { locale } = useParams<{ locale: string }>();

  const isActive = (href: string) => {
    if (href === "") return pathname === `/${locale}`;
    return pathname.startsWith(`/${locale}${href}`);
  };

  return (
    <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-gray-800/50 bg-[#0a0a0f] min-h-[calc(100vh-3.5rem)] sticky top-14 p-3">
      <nav className="flex flex-col gap-0.5">
        {SIDEBAR_LINKS.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={`/${locale}${link.href}`}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                active
                  ? "text-cyan-400 bg-cyan-500/10 neon-cyan"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon size={18} />
              {t(`nav.${link.label}`)}
            </Link>
          );
        })}
      </nav>

      {/* XP / Level mini card */}
      <div className="mt-auto p-3 rounded-xl bg-[#12121a] border border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">
            {t("gamification.level")} 12
          </span>
          <span className="text-xs text-purple-400 font-mono">2,840 XP</span>
        </div>
        <ProgressBar value={840} max={1000} color="purple" size="sm" />
        <p className="text-[10px] text-gray-600 mt-1">
          {t("dashboard.xpToNextLevel", { xp: 160, level: 13 })}
        </p>
      </div>
    </aside>
  );
}

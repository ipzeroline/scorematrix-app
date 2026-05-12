"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { UserMenu } from "./UserMenu";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/livescore", label: "livescore" },
  { href: "/matches", label: "matches" },
  { href: "/predict", label: "predict" },
  { href: "/ai-insight", label: "aiInsight" },
  { href: "/leaderboard", label: "leaderboard" },
  { href: "/missions", label: "missions" },
  { href: "/rewards", label: "rewards" },
  { href: "/news", label: "news" },
];

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { locale } = useParams<{ locale: string }>();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) =>
    pathname.includes(`/${locale}${href}`);

  return (
    <header className="sticky top-0 z-40 glass border-b border-gray-800/50">
      <div className="max-w-[1440px] mx-auto px-4 h-14 flex items-center gap-4">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1 ml-4">
          {NAV_LINKS.map((link) => (
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

        <UserMenu isLoggedIn username="CyberFan99" freePoints={2840} premiumCredits={150} role="admin" />

        {/* Mobile hamburger */}
        <button
          className="lg:hidden p-2 text-gray-400 hover:text-white cursor-pointer"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <nav className="lg:hidden border-t border-gray-800 bg-[#12121a] p-4 animate-slide-up">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
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

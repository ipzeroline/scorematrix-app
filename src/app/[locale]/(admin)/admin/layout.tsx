"use client";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Gift,
  Settings,
  Languages,
  Image,
  ClipboardCheck,
  ShieldAlert,
  Wifi,
  ChevronLeft,
} from "lucide-react";

const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/matches", label: "Matches", icon: Calendar },
  { href: "/admin/rewards", label: "Rewards", icon: Gift },
  { href: "/admin/scores", label: "Scores", icon: Settings },
  { href: "/admin/languages", label: "Languages", icon: Languages },
  { href: "/admin/banners", label: "Banners", icon: Image },
  { href: "/admin/redemption", label: "Redemption", icon: ClipboardCheck },
  { href: "/admin/fraud", label: "Fraud", icon: ShieldAlert },
  { href: "/admin/api-sync", label: "API Sync", icon: Wifi },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { locale } = useParams<{ locale: string }>();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === `/${locale}/admin`;
    return pathname.startsWith(`/${locale}${href}`);
  };

  return (
    <div className="flex gap-6">
      <aside className="hidden lg:block w-52 shrink-0">
        <div className="sticky top-20 space-y-1">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-1 px-3 py-2 text-xs text-gray-500 hover:text-white transition-colors mb-2"
          >
            <ChevronLeft size={14} /> Back to Site
          </Link>
          {ADMIN_LINKS.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={`/${locale}${link.href}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "text-cyan-400 bg-cyan-500/10"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon size={16} />
                {link.label}
              </Link>
            );
          })}
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}

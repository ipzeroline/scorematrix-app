"use client";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  User,
  Wallet,
  Settings,
  LogOut,
  ChevronDown,
  Shield,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { PointsBadge } from "@/components/shared/PointsBadge";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";

interface UserMenuProps {
  isLoggedIn?: boolean;
  username?: string;
  avatar?: string | null;
  freePoints?: number;
  premiumCredits?: number;
  role?: "user" | "admin";
}

export function UserMenu({
  isLoggedIn = false,
  username = "Guest",
  avatar = null,
  freePoints = 0,
  premiumCredits = 0,
  role = "user",
}: UserMenuProps) {
  const locale = useLocale();
  const t = useTranslations();

  if (!isLoggedIn) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href={`/${locale}/auth/login`}
          className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
        >
          {t("auth.login")}
        </Link>
        <Link
          href={`/${locale}/auth/register`}
          className="px-3 py-1.5 text-sm rounded-lg bg-cyan-500 text-black font-medium hover:bg-cyan-400 transition-colors"
        >
          {t("auth.register")}
        </Link>
      </div>
    );
  }

  return (
    <Dropdown
      trigger={
        <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
          <Avatar src={avatar} fallback={username} size="sm" />
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex items-center gap-2">
              <PointsBadge type="free" amount={freePoints} size="sm" />
              <PointsBadge type="premium" amount={premiumCredits} size="sm" />
            </div>
            <ChevronDown size={14} className="text-gray-500" />
          </div>
        </div>
      }
    >
      <div className="px-4 py-2 border-b border-gray-800">
        <p className="text-sm font-medium text-white">{username}</p>
        <div className="flex gap-3 mt-2">
          <PointsBadge
            type="free"
            amount={freePoints}
            size="sm"
            showLabel
          />
          <PointsBadge
            type="premium"
            amount={premiumCredits}
            size="sm"
            showLabel
          />
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
      {role === "admin" && (
        <Link href={`/${locale}/admin`}>
          <DropdownItem>
            <span className="flex items-center gap-2">
              <Shield size={14} /> {t("admin.dashboard")}
            </span>
          </DropdownItem>
        </Link>
      )}
      <div className="border-t border-gray-800 mt-1 pt-1">
        <DropdownItem danger>
          <span className="flex items-center gap-2">
            <LogOut size={14} /> {t("auth.logout")}
          </span>
        </DropdownItem>
      </div>
    </Dropdown>
  );
}

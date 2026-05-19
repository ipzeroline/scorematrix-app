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
  Shield,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { PointsBadge } from "@/components/shared/PointsBadge";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { logout as logoutApi } from "@/lib/auth-api";
import { useNotificationStore } from "@/stores/notification-store";
import { useUserStore } from "@/stores/user-store";

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
  const router = useRouter();
  const logoutUser = useUserStore((s) => s.logout);
  const addToast = useNotificationStore((s) => s.addToast);

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
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <Link
          href={`/${locale}/auth/register`}
          className="whitespace-nowrap rounded-lg bg-cyan-500 px-2 py-1 text-[11px] font-semibold text-black transition-colors hover:bg-cyan-400 sm:px-3 sm:py-1.5 sm:text-sm"
        >
          {t("auth.register")}
        </Link>
        <Link
          href={`/${locale}/auth/login`}
          className="whitespace-nowrap px-1.5 py-1 text-[11px] font-medium text-gray-400 transition-colors hover:text-white sm:px-3 sm:py-1.5 sm:text-sm"
        >
          {t("auth.login")}
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
        <DropdownItem danger onClick={handleLogout}>
          <span className="flex items-center gap-2">
            <LogOut size={14} /> {t("auth.logout")}
          </span>
        </DropdownItem>
      </div>
    </Dropdown>
  );
}

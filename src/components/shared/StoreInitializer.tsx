'use client';

import { useEffect, useRef } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AUTH_SESSION_EXPIRED_EVENT } from "@/lib/api-client";
import { useNotificationStore } from "@/stores/notification-store";
import { useUserStore } from "@/stores/user-store";

interface StoreInitializerProps {
  hasAuthSession?: boolean;
}

export function StoreInitializer({ hasAuthSession = false }: StoreInitializerProps) {
  const t = useTranslations("auth");
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useParams<{ locale: string }>();
  const addToast = useNotificationStore((s) => s.addToast);
  const logout = useUserStore((s) => s.logout);
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const synced = useRef(false);

  // Synchronously set isLoggedIn from server cookie before first render
  // to prevent the navbar flash on refresh
  useEffect(() => {
    if (synced.current) return;
    synced.current = true;

    if (hasAuthSession && !isLoggedIn) {
      useUserStore.setState({ isLoggedIn: true });
    }
  }, [hasAuthSession, isLoggedIn]);

  useEffect(() => {
    const handleSessionExpired = () => {
      logout();
      addToast({
        type: "warning",
        title: t("sessionExpiredTitle"),
        message: t("sessionExpiredMessage"),
      });

      if (pathname.includes(`/${locale}/auth/login`)) return;

      const currentPath = `${pathname}${window.location.search}`;
      const nextPath = currentPath.startsWith(`/${locale}`)
        ? currentPath
        : `/${locale}`;
      router.replace(`/${locale}/auth/login?next=${encodeURIComponent(nextPath)}`);
    };

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);

    return () => {
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, [addToast, locale, logout, pathname, router, t]);

  return null;
}

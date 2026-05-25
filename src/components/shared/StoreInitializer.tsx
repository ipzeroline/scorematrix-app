'use client';

import { useEffect } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AUTH_SESSION_EXPIRED_EVENT } from "@/lib/api-client";
import { useNotificationStore } from "@/stores/notification-store";
import { useUserStore } from "@/stores/user-store";

export function StoreInitializer() {
  const t = useTranslations("auth");
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useParams<{ locale: string }>();
  const addToast = useNotificationStore((s) => s.addToast);
  const logout = useUserStore((s) => s.logout);

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

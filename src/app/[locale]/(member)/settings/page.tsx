"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LOCALES } from "@/lib/constants";
import { useUserStore } from "@/stores/user-store";
import {
  extractCurrentUser,
  getCurrentUser,
  updateUserPreferences,
} from "@/lib/auth-api";
import { isAuthSessionExpiredError } from "@/lib/api-client";
import { Moon, Bell, Globe, Eye, Clock, Trophy } from "lucide-react";

type PreferenceKey =
  | "pushNotifications"
  | "matchReminder1hr"
  | "matchReminder30min"
  | "rankChangeAlert"
  | "resultNotification"
  | "publicProfile";

const NOTIFICATION_TOGGLES: {
  key: PreferenceKey;
  icon: LucideIcon;
  iconColor: string;
  title: string;
  desc: string;
}[] = [
  {
    key: "pushNotifications",
    icon: Bell,
    iconColor: "text-cyan-400",
    title: "notifications",
    desc: "notificationsDesc",
  },
  {
    key: "matchReminder1hr",
    icon: Clock,
    iconColor: "text-cyan-400",
    title: "matchReminder1hr",
    desc: "matchReminder1hrDesc",
  },
  {
    key: "matchReminder30min",
    icon: Clock,
    iconColor: "text-amber-400",
    title: "matchReminder30min",
    desc: "matchReminder30minDesc",
  },
  {
    key: "rankChangeAlert",
    icon: Trophy,
    iconColor: "text-amber-400",
    title: "rankChangeAlert",
    desc: "rankChangeAlertDesc",
  },
  {
    key: "resultNotification",
    icon: Bell,
    iconColor: "text-green-400",
    title: "resultNotification",
    desc: "resultNotificationDesc",
  },
  {
    key: "publicProfile",
    icon: Eye,
    iconColor: "text-cyan-400",
    title: "publicProfile",
    desc: "publicProfileDesc",
  },
];

function Toggle({
  checked,
  disabled,
  onClick,
}: {
  checked: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onClick}
      className={`w-10 h-6 rounded-full transition-colors ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${checked ? "bg-cyan-500" : "bg-gray-700"}`}
    >
      <div
        className={`w-4 h-4 rounded-full bg-white transition-transform mx-0.5 ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();
  const ts = useTranslations("settings");
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const preferences = useUserStore((s) => s.preferences);
  const updatePreference = useUserStore((s) => s.updatePreference);
  const [language, setLanguage] = useState(locale);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  // Hydrate the toggles from the server so they reflect the saved state.
  useEffect(() => {
    if (!isLoggedIn) return;
    let active = true;

    getCurrentUser({ locale })
      .then((response) => {
        if (!active) return;
        const prefs = extractCurrentUser(response)?.preferences;
        if (!prefs) return;
        const apply = (key: PreferenceKey, value: boolean | null | undefined) => {
          if (typeof value === "boolean") updatePreference(key, value);
        };
        apply("publicProfile", prefs.publicProfile);
        apply("pushNotifications", prefs.pushNotifications);
        apply("matchReminder1hr", prefs.matchReminder1hr);
        apply("matchReminder30min", prefs.matchReminder30min);
        apply("resultNotification", prefs.resultNotification);
        apply("rankChangeAlert", prefs.rankChangeAlert);
      })
      .catch(() => {
        /* keep existing local values on failure */
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, locale]);
  const isLoadingPreferences = isLoggedIn && loading;

  const switchLanguage = (newLocale: string) => {
    setLanguage(newLocale);

    if (newLocale !== locale) {
      router.push(pathname.replace(`/${locale}`, `/${newLocale}`));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(false);
    try {
      await updateUserPreferences(
        {
          publicProfile: preferences.publicProfile,
          pushNotifications: preferences.pushNotifications,
          matchReminder1hr: preferences.matchReminder1hr,
          matchReminder30min: preferences.matchReminder30min,
          resultNotification: preferences.resultNotification,
          rankChangeAlert: preferences.rankChangeAlert,
        },
        { locale }
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      if (!isAuthSessionExpiredError(error)) setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-xl font-bold font-display text-white">
        {ts("title")}
      </h1>

      {/* Language */}
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Globe size={18} className="text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">{ts("language")}</h3>
        </div>
        <select
          value={language}
          onChange={(e) => switchLanguage(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-[#0a0a0f] px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer"
        >
          {LOCALES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.native} ({l.label})
            </option>
          ))}
        </select>
      </Card>

      {/* Notification & privacy toggles (synced with the API) */}
      {NOTIFICATION_TOGGLES.map(({ key, icon: Icon, iconColor, title, desc }) => (
        <Card key={key} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon size={18} className={iconColor} />
              <div>
                <h3 className="text-sm font-semibold text-white">{ts(title)}</h3>
                <p className="text-xs text-gray-500">{ts(desc)}</p>
              </div>
            </div>
            {isLoadingPreferences ? (
              <div className="w-10 h-6 rounded-full bg-gray-800 animate-pulse" />
            ) : (
              <Toggle
                checked={preferences[key]}
                onClick={() => updatePreference(key, !preferences[key])}
              />
            )}
          </div>
        </Card>
      ))}

      {/* Dark Mode */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Moon size={18} className="text-cyan-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">
                {ts("darkMode")}
              </h3>
              <p className="text-xs text-gray-500">{ts("alwaysEnabled")}</p>
            </div>
          </div>
          <span className="text-xs text-cyan-400 font-medium">{ts("on")}</span>
        </div>
      </Card>

      <div className="space-y-2">
        <Button
          onClick={handleSave}
          disabled={saving || isLoadingPreferences}
          className="w-full"
          size="lg"
          neon
        >
          {saving
            ? t("common.loading")
            : saved
              ? ts("saved")
              : ts("saveSettings")}
        </Button>
        {saveError && (
          <p className="text-center text-xs text-red-400">{t("common.error")}</p>
        )}
      </div>
    </div>
  );
}

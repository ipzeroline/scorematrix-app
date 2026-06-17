"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LOCALES } from "@/lib/constants";
import { useUserStore } from "@/stores/user-store";
import {
  extractCurrentUser,
  getCurrentUser,
  updateUserPreferences,
} from "@/lib/auth-api";
import { isAuthSessionExpiredError } from "@/lib/api-client";
import {
  Bell,
  CheckCircle2,
  Clock,
  Eye,
  Globe,
  Save,
  ShieldCheck,
  Trophy,
} from "lucide-react";

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
];

const PRIVACY_TOGGLES: {
  key: PreferenceKey;
  icon: LucideIcon;
  iconColor: string;
  title: string;
  desc: string;
}[] = [
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
      className={`h-7 w-12 rounded-full border transition-colors ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${checked ? "border-cyan-300/50 bg-cyan-500" : "border-gray-700 bg-gray-800"}`}
    >
      <div
        className={`mx-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
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
    <div className="mx-auto max-w-6xl space-y-5 pb-8 sm:space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#070b13] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-6 lg:p-7">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.13),transparent_34%),linear-gradient(315deg,rgba(168,85,247,0.13),transparent_30%),linear-gradient(rgba(148,163,184,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.045)_1px,transparent_1px)] bg-[auto,auto,34px_34px,34px_34px]" />
        <div className="relative grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex min-h-[300px] flex-col justify-between rounded-2xl border border-white/10 bg-black/24 p-4 sm:p-5">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge variant="cyan" size="md" className="uppercase tracking-wider">
                  {ts("commandCenter")}
                </Badge>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-200">
                  <ShieldCheck size={14} />
                  {ts("skillNotice")}
                </span>
              </div>
              <h1 className="break-words text-4xl font-black leading-[1.15] text-white sm:text-5xl">
                {ts("title")}
              </h1>
              <p className="mt-3 max-w-2xl break-words text-base leading-7 text-gray-300 sm:text-lg">
                {ts("settingsHint")}
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <HeroMetric
                icon={Bell}
                label={ts("notificationControl")}
                value={NOTIFICATION_TOGGLES.length.toString()}
                tone="text-cyan-300"
              />
              <HeroMetric
                icon={Eye}
                label={ts("privacyControl")}
                value={PRIVACY_TOGGLES.length.toString()}
                tone="text-purple-300"
              />
            </div>
          </div>

          <Card className="relative overflow-hidden border-cyan-400/15 bg-[#0b111d] p-4 sm:p-5">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400/80 via-purple-400/70 to-amber-300/70" />
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-wider text-cyan-300">
                  {ts("languagePanel")}
                </p>
                <h2 className="mt-1 break-words text-xl font-black leading-snug text-white sm:text-2xl">
                  {ts("language")}
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
                <Globe size={22} />
              </div>
            </div>
            <p className="mt-3 break-words text-sm leading-6 text-gray-400">
              {ts("languageHint")}
            </p>
            <select
              value={language}
              onChange={(e) => switchLanguage(e.target.value)}
              className="mt-5 min-h-12 w-full rounded-xl border border-cyan-400/20 bg-black/30 px-4 text-base font-bold text-white transition-colors focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
            >
              {LOCALES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.native} ({l.label})
                </option>
              ))}
            </select>
          </Card>
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          icon={Bell}
          eyebrow={ts("notificationControl")}
          title={ts("notificationTitle")}
          description={ts("notificationHint")}
        />

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[...NOTIFICATION_TOGGLES, ...PRIVACY_TOGGLES].map((item) => (
            <SettingToggleCard
              key={item.key}
              item={item}
              checked={preferences[item.key]}
              loading={isLoadingPreferences}
              onToggle={() => updatePreference(item.key, !preferences[item.key])}
              translate={ts}
            />
          ))}
        </div>
      </section>

      <Card className="border-cyan-400/15 bg-[#0b111d] p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
              {saved ? <CheckCircle2 size={20} /> : <Save size={20} />}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-wider text-cyan-300">
                {ts("savePanel")}
              </p>
              <h3 className="mt-1 break-words text-xl font-black leading-snug text-white">
                {saved ? ts("saved") : ts("saveSettings")}
              </h3>
              <p className="mt-1 break-words text-sm leading-6 text-gray-400">
                {ts("saveHint")}
              </p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving || isLoadingPreferences}
            className="min-h-12 px-6 text-base font-black"
            size="lg"
            neon
          >
            {saving
              ? t("common.loading")
              : saved
                ? ts("saved")
                : ts("saveSettings")}
          </Button>
        </div>
        {saveError && (
          <p className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-center text-sm text-red-300">
            {t("common.error")}
          </p>
        )}
      </Card>
    </div>
  );
}

function HeroMetric({
  icon: Icon,
  label,
  value,
  tone,
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: string;
  className?: string;
}) {
  return (
    <div className={`min-w-0 rounded-2xl border border-white/10 bg-black/28 p-4 ${className ?? ""}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-bold leading-6 text-gray-400">
          {label}
        </p>
        <Icon size={18} className={tone} />
      </div>
      <p className="mt-2 break-words text-3xl font-black leading-none text-white">
        {value}
      </p>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-white/10 bg-[#080d17] p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-wider text-cyan-300">
          {eyebrow}
        </p>
        <h2 className="mt-1 break-words text-xl font-black leading-snug text-white">
          {title}
        </h2>
        <p className="mt-1 break-words text-sm leading-6 text-gray-400">
          {description}
        </p>
      </div>
    </div>
  );
}

function SettingToggleCard({
  item,
  checked,
  loading,
  onToggle,
  translate,
}: {
  item: {
    key: PreferenceKey;
    icon: LucideIcon;
    iconColor: string;
    title: string;
    desc: string;
  };
  checked: boolean;
  loading: boolean;
  onToggle: () => void;
  translate: ReturnType<typeof useTranslations<"settings">>;
}) {
  const Icon = item.icon;

  return (
    <Card className="min-h-[150px] border-white/10 bg-[#0b111d] p-4 sm:p-5">
      <div className="flex h-full flex-col justify-between gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/24">
              <Icon size={20} className={item.iconColor} />
            </div>
            <div className="min-w-0">
              <h3 className="break-words text-base font-black leading-snug text-white">
                {translate(item.title)}
              </h3>
              <p className="mt-1 break-words text-sm leading-6 text-gray-400">
                {translate(item.desc)}
              </p>
            </div>
          </div>
          <div className="shrink-0">
            {loading ? (
              <div className="h-7 w-12 animate-pulse rounded-full bg-gray-800" />
            ) : (
              <Toggle checked={checked} onClick={onToggle} />
            )}
          </div>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-black/30">
          <div
            className={`h-full rounded-full ${
              checked ? "w-full bg-cyan-400" : "w-1/3 bg-gray-700"
            }`}
          />
        </div>
      </div>
    </Card>
  );
}

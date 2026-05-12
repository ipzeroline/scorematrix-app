"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LOCALES } from "@/lib/constants";
import { Moon, Bell, Globe, Eye } from "lucide-react";

export default function SettingsPage() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();
  const [language, setLanguage] = useState(locale);
  const [notifications, setNotifications] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const [saved, setSaved] = useState(false);

  const switchLanguage = (newLocale: string) => {
    setLanguage(newLocale);

    if (newLocale !== locale) {
      router.push(pathname.replace(`/${locale}`, `/${newLocale}`));
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-xl font-bold font-display text-white">
        {t("settings.title")}
      </h1>

      {/* Language */}
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Globe size={18} className="text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">
            {t("settings.language")}
          </h3>
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

      {/* Notifications */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={18} className="text-cyan-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">
                {t("settings.notifications")}
              </h3>
              <p className="text-xs text-gray-500">
                {t("settings.notificationsDesc")}
              </p>
            </div>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`w-10 h-6 rounded-full transition-colors cursor-pointer ${
              notifications ? "bg-cyan-500" : "bg-gray-700"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform mx-0.5 ${
                notifications ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </Card>

      {/* Public Profile */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye size={18} className="text-cyan-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">
                {t("settings.publicProfile")}
              </h3>
              <p className="text-xs text-gray-500">
                {t("settings.publicProfileDesc")}
              </p>
            </div>
          </div>
          <button
            onClick={() => setPublicProfile(!publicProfile)}
            className={`w-10 h-6 rounded-full transition-colors cursor-pointer ${
              publicProfile ? "bg-cyan-500" : "bg-gray-700"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform mx-0.5 ${
                publicProfile ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </Card>

      {/* Dark Mode */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Moon size={18} className="text-cyan-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">
                {t("settings.darkMode")}
              </h3>
              <p className="text-xs text-gray-500">
                {t("settings.alwaysEnabled")}
              </p>
            </div>
          </div>
          <span className="text-xs text-cyan-400 font-medium">
            {t("settings.on")}
          </span>
        </div>
      </Card>

      <Button onClick={handleSave} className="w-full" size="lg" neon>
        {saved ? t("settings.saved") : t("settings.saveSettings")}
      </Button>
    </div>
  );
}

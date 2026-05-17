"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { leagues } from "@/data/leagues";
import { teams } from "@/data/teams";
import { LOCALES } from "@/i18n";
import { useUserStore } from "@/stores/user-store";
import { useShallow } from "zustand/react/shallow";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const teamOptions = [
  { value: "", label: "-" },
  ...teams
    .map((team) => {
      const league = leagues.find((l) => l.id === team.leagueId);
      return {
        value: team.id,
        label: `${league?.flagEmoji ?? ""} ${team.name} (${team.shortName})`,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label)),
];

const languageOptions = LOCALES.map((l) => ({
  value: l.code,
  label: `${l.native} (${l.label})`,
}));

export default function EditProfilePage() {
  const profileT = useTranslations("profile");
  const authT = useTranslations("auth");
  const commonT = useTranslations("common");
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();
  const currentYear = new Date().getFullYear();
  const latestAllowedBirthYear = currentYear - 13;
  const user = useUserStore(
    useShallow((s) => ({
      username: s.username,
      displayName: s.displayName,
      email: s.email,
      phone: s.phone,
      birthYear: s.birthYear,
      favoriteTeam: s.favoriteTeam,
      playerType: s.playerType,
      language: s.language,
      updateProfile: s.updateProfile,
    }))
  );
  const [form, setForm] = useState({
    displayName: user.displayName,
    email: user.email,
    phone: user.phone,
    birthYear: user.birthYear,
    favoriteTeam: user.favoriteTeam,
    playerType: user.playerType,
    language: user.language || locale,
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  const playerTypeOptions = [
    { value: "", label: authT("selectPlayerType") },
    { value: "casual", label: authT("playerTypeCasual") },
    { value: "analyst", label: authT("playerTypeAnalyst") },
    { value: "competitive", label: authT("playerTypeCompetitive") },
  ];

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if ((touched.displayName || form.displayName) && form.displayName.trim().length < 2) {
      e.displayName = profileT("displayNameMinLength");
    }
    if (touched.email || form.email) {
      if (!form.email) e.email = authT("emailRequired");
      else if (!isValidEmail(form.email)) e.email = authT("emailInvalid");
    }
    if (touched.phone || form.phone) {
      if (form.phone && !/^[0-9+\-\s()]{8,20}$/.test(form.phone)) {
        e.phone = authT("phoneInvalid");
      }
    }
    if (touched.birthYear || form.birthYear) {
      const year = Number(form.birthYear);
      if (!Number.isInteger(year) || year < 1900 || year > latestAllowedBirthYear) {
        e.birthYear = authT("birthYearInvalid");
      }
    }
    return e;
  }, [authT, form, latestAllowedBirthYear, profileT, touched]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      displayName: true,
      email: true,
      phone: true,
      birthYear: true,
    });

    if (Object.keys(errors).length > 0) return;

    user.updateProfile({
      displayName: form.displayName.trim() || user.username,
      email: form.email.trim(),
      phone: form.phone.trim(),
      birthYear: form.birthYear,
      favoriteTeam: form.favoriteTeam,
      playerType: form.playerType,
      language: form.language,
    });
    setSaved(true);
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-white">
            {profileT("editProfile")}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{profileT("editProfileHint")}</p>
        </div>
        <Link
          href={`/${locale}/profile`}
          className="inline-flex items-center justify-center rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:border-cyan-500/50 hover:text-cyan-400"
        >
          {commonT("back")}
        </Link>
      </div>

      <Card className="p-5">
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input
            label={authT("username")}
            value={user.username}
            disabled
            className="disabled:cursor-not-allowed disabled:opacity-60"
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label={authT("displayName")}
              value={form.displayName}
              onChange={(e) => update("displayName", e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, displayName: true }))}
              error={errors.displayName}
              autoComplete="name"
            />
            <Input
              label={authT("email")}
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              error={errors.email}
              autoComplete="email"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label={`${authT("phone")} (${authT("optional")})`}
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
              error={errors.phone}
              autoComplete="tel"
            />
            <Input
              label={authT("birthYear")}
              type="number"
              value={form.birthYear}
              onChange={(e) => update("birthYear", e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, birthYear: true }))}
              error={errors.birthYear}
              min={1900}
              max={latestAllowedBirthYear}
              inputMode="numeric"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-400">
                {authT("favoriteTeam")}
              </label>
              <Select
                options={teamOptions}
                value={form.favoriteTeam}
                onChange={(v) => update("favoriteTeam", v)}
                className="w-full"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-400">
                {authT("playerType")}
              </label>
              <Select
                options={playerTypeOptions}
                value={form.playerType}
                onChange={(v) => update("playerType", v)}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">
              {authT("language")}
            </label>
            <Select
              options={languageOptions}
              value={form.language}
              onChange={(v) => update("language", v)}
              className="w-full"
            />
          </div>

          {saved && (
            <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-sm text-green-400">
              {profileT("profileSaved")}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            neon
            disabled={Object.keys(errors).length > 0}
          >
            <Save size={18} />
            {profileT("saveProfile")}
          </Button>
        </form>
      </Card>
    </div>
  );
}

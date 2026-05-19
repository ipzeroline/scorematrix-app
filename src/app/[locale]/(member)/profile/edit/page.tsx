"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Save } from "lucide-react";
import { FavoriteTeamSelect } from "@/components/auth/FavoriteTeamSelect";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { LOCALES } from "@/i18n";
import { ApiClientError } from "@/lib/api-client";
import { getMemberProfile, updateMemberProfile } from "@/lib/auth-api";
import { getSoccerTeamGroups, type SoccerTeamGroup } from "@/lib/soccer-api";
import { useNotificationStore } from "@/stores/notification-store";
import { useUserStore } from "@/stores/user-store";
import { useShallow } from "zustand/react/shallow";

const languageOptions = LOCALES.map((l) => ({
  value: l.code,
  label: `${l.native} (${l.label})`,
}));

const countryOptions = [
  { value: "", label: "-" },
  { value: "TH", label: "TH - Thailand" },
  { value: "LA", label: "LA - Laos" },
  { value: "KH", label: "KH - Cambodia" },
  { value: "MM", label: "MM - Myanmar" },
  { value: "MY", label: "MY - Malaysia" },
  { value: "SG", label: "SG - Singapore" },
  { value: "VN", label: "VN - Vietnam" },
  { value: "OTHER", label: "OTHER" },
];

export default function EditProfilePage() {
  const profileT = useTranslations("profile");
  const authT = useTranslations("auth");
  const commonT = useTranslations("common");
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();
  const currentYear = new Date().getFullYear();
  const addToast = useNotificationStore((s) => s.addToast);
  const user = useUserStore(
    useShallow((s) => ({
      username: s.username,
      displayName: s.displayName,
      email: s.email,
      phone: s.phone,
      birthYear: s.birthYear,
      country: s.country,
      favoriteTeam: s.favoriteTeam,
      playerType: s.playerType,
      language: s.language,
      marketingConsent: s.marketingConsent,
      updateProfile: s.updateProfile,
    }))
  );
  const updateStoredProfile = user.updateProfile;
  const [form, setForm] = useState({
    displayName: user.displayName,
    email: user.email,
    phone: user.phone,
    birthYear: extractBirthYear(user.birthYear),
    country: user.country,
    favoriteTeam: user.favoriteTeam,
    playerType: user.playerType,
    language: user.language || locale,
    marketingConsent: user.marketingConsent,
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [teamGroups, setTeamGroups] = useState<SoccerTeamGroup[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const [saved, setSaved] = useState(false);

  const playerTypeOptions = [
    { value: "", label: authT("selectPlayerType") },
    { value: "casual", label: authT("playerTypeCasual") },
    { value: "analyst", label: authT("playerTypeAnalyst") },
    { value: "competitive", label: authT("playerTypeCompetitive") },
  ];

  useEffect(() => {
    let active = true;

    getSoccerTeamGroups({ locale })
      .then((response) => {
        if (!active) return;
        setTeamGroups(response.teams);
      })
      .catch(() => {
        if (!active) return;
        setTeamGroups([]);
      })
      .finally(() => {
        if (!active) return;
        setTeamsLoading(false);
      });

    getMemberProfile({ locale })
      .then((response) => {
        if (!active || !response.data?.profile) return;
        const profile = response.data.profile;
        const nextProfile = {
          displayName: profile.name ?? "",
          email: profile.email ?? "",
          phone: profile.phone ?? profile.tel ?? "",
          birthYear: extractBirthYear(profile.birth_day),
          country: profile.country ?? "",
          favoriteTeam: profile.favorite_team ?? "",
          playerType: profile.player_type ?? "",
          language: profile.language ?? locale,
          marketingConsent: Boolean(profile.marketing_consent),
        };

        setForm(nextProfile);
        updateStoredProfile(nextProfile);
      })
      .catch((error) => {
        if (!active) return;
        setServerError(getProfileErrorMessage(error));
      })
      .finally(() => {
        if (!active) return;
        setProfileLoading(false);
      });

    return () => {
      active = false;
    };
  }, [locale, updateStoredProfile]);

  const update = (field: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
    setServerError("");
  };

  const markTouched = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const errors = useMemo(() => {
    const e: Record<string, string> = {};

    if (touched.displayName || form.displayName) {
      if (form.displayName.length > 100) e.displayName = authT("displayNameMaxLength");
    }
    if (touched.phone || form.phone) {
      if (form.phone.length > 20) e.phone = authT("phoneMaxLength");
    }
    if (touched.birthYear || form.birthYear) {
      const year = Number(form.birthYear);
      if (!Number.isInteger(year) || year < 1900 || year > currentYear) {
        e.birthYear = authT("birthYearInvalid");
      }
    }
    if (touched.favoriteTeam || form.favoriteTeam) {
      if (form.favoriteTeam.length > 100) e.favoriteTeam = authT("favoriteTeamMaxLength");
    }
    if (touched.playerType || form.playerType) {
      if (form.playerType.length > 50) e.playerType = authT("playerTypeMaxLength");
    }
    if (touched.language || form.language) {
      if (form.language.length > 10) e.language = authT("languageMaxLength");
    }

    return e;
  }, [authT, currentYear, form, touched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      displayName: true,
      phone: true,
      birthYear: true,
      favoriteTeam: true,
      playerType: true,
      language: true,
    });

    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    setServerError("");

    try {
      const response = await updateMemberProfile(
        {
          displayName: form.displayName.trim() || undefined,
          phone: form.phone.trim() || undefined,
          country: form.country || undefined,
          favoriteTeam: form.favoriteTeam || undefined,
          language: form.language || undefined,
          birthYear: form.birthYear ? Number(form.birthYear) : undefined,
          playerType: form.playerType || undefined,
          marketingConsent: form.marketingConsent,
        },
        { locale: form.language }
      );
      const data = response.data;

      user.updateProfile({
        displayName: data?.name ?? form.displayName.trim(),
        email: data?.email ?? form.email,
        phone: data?.tel ?? form.phone.trim(),
        birthYear: extractBirthYear(data?.birth_day) || extractBirthYear(form.birthYear),
        country: data?.country ?? form.country,
        favoriteTeam: data?.favorite_team ?? form.favoriteTeam,
        playerType: data?.player_type ?? form.playerType,
        language: data?.language ?? form.language,
        marketingConsent: data?.marketing_consent ?? form.marketingConsent,
      });
      setSaved(true);
      addToast({
        type: "success",
        title: profileT("profileSaved"),
      });
      router.refresh();
    } catch (error) {
      const message = getProfileErrorMessage(error);
      setServerError(message);
      addToast({
        type: "error",
        title: commonT("error"),
        message,
      });
    } finally {
      setSaving(false);
    }
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
              onBlur={() => markTouched("displayName")}
              error={errors.displayName}
              autoComplete="name"
              disabled={profileLoading}
              maxLength={100}
            />
            <Input
              label={authT("email")}
              type="email"
              value={form.email}
              disabled
              className="disabled:cursor-not-allowed disabled:opacity-60"
              autoComplete="email"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label={`${authT("phone")} (${authT("optional")})`}
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              onBlur={() => markTouched("phone")}
              error={errors.phone}
              autoComplete="tel"
              disabled={profileLoading}
              maxLength={20}
            />
            <Input
              label={authT("birthYear")}
              type="text"
              value={form.birthYear}
              onChange={(e) => update("birthYear", normalizeBirthYearInput(e.target.value))}
              onBlur={() => markTouched("birthYear")}
              error={errors.birthYear}
              min={1900}
              max={currentYear}
              maxLength={4}
              pattern="[0-9]{4}"
              inputMode="numeric"
              disabled={profileLoading}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-400">
                {authT("country")}
              </label>
              <Select
                options={countryOptions}
                value={form.country}
                onChange={(v) => update("country", v)}
                className="w-full"
                disabled={profileLoading}
              />
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
                disabled={profileLoading}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-400">
                {authT("favoriteTeam")}
              </label>
              <FavoriteTeamSelect
                groups={teamGroups}
                value={form.favoriteTeam}
                onChange={(v) => update("favoriteTeam", v)}
                placeholder={teamsLoading ? commonT("loading") : authT("selectTeam")}
                searchPlaceholder={authT("searchTeams")}
                loading={teamsLoading || profileLoading}
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
                className="h-[50px] w-full"
                disabled={profileLoading}
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="checkbox"
              checked={form.marketingConsent}
              onChange={(e) => update("marketingConsent", e.target.checked)}
              disabled={profileLoading}
              className="mt-0.5 h-4 w-4 rounded border-gray-700 bg-[#0a0a0f] text-cyan-500 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <span className="text-sm text-gray-400">
              {authT("marketingConsent")}
            </span>
          </label>

          {serverError && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {serverError}
            </div>
          )}

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
            loading={saving}
            disabled={profileLoading || Object.keys(errors).length > 0}
          >
            <Save size={18} />
            {profileT("saveProfile")}
          </Button>
        </form>
      </Card>
    </div>
  );
}

function extractBirthYear(value?: string | null) {
  if (!value) return "";
  const text = String(value).trim();
  const leadingYear = text.match(/^(\d{4})/);
  if (leadingYear) return leadingYear[1];

  return text.match(/\b(19|20)\d{2}\b/)?.[0] ?? "";
}

function normalizeBirthYearInput(value: string) {
  return value.replace(/\D/g, "").slice(0, 4);
}

function getProfileErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  if (error instanceof Error) return error.message;
  return "Unable to update profile";
}

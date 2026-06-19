"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Save, Upload } from "lucide-react";
import { FavoriteTeamSelect } from "@/components/auth/FavoriteTeamSelect";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { LOCALES } from "@/i18n";
import { ApiClientError } from "@/lib/api-client";
import {
  getCurrentUser,
  updateCurrentUser,
  uploadProfileAvatar,
  type CurrentUserData,
  type CurrentUserResponse,
  type UploadProfileAvatarResponse,
} from "@/lib/auth-api";
import { getSoccerTeamGroups, type SoccerTeamGroup } from "@/lib/soccer-api";
import { useNotificationStore } from "@/stores/notification-store";
import { useUserStore } from "@/stores/user-store";
import { useShallow } from "zustand/react/shallow";

const languageOptions = LOCALES.map((l) => ({
  value: l.code,
  label: `${l.native} (${l.label})`,
}));

type ProfileForm = {
  displayName: string;
  bio: string;
  favoriteTeamId: string;
  locale: string;
  avatarUrl: string;
};

export default function EditProfilePage() {
  const profileT = useTranslations("profile");
  const authT = useTranslations("auth");
  const commonT = useTranslations("common");
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();
  const addToast = useNotificationStore((s) => s.addToast);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = useUserStore(
    useShallow((s) => ({
      username: s.username,
      displayName: s.displayName,
      favoriteTeam: s.favoriteTeam,
      language: s.language,
    }))
  );
  const [form, setForm] = useState<ProfileForm>({
    displayName: user.displayName,
    bio: "",
    favoriteTeamId: user.favoriteTeam,
    locale: user.language || locale,
    avatarUrl: "",
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [teamGroups, setTeamGroups] = useState<SoccerTeamGroup[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const [saved, setSaved] = useState(false);

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

    getCurrentUser({ locale })
      .then((response) => {
        if (!active) return;
        const profile = extractCurrentUser(response);
        if (!profile) return;

        const currentUser = useUserStore.getState();
        const apiAvatarUrl = pickString(
          profile.avatarUrl,
          profile.avatar_url,
          profile.imageUrl,
          profile.image_url,
          profile.avatar
        );
        const nextForm = {
          displayName: pickString(profile.displayName, profile.name) ?? "",
          bio: pickString(profile.bio) ?? "",
          favoriteTeamId: pickString(profile.favoriteTeamId) ?? "",
          locale: pickString(profile.locale, profile.language) ?? locale,
          avatarUrl: apiAvatarUrl ?? "",
        };

        setForm(nextForm);
        setAvatarPreviewUrl(apiAvatarUrl ?? currentUser.avatarUrl ?? null);
        useUserStore.setState({
          displayName: nextForm.displayName,
          favoriteTeam: nextForm.favoriteTeamId,
          language: nextForm.locale,
          avatarUrl: apiAvatarUrl ?? currentUser.avatarUrl,
        });
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
  }, [locale]);

  const update = (field: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
    setServerError("");
  };

  const markTouched = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const errors = useMemo(() => {
    const e: Record<string, string> = {};

    if (touched.displayName || form.displayName) {
      if (form.displayName.length > 50) e.displayName = profileT("displayNameMaxLength");
    }
    if (touched.bio || form.bio) {
      if (form.bio.length > 200) e.bio = profileT("bioMaxLength");
    }
    if (touched.favoriteTeamId || form.favoriteTeamId) {
      if (form.favoriteTeamId.length > 100) e.favoriteTeamId = authT("favoriteTeamMaxLength");
    }
    if (touched.locale || form.locale) {
      if (form.locale.length > 10) e.locale = authT("languageMaxLength");
    }
    if (touched.avatarUrl || form.avatarUrl) {
      if (form.avatarUrl.length > 500) e.avatarUrl = profileT("avatarUrlMaxLength");
      if (form.avatarUrl && !isValidAvatarUrl(form.avatarUrl)) {
        e.avatarUrl = profileT("avatarUrlInvalid");
      }
    }

    return e;
  }, [authT, form, profileT, touched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      displayName: true,
      bio: true,
      favoriteTeamId: true,
      locale: true,
      avatarUrl: true,
    });

    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    setServerError("");

    try {
      const response = await updateCurrentUser(
        {
          displayName: optionalTrimmed(form.displayName),
          bio: optionalTrimmed(form.bio),
          favoriteTeamId: optionalTrimmed(form.favoriteTeamId),
          locale: optionalTrimmed(form.locale),
        },
        { locale: form.locale }
      );
      const profile = extractCurrentUser(response);

      const currentAvatarUrl = useUserStore.getState().avatarUrl;
      useUserStore.setState({
        displayName:
          pickString(profile?.displayName, profile?.name) ??
          form.displayName.trim(),
        favoriteTeam:
          pickString(profile?.favoriteTeamId) ?? form.favoriteTeamId,
        language: pickString(profile?.locale, profile?.language) ?? form.locale,
        avatarUrl:
          pickString(profile?.avatarUrl, profile?.avatar_url, profile?.imageUrl, profile?.image_url, profile?.avatar) ??
          (currentAvatarUrl || form.avatarUrl),
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

  const handleAvatarUpload = async (file: File | undefined) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      const message = profileT("avatarFileInvalid");
      setServerError(message);
      addToast({ type: "error", title: commonT("error"), message });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      const message = profileT("avatarFileTooLarge");
      setServerError(message);
      addToast({ type: "error", title: commonT("error"), message });
      return;
    }

    setUploading(true);
    setServerError("");

    try {
      const localPreviewUrl = await readFileAsDataUrl(file);
      const previousAvatarUrl = form.avatarUrl || useUserStore.getState().avatarUrl || null;
      const response = await uploadProfileAvatar(file, {
        locale: form.locale,
        previousAvatarUrl,
      });
      const url = extractUploadedAvatarUrl(response);
      if (!url) {
        throw new Error(profileT("avatarUploadMissingUrl"));
      }

      update("avatarUrl", url);
      setAvatarPreviewUrl(localPreviewUrl);
      useUserStore.setState({ avatarUrl: url });
      addToast({
        type: "success",
        title: profileT("avatarUploaded"),
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
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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

          <Input
            label={authT("displayName")}
            value={form.displayName}
            onChange={(e) => update("displayName", e.target.value)}
            onBlur={() => markTouched("displayName")}
            error={errors.displayName}
            autoComplete="name"
            disabled={profileLoading}
            maxLength={50}
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">
              {authT("bio")}
            </label>
            <textarea
              value={form.bio}
              onChange={(e) => update("bio", e.target.value)}
              onBlur={() => markTouched("bio")}
              disabled={profileLoading}
              maxLength={200}
              rows={4}
              className="w-full resize-none rounded-lg border border-gray-700 bg-[#0a0a0f] px-3 py-2 text-sm text-white placeholder-gray-500 transition-colors duration-200 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            />
            {errors.bio && <p className="mt-1 text-xs text-red-400">{errors.bio}</p>}
          </div>

          <div className="rounded-xl border border-gray-800 bg-[#0d1118] p-4">
            <label className="mb-3 block text-sm font-medium text-gray-400">
              {profileT("profileImage")}
            </label>
            <p className="mb-3 text-xs leading-5 text-gray-500">
              {profileT("profileImageHint")}
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Avatar
                src={avatarPreviewUrl || form.avatarUrl || null}
                fallback={user.username}
                size="xl"
                className="ring-2 ring-cyan-500/30"
              />
              <div className="min-w-0 flex-1 space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => handleAvatarUpload(event.target.files?.[0])}
                  disabled={profileLoading || uploading}
                />
                <input type="hidden" name="avatarUrl" value={form.avatarUrl} />
                <Button
                  type="button"
                  variant="outline"
                  loading={uploading}
                  disabled={profileLoading || uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={16} />
                  {profileT("uploadProfileImage")}
                </Button>
                {form.avatarUrl && (
                  <p className="truncate text-xs text-gray-500">{form.avatarUrl}</p>
                )}
                {errors.avatarUrl && (
                  <p className="text-xs text-red-400">{errors.avatarUrl}</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-400">
                {authT("favoriteTeam")}
              </label>
              <FavoriteTeamSelect
                groups={teamGroups}
                value={form.favoriteTeamId}
                onChange={(v) => update("favoriteTeamId", v)}
                placeholder={teamsLoading ? commonT("loading") : authT("selectTeam")}
                searchPlaceholder={authT("searchTeams")}
                loading={teamsLoading || profileLoading}
              />
              {errors.favoriteTeamId && (
                <p className="mt-1 text-xs text-red-400">{errors.favoriteTeamId}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-400">
                {authT("language")}
              </label>
              <Select
                options={languageOptions}
                value={form.locale}
                onChange={(v) => update("locale", v)}
                className="w-full"
                disabled={profileLoading}
              />
              {errors.locale && <p className="mt-1 text-xs text-red-400">{errors.locale}</p>}
            </div>
          </div>

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

function extractCurrentUser(response: CurrentUserResponse): CurrentUserData | null {
  if ("user" in response && response.user) return extractCurrentUser(response.user);
  if ("member" in response && response.member) return extractCurrentUser(response.member);
  if ("profile" in response && response.profile) return extractCurrentUser(response.profile);
  if ("data" in response && response.data) return extractCurrentUser(response.data);
  return response as CurrentUserData;
}

function pickString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return String(value);
  }
  return undefined;
}

function optionalTrimmed(value: string) {
  const trimmed = value.trim();
  return trimmed || undefined;
}

function isValidAvatarUrl(value: string) {
  return isHttpUrl(value) || isRootRelativeUrl(value);
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isRootRelativeUrl(value: string) {
  return value.startsWith("/") && !value.startsWith("//") && !/[\s\\]/.test(value);
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Unable to read image preview"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Unable to read image preview"));
    reader.readAsDataURL(file);
  });
}

function extractUploadedAvatarUrl(response: UploadProfileAvatarResponse) {
  return pickString(
    response.avatarUrl,
    response.avatar_url,
    response.url,
    response.imageUrl,
    response.image_url,
    response.avatar,
    response.data?.avatarUrl,
    response.data?.avatar_url,
    response.data?.url,
    response.data?.imageUrl,
    response.data?.image_url,
    response.data?.avatar
  );
}

function getProfileErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  if (error instanceof Error) return error.message;
  return "Unable to update profile";
}

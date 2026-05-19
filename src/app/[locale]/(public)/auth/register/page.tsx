"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { FavoriteTeamSelect } from "@/components/auth/FavoriteTeamSelect";
import { LOCALES } from "@/i18n";
import { ApiClientError } from "@/lib/api-client";
import { registerApp } from "@/lib/auth-api";
import { getSoccerTeamGroups, type SoccerTeamGroup } from "@/lib/soccer-api";
import { useNotificationStore } from "@/stores/notification-store";

type StrengthLevel = "weak" | "fair" | "strong";

function getPasswordStrength(password: string): { score: number; level: StrengthLevel } {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  return {
    score,
    level: score <= 1 ? "weak" : score === 2 ? "fair" : "strong",
  };
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const languageOptions = LOCALES.map((l) => ({
  value: l.code,
  label: `${l.native} (${l.label})`,
}));

const countryOptions = [
  { value: "", label: "—" },
  { value: "TH", label: "TH - Thailand" },
  { value: "LA", label: "LA - Laos" },
  { value: "KH", label: "KH - Cambodia" },
  { value: "MM", label: "MM - Myanmar" },
  { value: "MY", label: "MY - Malaysia" },
  { value: "SG", label: "SG - Singapore" },
  { value: "VN", label: "VN - Vietnam" },
  { value: "OTHER", label: "OTHER" },
];

function sanitizeReferralCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 24);
}

export default function RegisterPage() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const { locale } = useParams<{ locale: string }>();
  const addToast = useNotificationStore((s) => s.addToast);
  const searchParams = useSearchParams();
  const initialReferralCode = sanitizeReferralCode(searchParams.get("ref") ?? "");
  const currentYear = new Date().getFullYear();
  const playerTypeOptions = [
    { value: "", label: t("selectPlayerType") },
    { value: "casual", label: t("playerTypeCasual") },
    { value: "analyst", label: t("playerTypeAnalyst") },
    { value: "competitive", label: t("playerTypeCompetitive") },
  ];

  const [form, setForm] = useState({
    username: "",
    email: "",
    displayName: "",
    phone: "",
    birthYear: "",
    country: "",
    favoriteTeam: "",
    playerType: "",
    language: locale as string,
    referralCode: initialReferralCode,
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    marketingConsent: false,
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [teamGroups, setTeamGroups] = useState<SoccerTeamGroup[]>([]);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

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

    return () => {
      active = false;
    };
  }, [locale]);

  const markTouched = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const update = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setServerError("");
  };

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (touched.username || form.username) {
      if (!form.username) e.username = t("usernameRequired");
      else if (form.username.length < 3) e.username = t("usernameMinLength");
      else if (form.username.length > 20) e.username = t("usernameMaxLength");
    }
    if (touched.email || form.email) {
      if (!form.email) e.email = t("emailRequired");
      else if (!isValidEmail(form.email)) e.email = t("emailInvalid");
      else if (form.email.length > 100) e.email = t("emailMaxLength");
    }
    if (touched.displayName || form.displayName) {
      if (form.displayName.length > 100) e.displayName = t("displayNameMaxLength");
    }
    if (touched.phone || form.phone) {
      if (form.phone.length > 20) {
        e.phone = t("phoneMaxLength");
      }
    }
    if (touched.birthYear || form.birthYear) {
      const year = Number(form.birthYear);
      if (!Number.isInteger(year) || year < 1900 || year > currentYear) {
        e.birthYear = t("birthYearInvalid");
      }
    }
    if (touched.favoriteTeam || form.favoriteTeam) {
      if (form.favoriteTeam.length > 100) e.favoriteTeam = t("favoriteTeamMaxLength");
    }
    if (touched.playerType || form.playerType) {
      if (form.playerType.length > 50) e.playerType = t("playerTypeMaxLength");
    }
    if (touched.language || form.language) {
      if (form.language.length > 10) e.language = t("languageMaxLength");
    }
    if (touched.referralCode || form.referralCode) {
      if (form.referralCode.length > 24) e.referralCode = t("referralCodeMaxLength");
    }
    if (touched.password || form.password) {
      if (!form.password) e.password = t("passwordRequired");
      else if (form.password.length < 8) e.password = t("passwordMinLength");
      else if (form.password.length > 10) e.password = t("passwordMaxLength");
    }
    if (touched.confirmPassword || form.confirmPassword) {
      if (form.confirmPassword && form.password !== form.confirmPassword) {
        e.confirmPassword = t("passwordMismatch");
      }
    }
    if (touched.acceptTerms) {
      if (!form.acceptTerms) e.acceptTerms = t("termsRequired");
    }
    return e;
  }, [form, currentYear, touched, t]);

  const hasErrors = Object.keys(errors).length > 0;
  const allRequiredFilled =
    form.username && form.email && form.password && form.acceptTerms;

  const passwordStrength = useMemo(
    () => getPasswordStrength(form.password),
    [form.password]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      username: true,
      email: true,
      password: true,
      acceptTerms: true,
    });

    if (hasErrors || !allRequiredFilled) return;

    setLoading(true);
    setServerError("");

    try {
      await registerApp(
        {
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          confirmPassword: form.confirmPassword || undefined,
          displayName: form.displayName.trim() || undefined,
          phone: form.phone.trim() || undefined,
          birthYear: form.birthYear ? Number(form.birthYear) : undefined,
          country: form.country || undefined,
          favoriteTeam: form.favoriteTeam || undefined,
          playerType: form.playerType || undefined,
          language: form.language,
          referralCode: form.referralCode || undefined,
          acceptTerms: form.acceptTerms,
          acceptTeam: Boolean(form.favoriteTeam),
          marketingConsent: form.marketingConsent,
        },
        { locale: form.language }
      );
      addToast({
        type: "success",
        title: t("registerSuccess"),
        message: form.username.trim(),
      });
      setSuccess(true);
    } catch (error) {
      const message = getRegisterErrorMessage(error);
      setServerError(message);
      addToast({
        type: "error",
        title: t("registerFailed"),
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="animate-slide-up text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <svg
            className="h-8 w-8 text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold font-display text-white">
          {t("registerSuccess")}
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          {t("taglineSub")}
        </p>
        <Link href={`/${locale}/auth/login`}>
          <Button className="mt-6" size="lg">
            {t("login")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-slide-up grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section>
        <div className="mb-6 text-center lg:text-left">
          <h1 className="font-display text-2xl font-bold text-white">
            {t("register")}
          </h1>
          <p className="mt-1 text-sm text-gray-400">{t("tagline")}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-2xl border border-gray-800 bg-[#12121a] p-6 space-y-4"
        >
        {/* Username */}
        <Input
          label={t("username")}
          placeholder="CyberFan99"
          value={form.username}
          onChange={(e) => update("username", e.target.value)}
          onBlur={() => markTouched("username")}
          error={errors.username}
          autoComplete="username"
          maxLength={20}
        />

        {/* Email */}
        <Input
          label={t("email")}
          type="email"
          placeholder="cyberfan@example.com"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          onBlur={() => markTouched("email")}
          error={errors.email}
          autoComplete="email"
          maxLength={100}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label={`${t("displayName")} (${t("optional")})`}
            placeholder="CyberFan"
            value={form.displayName}
            onChange={(e) => update("displayName", e.target.value)}
            onBlur={() => markTouched("displayName")}
            error={errors.displayName}
            autoComplete="name"
            maxLength={100}
          />
          <Input
            label={`${t("phone")} (${t("optional")})`}
            type="tel"
            placeholder="+66 89 123 4567"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            onBlur={() => markTouched("phone")}
            error={errors.phone}
            autoComplete="tel"
            maxLength={20}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label={t("birthYear")}
            type="number"
            placeholder="1998"
            value={form.birthYear}
            onChange={(e) => update("birthYear", e.target.value)}
            onBlur={() => markTouched("birthYear")}
            error={errors.birthYear}
            min={1900}
            max={currentYear}
            inputMode="numeric"
          />
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              {t("country")}
            </label>
            <Select
              options={countryOptions}
              value={form.country}
              onChange={(v) => update("country", v)}
              className="w-full"
            />
          </div>
        </div>

        {/* Favorite team + Language row */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              {t("favoriteTeam")}
            </label>
            <FavoriteTeamSelect
              groups={teamGroups}
              value={form.favoriteTeam}
              onChange={(v) => update("favoriteTeam", v)}
              placeholder={teamsLoading ? tCommon("loading") : t("selectTeam")}
              searchPlaceholder={t("searchTeams")}
              loading={teamsLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              {t("playerType")}
            </label>
            <Select
              options={playerTypeOptions}
              value={form.playerType}
              onChange={(v) => update("playerType", v)}
              className="h-[50px] w-full"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            {t("language")}
          </label>
          <Select
            options={languageOptions}
            value={form.language}
            onChange={(v) => update("language", v)}
            className="w-full"
          />
        </div>

        <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-3">
          <Input
            label={`${t("referralCode")} (${t("optional")})`}
            placeholder="CYBERFAN99"
            value={form.referralCode}
            onChange={(e) =>
              update("referralCode", sanitizeReferralCode(e.target.value))
            }
            maxLength={24}
            autoComplete="off"
          />
          <p className="mt-2 text-xs leading-5 text-gray-500">
            {t("referralCodeHint")}
          </p>
        </div>

        <div className="rounded-xl border border-cyan-500/15 bg-cyan-500/5 p-3 text-xs leading-5 text-gray-400">
          {t("dataUseNote")}
        </div>

        <div>
          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="checkbox"
              checked={form.marketingConsent}
              onChange={(e) => update("marketingConsent", e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-700 bg-[#0a0a0f] text-cyan-500 focus:ring-cyan-500/20"
            />
            <span className="text-sm text-gray-400">
              {t("marketingConsent")}
            </span>
          </label>
        </div>

        {/* Password */}
        <div>
          <Input
            label={t("password")}
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            onBlur={() => markTouched("password")}
            error={errors.password}
            autoComplete="new-password"
            maxLength={10}
          />
          {form.password && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex gap-1 flex-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full transition-colors duration-200"
                    style={{
                      background:
                        i <= passwordStrength.score
                          ? passwordStrength.level === "weak"
                            ? "#ef4444"
                            : passwordStrength.level === "fair"
                              ? "#f59e0b"
                              : "#22c55e"
                          : "#374151",
                    }}
                  />
                ))}
              </div>
              <span
                className="text-xs font-medium"
                style={{
                  color:
                    passwordStrength.level === "weak"
                      ? "#ef4444"
                      : passwordStrength.level === "fair"
                        ? "#f59e0b"
                        : "#22c55e",
                }}
              >
                {t(`password${passwordStrength.level.charAt(0).toUpperCase() + passwordStrength.level.slice(1)}` as never)}
              </span>
            </div>
          )}
          {form.password && form.password.length < 8 && (
            <p className="mt-1 text-xs text-gray-500">{t("passwordStrengthHint")}</p>
          )}
        </div>

        {/* Confirm password */}
        <Input
          label={t("confirmPassword")}
          type="password"
          placeholder="••••••••"
          value={form.confirmPassword}
          onChange={(e) => update("confirmPassword", e.target.value)}
          onBlur={() => markTouched("confirmPassword")}
          error={errors.confirmPassword}
          autoComplete="new-password"
          maxLength={10}
        />

        {/* Terms checkbox */}
        <div>
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.acceptTerms}
              onChange={(e) => {
                update("acceptTerms", e.target.checked);
                if (e.target.checked) markTouched("acceptTerms");
              }}
              className="mt-0.5 h-4 w-4 rounded border-gray-700 bg-[#0a0a0f] text-cyan-500 focus:ring-cyan-500/20"
            />
            <span className="text-sm text-gray-400">
              {t("acceptTerms")}
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="mt-1 text-xs text-red-400">{errors.acceptTerms}</p>
          )}
        </div>

        {/* Server error */}
        {serverError && (
          <p className="text-sm text-red-400 text-center">{serverError}</p>
        )}

        {/* Submit */}
        <Button
          type="submit"
          loading={loading}
          className="w-full"
          size="lg"
        >
          {loading ? t("creating") : t("register")}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-4">
        {t("hasAccount")}{" "}
        <Link
          href={`/${locale}/auth/login`}
          className="text-cyan-400 hover:underline"
        >
          {t("login")}
        </Link>
      </p>
      </section>

      <aside className="rounded-2xl border border-gray-800 bg-[#0d1118] p-5 lg:mt-14">
        <h2 className="font-display text-lg font-bold text-white">
          {t("registerInfoTitle")}
        </h2>
        <div className="mt-4 space-y-4 text-sm">
          <InfoBlock
            title={t("requiredDataTitle")}
            items={[
              t("requiredDataUsername"),
              t("requiredDataEmail"),
              t("requiredDataPassword"),
              t("requiredDataTerms"),
            ]}
          />
          <InfoBlock
            title={t("recommendedDataTitle")}
            items={[
              t("recommendedDataProfile"),
              t("recommendedDataBirthYear"),
              t("recommendedDataConsent"),
            ]}
          />
          <InfoBlock
            title={t("avoidDataTitle")}
            items={[
              t("avoidDataGovernmentId"),
              t("avoidDataFinancial"),
              t("avoidDataSensitive"),
            ]}
          />
        </div>
      </aside>
    </div>
  );
}

function getRegisterErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    const payload = error.payload;

    if (
      payload &&
      typeof payload === "object" &&
      "errors" in payload &&
      payload.errors &&
      typeof payload.errors === "object"
    ) {
      const firstFieldErrors = Object.values(payload.errors as Record<string, string[]>)[0];
      if (firstFieldErrors?.[0]) return firstFieldErrors[0];
    }

    return error.message;
  }

  if (error instanceof Error) return error.message;
  return "Unable to create account";
}

function InfoBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-cyan-300">
        {title}
      </h3>
      <ul className="space-y-2 text-gray-400">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

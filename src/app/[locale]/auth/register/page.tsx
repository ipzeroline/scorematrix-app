"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { teams } from "@/data/teams";
import { leagues } from "@/data/leagues";
import { LOCALES } from "@/i18n";

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

const teamOptions = [
  { value: "", label: "—" },
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

export default function RegisterPage() {
  const t = useTranslations("auth");
  const { locale } = useParams<{ locale: string }>();

  const [form, setForm] = useState({
    username: "",
    email: "",
    displayName: "",
    favoriteTeam: "",
    language: locale as string,
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

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
    }
    if (touched.password || form.password) {
      if (!form.password) e.password = t("passwordRequired");
      else if (form.password.length < 8) e.password = t("passwordMinLength");
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
  }, [form, touched, t]);

  const hasErrors = Object.keys(errors).length > 0;
  const allRequiredFilled =
    form.username && form.email && form.password && form.confirmPassword && form.acceptTerms;

  const passwordStrength = useMemo(
    () => getPasswordStrength(form.password),
    [form.password]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
      acceptTerms: true,
    });

    if (hasErrors || !allRequiredFilled) return;

    setLoading(true);
    setServerError("");

    // TODO: replace with real API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
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
    <div className="animate-slide-up">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold font-display text-white">
          {t("register")}
        </h1>
        <p className="text-sm text-gray-400 mt-1">{t("tagline")}</p>
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
        />

        {/* Display name */}
        <Input
          label={`${t("displayName")} (${t("optional")})`}
          placeholder="CyberFan"
          value={form.displayName}
          onChange={(e) => update("displayName", e.target.value)}
          autoComplete="name"
        />

        {/* Favorite team + Language row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              {t("favoriteTeam")}
            </label>
            <Select
              options={teamOptions.map((opt) => ({
                value: opt.value,
                label: opt.label,
              }))}
              value={form.favoriteTeam}
              onChange={(v) => update("favoriteTeam", v)}
              placeholder={t("selectTeam")}
              className="w-full"
            />
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
    </div>
  );
}

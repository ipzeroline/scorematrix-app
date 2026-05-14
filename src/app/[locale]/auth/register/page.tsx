"use client";
import { useEffect, useState, useMemo } from "react";
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

function getInitialReferralCode() {
  const ref = new URLSearchParams(window.location.search).get("ref");
  return ref ? sanitizeReferralCode(ref) : "";
}

function sanitizeReferralCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 24);
}

export default function RegisterPage() {
  const t = useTranslations("auth");
  const { locale } = useParams<{ locale: string }>();
  const currentYear = new Date().getFullYear();
  const latestAllowedBirthYear = currentYear - 13;
  const countryOptions = [
    { value: "", label: t("selectCountry") },
    { value: "TH", label: t("countryThailand") },
    { value: "LA", label: t("countryLaos") },
    { value: "KH", label: t("countryCambodia") },
    { value: "MM", label: t("countryMyanmar") },
    { value: "MY", label: t("countryMalaysia") },
    { value: "SG", label: t("countrySingapore") },
    { value: "VN", label: t("countryVietnam") },
    { value: "OTHER", label: t("countryOther") },
  ];
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
    referralCode: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    marketingConsent: false,
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const referralCode = getInitialReferralCode();
      if (referralCode) {
        setForm((prev) => ({ ...prev, referralCode }));
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

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
    if (touched.phone || form.phone) {
      if (form.phone && !/^[0-9+\-\s()]{8,20}$/.test(form.phone)) {
        e.phone = t("phoneInvalid");
      }
    }
    if (touched.birthYear || form.birthYear) {
      const year = Number(form.birthYear);
      if (!Number.isInteger(year) || year < 1900 || year > latestAllowedBirthYear) {
        e.birthYear = t("birthYearInvalid");
      }
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
  }, [form, latestAllowedBirthYear, touched, t]);

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
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label={`${t("displayName")} (${t("optional")})`}
            placeholder="CyberFan"
            value={form.displayName}
            onChange={(e) => update("displayName", e.target.value)}
            autoComplete="name"
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
            max={latestAllowedBirthYear}
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
              {t("playerType")}
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

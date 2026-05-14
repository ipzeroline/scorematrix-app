"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginPage() {
  const t = useTranslations("auth");
  const { locale } = useParams<{ locale: string }>();

  const [form, setForm] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const markTouched = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setServerError("");
  };

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (touched.email || form.email) {
      if (!form.email) e.email = t("emailRequired");
      else if (!isValidEmail(form.email)) e.email = t("emailInvalid");
    }
    if (touched.password || form.password) {
      if (!form.password) e.password = t("passwordRequired");
    }
    return e;
  }, [form, touched, t]);

  const hasErrors = Object.keys(errors).length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    if (hasErrors || !form.email || !form.password) return;

    setLoading(true);
    setServerError("");

    // TODO: replace with real API call
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="animate-slide-up">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold font-display text-white">
          {t("login")}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Welcome back to ScoreMatrix
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-2xl border border-gray-800 bg-[#12121a] p-6 space-y-4"
      >
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

        <div>
          <Input
            label={t("password")}
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            onBlur={() => markTouched("password")}
            error={errors.password}
            autoComplete="current-password"
          />
        </div>

        {serverError && (
          <p className="text-sm text-red-400 text-center">{serverError}</p>
        )}

        <Button
          type="submit"
          loading={loading}
          className="w-full"
          size="lg"
        >
          {t("login")}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-4">
        {t("noAccount")}{" "}
        <Link
          href={`/${locale}/auth/register`}
          className="text-cyan-400 hover:underline"
        >
          {t("register")}
        </Link>
      </p>
    </div>
  );
}

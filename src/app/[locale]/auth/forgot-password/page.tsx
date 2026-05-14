"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const { locale } = useParams<{ locale: string }>();
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const error = useMemo(() => {
    if (!touched && !email) return "";
    if (!email) return t("emailRequired");
    if (!isValidEmail(email)) return t("emailInvalid");
    return "";
  }, [email, touched, t]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (error || !email) return;

    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1200);
  };

  return (
    <div className="animate-slide-up mx-auto max-w-md">
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-bold text-white">
          {t("forgotPassword")}
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          {t("forgotPasswordSubtitle")}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4 rounded-2xl border border-gray-800 bg-[#12121a] p-6"
      >
        <Input
          label={t("email")}
          type="email"
          placeholder="cyberfan@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onBlur={() => setTouched(true)}
          error={error}
          autoComplete="email"
        />

        {sent && (
          <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-300">
            {t("resetLinkSent")}
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full" size="lg">
          {t("sendResetLink")}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        {t("rememberedPassword")}{" "}
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

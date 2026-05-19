"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiClientError } from "@/lib/api-client";
import { forgotPassword } from "@/lib/auth-api";
import { useNotificationStore } from "@/stores/notification-store";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const { locale } = useParams<{ locale: string }>();
  const addToast = useNotificationStore((state) => state.addToast);
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState("");

  const error = useMemo(() => {
    if (!touched && !email) return "";
    if (!email) return t("emailRequired");
    if (!isValidEmail(email)) return t("emailInvalid");
    if (email.length > 100) return t("emailMaxLength");
    return "";
  }, [email, touched, t]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    setServerError("");
    if (error || !email) return;

    setLoading(true);
    try {
      await forgotPassword({ email: email.trim() }, { locale });
      setSent(true);
      addToast({
        type: "success",
        title: t("resetLinkSent"),
      });
    } catch (requestError) {
      const message = getForgotPasswordErrorMessage(
        requestError,
        t("forgotPasswordFailed")
      );
      setServerError(message);
      addToast({
        type: "error",
        title: t("forgotPasswordFailed"),
        message,
      });
    } finally {
      setLoading(false);
    }
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
          onChange={(event) => {
            setEmail(event.target.value);
            setServerError("");
            setSent(false);
          }}
          onBlur={() => setTouched(true)}
          error={error}
          autoComplete="email"
          maxLength={100}
        />

        {serverError && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
            {serverError}
          </div>
        )}

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

function getForgotPasswordErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiClientError) {
    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}

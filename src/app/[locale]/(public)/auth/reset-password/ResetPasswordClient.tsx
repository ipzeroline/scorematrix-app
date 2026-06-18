"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  CheckCircle2,
  KeyRound,
  Lock,
  ShieldCheck,
  Sparkles,
  TimerReset,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiClientError } from "@/lib/api-client";
import { resetPassword } from "@/lib/auth-api";
import { useNotificationStore } from "@/stores/notification-store";

type ResetPasswordClientProps = {
  token: string;
  email: string;
};

export default function ResetPasswordClient({ token, email }: ResetPasswordClientProps) {
  const t = useTranslations("auth");
  const { locale } = useParams<{ locale: string }>();
  const addToast = useNotificationStore((state) => state.addToast);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState({ password: false, confirmPassword: false });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const errors = useMemo(() => {
    const errs = { password: "", confirmPassword: "" };

    if (touched.password || password) {
      if (!password) errs.password = t("passwordRequired");
      else if (password.length < 8) errs.password = t("passwordMinLength");
      else if (password.length > 100) errs.password = t("passwordMaxLength");
      else if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
        errs.password = t("passwordStrengthHint");
      }
    }

    if (touched.confirmPassword || confirmPassword) {
      if (confirmPassword && password !== confirmPassword) {
        errs.confirmPassword = t("passwordMismatch");
      }
    }

    return errs;
  }, [password, confirmPassword, touched, t]);

  const hasErrors = !!errors.password || !!errors.confirmPassword;
  const isLinkInvalid = !token || !email;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched({ password: true, confirmPassword: true });
    setServerError("");

    if (hasErrors || !password || !confirmPassword || isLinkInvalid) return;

    setLoading(true);
    try {
      await resetPassword(
        {
          email: email.trim(),
          token: token.trim(),
          password: password,
          password_confirm: confirmPassword,
        },
        { locale }
      );
      setSuccess(true);
      addToast({
        type: "success",
        title: t("resetPasswordSuccess"),
      });
    } catch (requestError) {
      let message = t("resetPasswordFailed");
      if (requestError instanceof ApiClientError) {
        message = requestError.message || message;
      } else if (requestError instanceof Error) {
        message = requestError.message || message;
      }
      setServerError(message);
      addToast({
        type: "error",
        title: t("resetPasswordFailed"),
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-slide-up mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="min-w-0">
        <div className="relative mb-5 overflow-hidden rounded-3xl border border-cyan-300/15 bg-[#0b111d] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-6">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-300 via-lime-300 to-purple-300" />
          <div className="absolute -right-20 -top-24 h-52 w-52 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative flex items-start gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
              <KeyRound size={28} />
            </span>
            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-cyan-100">
                <Sparkles size={14} />
                ScoreMatrix
              </div>
              <h1 className="text-3xl font-black leading-tight text-white sm:text-4xl">
                {t("resetPasswordTitle")}
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-gray-400">
                {t("resetPasswordSubtitle")}
              </p>
            </div>
          </div>
        </div>

        {isLinkInvalid ? (
          <div className="space-y-4 rounded-3xl border border-red-500/15 bg-[#0d111a] p-5 text-center shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              <AlertTriangle size={30} />
            </div>
            <h2 className="text-xl font-black text-white">{t("resetPasswordFailed")}</h2>
            <p className="text-sm font-semibold text-gray-400">
              {t("resetPasswordFailed")}
            </p>
            <Button
              className="w-full mt-2"
              onClick={() => {
                window.location.href = `/${locale}/auth/forgot-password`;
              }}
              neon
            >
              {t("forgotPassword")}
            </Button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-4 rounded-3xl border border-cyan-300/15 bg-[#0d111a] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:p-5"
          >
            {success ? (
              <div className="space-y-4 py-4 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-green-400">
                  <CheckCircle2 size={30} />
                </div>
                <h2 className="text-xl font-black text-white">{t("resetPasswordSuccess")}</h2>
                <p className="text-sm font-semibold text-gray-400">
                  {t("resetPasswordSuccess")}
                </p>
                <Button
                  className="w-full shadow-[0_0_24px_rgba(34,211,238,0.18)]"
                  size="lg"
                  onClick={() => {
                    window.location.href = `/${locale}/auth/login`;
                  }}
                  neon
                >
                  {t("login")}
                </Button>
              </div>
            ) : (
              <>
                <section className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-4">
                  <div>
                    <div className="mb-2 flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-cyan-300/15 bg-cyan-300/[0.035] text-cyan-200">
                        <Lock size={18} />
                      </span>
                      <h2 className="text-base font-black text-white">{t("password")}</h2>
                    </div>
                    <Input
                      label={t("password")}
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setServerError("");
                      }}
                      onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                      error={errors.password}
                      autoComplete="new-password"
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-cyan-300/15 bg-cyan-300/[0.035] text-cyan-200">
                        <Lock size={18} />
                      </span>
                      <h2 className="text-base font-black text-white">{t("confirmPassword")}</h2>
                    </div>
                    <Input
                      label={t("confirmPassword")}
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(event) => {
                        setConfirmPassword(event.target.value);
                        setServerError("");
                      }}
                      onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
                      error={errors.confirmPassword}
                      autoComplete="new-password"
                      maxLength={100}
                    />
                  </div>
                </section>

                {serverError && (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold leading-6 text-red-300">
                    {serverError}
                  </div>
                )}

                <div className="rounded-2xl border border-green-500/15 bg-green-500/5 p-4 text-sm font-semibold leading-6 text-gray-300">
                  {t("loginSecurityNote")}
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full shadow-[0_0_24px_rgba(34,211,238,0.18)]"
                  size="lg"
                  neon
                >
                  {t("resetPasswordButton")}
                </Button>
              </>
            )}
          </form>
        )}

        <p className="mt-4 text-center text-sm font-semibold text-gray-500">
          {t("rememberedPassword")}{" "}
          <Link
            href={`/${locale}/auth/login`}
            className="font-black text-cyan-300 hover:underline"
          >
            {t("login")}
          </Link>
        </p>
      </section>

      <aside className="h-fit rounded-3xl border border-purple-300/15 bg-[#0b111d] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)] lg:sticky lg:top-20">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-purple-300/20 bg-purple-300/10 text-purple-200">
            <ShieldCheck size={22} />
          </span>
          <div className="min-w-0">
            <h2 className="text-xl font-black leading-tight text-white">
              {t("loginSecurityTitle")}
            </h2>
            <p className="mt-1 text-xs font-semibold text-gray-500">
              {t("loginSecurityNote")}
            </p>
          </div>
        </div>
        <div className="space-y-4 text-sm">
          <InfoBlock
            title={t("loginFormRecovery")}
            items={[
              t("resetPasswordSubtitle"),
              t("passwordStrengthHint"),
              t("rememberedPassword"),
            ]}
          />
          <InfoBlock
            title={t("loginSecurityTitle")}
            items={[
              t("loginSecurityRateLimit"),
              t("loginSecurityDevice"),
              t("loginSecurityError"),
            ]}
          />
        </div>
      </aside>
    </div>
  );
}

function InfoBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <h3 className="mb-3 text-xs font-black uppercase tracking-wide text-cyan-200">
        {title}
      </h3>
      <ul className="space-y-2.5 text-gray-400">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5">
            <span className="mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full border border-green-300/20 bg-green-300/10 text-green-300">
              <TimerReset size={11} />
            </span>
            <span className="font-semibold leading-5">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

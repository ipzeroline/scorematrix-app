"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRoundCheck,
  Zap,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ApiClientError } from "@/lib/api-client";
import { login } from "@/lib/auth-api";
import { useNotificationStore } from "@/stores/notification-store";
import { useUserStore } from "@/stores/user-store";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function LoginClient() {
  const t = useTranslations("auth");
  const { locale } = useParams<{ locale: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const setLoggedInUser = useUserStore((s) => s.login);
  const addToast = useNotificationStore((s) => s.addToast);

  const [form, setForm] = useState({
    identifier: "",
    password: "",
    rememberMe: false,
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const markTouched = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const update = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setServerError("");
  };

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (touched.identifier || form.identifier) {
      if (!form.identifier) e.identifier = t("identifierRequired");
      else if (form.identifier.includes("@") && !isValidEmail(form.identifier)) {
        e.identifier = t("emailInvalid");
      }
    }
    if (touched.password || form.password) {
      if (!form.password) e.password = t("passwordRequired");
    }
    return e;
  }, [form, touched, t]);

  const hasErrors = Object.keys(errors).length > 0;
  const nextPath = normalizeNextPath(searchParams.get("next"), locale);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ identifier: true, password: true });

    if (hasErrors || !form.identifier || !form.password) return;

    setLoading(true);
    setServerError("");

    try {
      const response = await login(
        {
          identifier: form.identifier.trim(),
          password: form.password,
          rememberMe: form.rememberMe,
        },
        {
          locale,
          remember: form.rememberMe,
        }
      );
      const loginData = response.data;
      if (!loginData) {
        throw new Error("Login response did not include member data");
      }
      const loggedInUser = normalizeLoggedInUser(loginData);

      setLoggedInUser({
        id: loggedInUser.id,
        username: loggedInUser.username,
        displayName: loggedInUser.displayName,
      });
      addToast({
        type: "success",
        title: t("loginSuccess"),
        message: loggedInUser.displayName,
      });
      router.push(nextPath);
      router.refresh();
    } catch (error) {
      const message = getLoginErrorMessage(error);
      setServerError(message);
      addToast({
        type: "error",
        title: t("loginFailed"),
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-slide-up grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="min-w-0">
        <div className="relative mb-3 overflow-hidden rounded-3xl border border-cyan-300/15 bg-[#0b111d] p-4 shadow-[0_18px_54px_rgba(0,0,0,0.24)] sm:mb-5 sm:p-6">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-300 via-lime-300 to-purple-300" />
          <div className="absolute -right-20 -top-24 h-52 w-52 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-cyan-100 sm:text-xs">
                <Sparkles size={14} />
                ScoreMatrix
              </div>
              <h1 className="text-2xl font-black leading-tight text-white sm:text-4xl">
                {t("login")}
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-gray-400 sm:leading-relaxed">
                {t("loginSubtitle")}
              </p>
            </div>
            <div className="hidden w-full grid-cols-3 gap-2 md:grid md:w-[390px]">
              <HeroStat icon={Trophy} label={t("afterLoginRedirect")} />
              <HeroStat icon={Zap} label={t("loginFormRemember")} />
              <HeroStat icon={ShieldCheck} label={t("loginSecurityTitle")} />
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4 rounded-3xl border border-cyan-300/15 bg-[#0d111a] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:p-5"
        >
          <FormSection icon={UserRoundCheck} title={t("loginFormTitle")} tone="cyan">
          <Input
            label={t("identifier")}
            type="text"
            placeholder={t("identifierPlaceholder")}
            value={form.identifier}
            onChange={(e) => update("identifier", e.target.value)}
            onBlur={() => markTouched("identifier")}
            error={errors.identifier}
            autoComplete="username"
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
          </FormSection>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-gray-300">
              <input
                type="checkbox"
                checked={form.rememberMe}
                onChange={(e) => update("rememberMe", e.target.checked)}
                className="h-4 w-4 rounded border-gray-700 bg-[#0a0a0f] text-cyan-500 focus:ring-cyan-500/20"
              />
              {t("rememberMe")}
            </label>
            <Link
              href={`/${locale}/auth/forgot-password`}
              className="text-sm font-black text-cyan-300 hover:underline"
            >
              {t("forgotPassword")}
            </Link>
          </div>

          <div className="rounded-2xl border border-green-500/15 bg-green-500/5 p-4 text-sm font-semibold leading-6 text-gray-300">
            {t("loginSecurityNote")}
          </div>

          {serverError && (
            <p className="text-sm text-red-400 text-center">{serverError}</p>
          )}

          <Button
            type="submit"
            loading={loading}
            className="w-full shadow-[0_0_24px_rgba(34,211,238,0.18)]"
            size="lg"
            neon
          >
            {t("login")}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm font-semibold text-gray-500">
          {t("noAccount")}{" "}
          <Link
            href={`/${locale}/auth/register`}
            className="font-black text-cyan-300 hover:underline"
          >
            {t("register")}
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
              {t("loginInfoTitle")}
            </h2>
            <p className="mt-1 text-xs font-semibold text-gray-500">
              {t("loginSecurityNote")}
            </p>
          </div>
        </div>
        <div className="space-y-4 text-sm">
          <InfoBlock
            title={t("loginFormTitle")}
            items={[
              t("loginFormIdentifier"),
              t("loginFormPassword"),
              t("loginFormRemember"),
              t("loginFormRecovery"),
            ]}
          />
          <InfoBlock
            title={t("loginSecurityTitle")}
            items={[
              t("loginSecurityRateLimit"),
              t("loginSecurityDevice"),
              t("loginSecurity2fa"),
              t("loginSecurityError"),
            ]}
          />
          <InfoBlock
            title={t("afterLoginTitle")}
            items={[
              t("afterLoginRedirect"),
              t("afterLoginSession"),
              t("afterLoginAudit"),
            ]}
          />
        </div>
      </aside>
    </div>
  );
}

function normalizeLoggedInUser(loginData: NonNullable<Awaited<ReturnType<typeof login>>["data"]>) {
  if (loginData.user) {
    return {
      id: String(loginData.user.id),
      username: loginData.user.username,
      displayName: loginData.user.displayName || loginData.user.username,
    };
  }

  if (loginData.member) {
    return {
      id: String(loginData.member.code),
      username: loginData.member.user_name,
      displayName: loginData.member.name || loginData.member.user_name,
    };
  }

  throw new Error("Login response did not include user data");
}

function getLoginErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  if (error instanceof Error) return error.message;
  return "Unable to log in";
}

function normalizeNextPath(nextPath: string | null, locale: string) {
  if (!nextPath) return `/${locale}`;
  if (nextPath === `/${locale}` || nextPath.startsWith(`/${locale}/`)) {
    return nextPath;
  }
  return `/${locale}`;
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
              <CheckCircle2 size={11} />
            </span>
            <span className="font-semibold leading-5">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function HeroStat({
  icon: Icon,
  label,
}: {
  icon: typeof Trophy;
  label: string;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center justify-start rounded-2xl border border-white/10 bg-black/20 p-3 text-center">
      <Icon className="mx-auto mb-2 text-cyan-200" size={18} />
      <p className="text-[11px] font-black leading-5 text-gray-300">
        {label}
      </p>
    </div>
  );
}

function FormSection({
  icon: Icon,
  title,
  tone,
  children,
}: {
  icon: typeof UserRoundCheck;
  title: string;
  tone: "cyan" | "green";
  children: React.ReactNode;
}) {
  const toneClass = {
    cyan: "border-cyan-300/15 bg-cyan-300/[0.035] text-cyan-200",
    green: "border-lime-300/15 bg-lime-300/[0.035] text-lime-200",
  }[tone];

  return (
    <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="mb-4 flex items-center gap-3">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${toneClass}`}>
          <Icon size={18} />
        </span>
        <h2 className="text-base font-black text-white">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

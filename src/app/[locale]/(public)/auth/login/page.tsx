"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ApiClientError } from "@/lib/api-client";
import { login } from "@/lib/auth-api";
import { useNotificationStore } from "@/stores/notification-store";
import { useUserStore } from "@/stores/user-store";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginPage() {
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
    <div className="animate-slide-up grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section>
        <div className="mb-6 text-center lg:text-left">
          <h1 className="font-display text-2xl font-bold text-white">
            {t("login")}
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            {t("loginSubtitle")}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-2xl border border-gray-800 bg-[#12121a] p-6 space-y-4"
        >
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

          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-400">
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
              className="text-sm text-cyan-400 hover:underline"
            >
              {t("forgotPassword")}
            </Link>
          </div>

          <div className="rounded-xl border border-green-500/15 bg-green-500/5 p-3 text-xs leading-5 text-gray-400">
            {t("loginSecurityNote")}
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
      </section>

      <aside className="rounded-2xl border border-gray-800 bg-[#0d1118] p-5 lg:mt-14">
        <h2 className="font-display text-lg font-bold text-white">
          {t("loginInfoTitle")}
        </h2>
        <div className="mt-4 space-y-4 text-sm">
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

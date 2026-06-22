import { LOCALE_CODES, type LocaleCode } from "@/i18n";

export const AUTH_TOKEN_COOKIE_NAME = "scorematrix-auth-token";
export const REFRESH_TOKEN_COOKIE_NAME = "scorematrix-refresh-token";
export const REFRESH_SESSION_COOKIE_NAME = "scorematrix-refresh-session";

const PROTECTED_ROUTE_PREFIXES = [
  "/leaderboard",
  "/missions",
  "/events",
  "/rewards",
  "/credits",
  "/stats",
  "/affiliate",
  "/leagues",
  "/profile",
  "/wallet",
  "/settings",
  "/notifications",
];

export function isProtectedPath(pathname: string) {
  const pathWithoutLocale = stripLocalePrefix(pathname);

  // The /predict browse index stays public, but submitting a prediction for a
  // specific match (/predict/{matchId}/...) requires login.
  if (pathWithoutLocale.startsWith("/predict/")) {
    return true;
  }

  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) =>
      pathWithoutLocale === prefix ||
      pathWithoutLocale.startsWith(`${prefix}/`)
  );
}

export function getLocaleFromPathname(pathname: string): LocaleCode | null {
  const match = pathname.match(/^\/([^/]+)/);
  if (!match) return null;

  const locale = match[1];
  return LOCALE_CODES.includes(locale as LocaleCode)
    ? (locale as LocaleCode)
    : null;
}

export function stripLocalePrefix(pathname: string) {
  const locale = getLocaleFromPathname(pathname);
  if (!locale) return pathname;
  return pathname.slice(locale.length + 1) || "/";
}

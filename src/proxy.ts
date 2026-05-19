import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from './i18n/routing';
import { AUTH_TOKEN_COOKIE_NAME, getLocaleFromPathname, isProtectedPath } from "@/lib/auth-guard";

const intlMiddleware = createMiddleware(routing);

export function proxy(request: NextRequest) {
  if (isProtectedPath(request.nextUrl.pathname)) {
    const authToken = request.cookies.get(AUTH_TOKEN_COOKIE_NAME)?.value;
    if (!authToken) {
      const locale = getLocaleFromPathname(request.nextUrl.pathname) ?? routing.defaultLocale;
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = `/${locale}/auth/login`;
      redirectUrl.searchParams.set(
        "next",
        `${request.nextUrl.pathname}${request.nextUrl.search}`
      );
      return NextResponse.redirect(redirectUrl);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(th|en|lo|my|km|zh)/:path*'],
};

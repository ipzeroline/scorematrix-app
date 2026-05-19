# ScoreMatrix Codebase Index

Last indexed: 2026-05-18

## Purpose

ScoreMatrix is a multilingual football prediction, live score, rewards, missions, leaderboard, news, and admin dashboard app. Most user-facing data is currently static/mock data in `src/data`, with football fixtures and related entities loaded through a ScoreMatrix soccer backend wrapper.

Use this file as the first reference before opening many source files.

## Stack

- Framework: Next.js `16.2.6`, App Router under `src/app`
- React: `19.2.4`
- Language: TypeScript, strict mode, alias `@/*` -> `src/*`
- Styling: Tailwind CSS v4 via `@import "tailwindcss"` in `src/styles/globals.css`
- i18n: `next-intl` with locale-prefixed routes
- Client state: Zustand stores in `src/stores`
- Charts/icons: `recharts`, `lucide-react`
- Package manager files: `package-lock.json` present, use npm unless user says otherwise
- Scripts: `npm run dev`, `npm run build`, `npm run start` (`next start -p 7777`), `npm run lint`

Note: AGENTS.md asks to read `node_modules/next/dist/docs/` before writing Next.js code, but `node_modules` is not installed in this workspace at index time.

## Routing

Root route:

- `src/app/page.tsx` redirects `/` to `/th`
- `src/proxy.ts` uses `next-intl/middleware` and matches `/` plus locale-prefixed routes

Locale shell:

- `src/app/[locale]/layout.tsx`
- Route groups under locale are used only for organization: `(public)` for auth pages, `(member)` for protected member pages, and `(admin)` for admin pages. URL paths stay the same.
- Valid locales from `src/i18n.ts`: `th`, `en`, `lo`, `my`, `km`, `zh`
- Default locale: `th`
- Layout wraps pages with `NextIntlClientProvider`, `Header`, `Sidebar`, `Footer`, `MobileBottomNav`, `ToastContainer`

Main pages:

- `src/app/[locale]/page.tsx` dashboard/home
- Public routes include `livescore`, `matches`, `predict`, `ai-insight`, `credits`, `news`, `world-cup-2026`, plus auth pages under `src/app/[locale]/(public)/auth/*`
- Protected member routes live under `src/app/[locale]/(member)/*` and include `leaderboard`, `missions`, `events`, `rewards`, `stats`, `affiliate`, `leagues`, `notifications`, `profile`, `settings`, `wallet`
- Detail routes include `predict/[matchId]`, `ai-insight/[matchId]`, `news/[slug]`, `events/[eventId]`, `rewards/[rewardId]`, `livescore/[matchId]`
- Admin pages under `src/app/[locale]/(admin)/admin/*`
- Legal pages under `src/app/[locale]/legal/*`

API routes:

- `src/app/api/football/fixtures/route.ts`: returns fixtures from soccer backend, cached with short s-maxage
- `src/app/api/football/media/[...path]/route.ts`: proxies football media
- `src/app/api/football/flags/[...path]/route.ts`: proxies flags
- `src/app/api/news/regenerate/route.ts`: regenerates today news JSON

## Config

- `next.config.ts`
  - Uses `next-intl/plugin` with `./src/i18n/request.ts`
  - Disables `poweredByHeader`
  - Allows remote images from `https://media.api-sports.io`
  - Adds long cache headers for static assets and basic security headers
- `src/app/layout.tsx`
  - Imports `src/styles/globals.css`
  - Uses `Inter` and `Space_Grotesk` from `next/font/google`
  - Defines base metadata and JSON-LD website schema
- `src/app/globals.css` exists but is not imported by the active root layout

## i18n

- `src/i18n.ts`: locale constants and types
- `src/i18n/routing.ts`: `defineRouting`, `localePrefix: "always"`, `localeDetection: false`
- `src/i18n/request.ts`: loads messages from `src/messages/{locale}.json`, timezone `Asia/Bangkok`
- Translation files: `src/messages/th.json`, `en.json`, `lo.json`, `my.json`, `km.json`, `zh.json`

When adding visible text, update all message files or follow the local fallback pattern if one exists.

## Data Model And Mock Data

Core types:

- `src/types/common.ts`: enums such as `MatchStatus`, `PredictionStatus`, `RewardCategory`, `MissionType`, `LeaderboardPeriod`
- Domain types: `match`, `team`, `prediction`, `ai-insight`, `reward`, `mission`, `leaderboard`, `event`, `news`, `user`, `credits`, `admin`

Static data:

- `src/data/index.ts` re-exports most mock datasets
- Football basics: `teams.ts`, `leagues.ts`, `players.ts`, `matches.ts`, `match-events.ts`, `match-stats.ts`, `lineups.ts`
- Product/game loops: `predictions.ts`, `missions.ts`, `achievements.ts`, `rewards.ts`, `redemptions.ts`, `leaderboard.ts`, `private-leagues.ts`
- Page copy: `leaderboard-page-content.ts`, `leagues-page-content.ts`, `ai-insight-page-content.ts`, `mission-page-content.ts`, `legal-documents.ts`, `legal-info-pages.ts`
- News JSON is date/locale based under `src/data/news/YYYY-MM-DD/{locale}.json`
- World Cup data: `src/data/world-cup-2026.ts`

## Football Backend Layer

- `src/lib/api-football.ts`
  - Base URL: `API_FOOTBALL_BASE_URL` or `https://api.scorematrix.live/api/v1/soccer`
  - Exports fetchers for fixtures, fixture details, leagues, standings, schedules, team profiles, player profiles, and H2H
  - Normalizes backend values and proxies media URLs
  - Falls back to mock fixtures through `getMockApiFootballFixtures`
- `src/lib/football-page-data.ts`
  - `loadFixturesForDate(limit?, revalidate = 300)`
  - `loadLiveFixtures(limit = 24, revalidate = 120)`
  - `pickRandomFixture`, `sortFixtures`
- `src/lib/football-media.ts`: rewrites football media/flag URLs through local proxy routes
- `src/lib/football-slugs.ts`: builds/extracts SEO slugs for fixtures/leagues/entities

Important behavior: `loadFixturesForDate` uses today's UTC date via `new Date().toISOString().slice(0, 10)`, not Bangkok-local date.

## Auth And Member API Reference

- External source: `/Users/mckazine/Desktop/scorematrix-frontend-api-reference.html`
- Local summary: `API_REFERENCE_INDEX.md`
- Base URL: `https://api.scorematrix.live/api/v1`
- Covered endpoints: auth registration/login/logout/password reset and member profile/update/favorite-team/change-password.
- All responses include stable `code`; use `code` for frontend i18n/error handling instead of parsing backend Thai messages.
- Authenticated endpoints require `Authorization: Bearer {access_token}`.
- Important caveat: API doc lists language values `th`, `en`, `zh`, `ja`, `ko`, `vi`, while this app supports `th`, `en`, `lo`, `my`, `km`, `zh`.

Local API modules:

- `src/lib/api-client.ts`: shared `apiGet`, `apiPost`, auth token cookie helpers, locale headers, and `ApiClientError`. Auth token cookie name is `scorematrix-auth-token`; legacy local/session storage token is migrated then cleared.
- `src/lib/auth-guard.ts`: shared auth route guard. Protected routes include leaderboard, missions, events, rewards, stats, affiliate, leagues, profile, wallet, settings, and notifications.
- `src/lib/auth-api.ts`: typed wrappers for auth/member endpoints from the API reference.
- `src/lib/soccer-api.ts`: typed raw API wrapper for `GET /soccer/teams`, used by register favorite-team selection.
- `src/components/auth/FavoriteTeamSelect.tsx`: grouped team selector for registration, grouped by league and showing league/team logos.
- `src/app/[locale]/(public)/auth/register/page.tsx`: submits to `POST /auth/register-app` with Register App API fields and loads favorite teams from `GET /soccer/teams`.
- `src/app/[locale]/(public)/auth/login/page.tsx`: submits to `POST /auth/login`, stores bearer token through `auth-api`, updates `useUserStore`, then redirects to locale home or `next` target.
- `src/components/layout/UserMenu.tsx`: profile dropdown logout calls `POST /auth/logout`, clears auth token and user store, then redirects to locale home.
- `src/components/layout/Header.tsx`: when logged in, syncs navbar points/credits from `GET /member/profile` into `useUserStore`.
- `src/app/[locale]/(admin)/admin/layout.tsx`: admin shell and sidebar for the `/admin` section, organized under the `(admin)` route group.
- `src/app/[locale]/(member)/profile/page.tsx`: profile dashboard UI backed by `useUserStore`, showing profile header, points/credits, stats, XP progress, stats link, and recent predictions.
- `src/app/[locale]/(member)/profile/edit/page.tsx`: loads `GET /member/profile`, validates editable API fields, and submits `POST /member/update-profile`.
- `src/app/[locale]/(public)/auth/forgot-password/page.tsx`: validates email and submits `POST /auth/forgot-password`; success copy follows the API's anti-enumeration behavior.
- `src/proxy.ts`: redirects unauthenticated access to protected member routes to `/{locale}/auth/login?next=...` using the auth cookie.

## News

- `src/lib/news-generator.ts`
  - Page size: `NEWS_PAGE_SIZE = 9`
  - Reads generated JSON articles from `src/data/news`
  - Exports `getTodayArticles`, `getArticleBySlug`, `searchArticles`, `getAllArticles`, `getPaginatedArticles`, `getLatestArticles`, `getAllNewsStaticParams`, `regenerateTodayNews`
- `src/components/news/NewsListClient.tsx` and `NewsDetailClient.tsx` handle news client UI

## State And Client Components

Zustand stores:

- `src/stores/user-store.ts`: user profile, points, credits, level, preferences, achievements, transactions
- `src/stores/checkin-store.ts`: daily check-in state and rewards
- `src/stores/notification-store.ts`: toasts and app notifications
- `src/stores/event-store.ts`: event joining/progress/reward state
- `src/stores/index.ts`: store re-exports

Layout client components:

- `Header`, `Sidebar`, `MobileBottomNav`, `LanguageSwitcher`, `UserMenu`
- `StoreInitializer` currently returns `null`

When editing components, preserve Server Component defaults in `src/app` pages and add `"use client"` only for hooks/browser state/event handlers.

## UI Structure

Reusable UI primitives:

- `src/components/ui`: `Button`, `Card`, `Badge`, `Input`, `Select`, `Modal`, `Dropdown`, `Tabs`, `ProgressBar`, `Toast`, `ToastContainer`, `Skeleton`, `EmptyState`, `Avatar`, `StatusBadge`

Shared domain components:

- `src/components/shared`: match cards, leaderboards, prediction cards, AI insight panel, live score table, stats, rewards, missions, daily check-in, badges, gauges, event timeline

Feature components:

- `src/components/home`: dashboard sections
- `src/components/livescore`, `matches`, `predict`, `news`, `legal`, `affiliate`, `world-cup`

Visual style:

- Dark cyber sports dashboard
- Main palette is cyan, magenta, green, gold, dark backgrounds
- Global CSS contains many animation utilities in `src/styles/globals.css`

## Common Workflows

Add or change a locale page:

1. Add page under `src/app/[locale]/.../page.tsx`
2. Use `params: Promise<{ locale: string }>` pattern found in existing pages
3. Use `generateStaticParams()` from `LOCALE_CODES` for static locale pages when appropriate
4. Use `getTranslations` server-side or `useTranslations` in client components
5. Update navigation in `Header`, `Sidebar`, and `MobileBottomNav` if the page should be reachable

Add visible copy:

1. Prefer message keys in `src/messages/*.json`
2. For large page-specific copy, check `src/data/*-page-content.ts`
3. Keep all six locales in sync

Add football API usage:

1. Reuse `src/lib/api-football.ts`
2. Keep fetch/cache behavior explicit
3. Do not import server-only fetch logic into client components
4. Prefer a route handler or Server Component data load when client interactivity is not required

Validate:

1. `npm run lint`
2. `npm run build` for route/config/rendering changes
3. Browser check for UI changes if a dev server is running or can be started

## Known Caveats

- `node_modules` is absent at index time, so local Next.js bundled docs could not be read.
- `README.md` is still mostly the create-next-app default.
- `package.json` name is `deepseek-app`, while the product is ScoreMatrix.
- `src/app/globals.css` appears unused; active styles come from `src/styles/globals.css`.
- Some hardcoded English UI text exists inside client components, especially notifications and layout widgets.
- `src/types/common.ts` has a `Locale` union that does not match the active `next-intl` locales.

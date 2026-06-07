# ScoreMatrix Codebase Index

Last indexed: 2026-05-24

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
- Locale layout reads auth cookies with `cookies()` and passes the initial session hint to `Header`, so locale routes are dynamic and the navbar does not flash guest auth buttons before Zustand rehydrates.
- Locale layout reserves top padding for the fixed `Header`; mobile footer navigation is fixed at the viewport bottom.

Main pages:

- `src/app/[locale]/page.tsx` dashboard/home
- Public routes include `livescore`, `matches`, `predict`, `ai-insight`, `credits`, `news`, `world-cup-2026`, plus auth pages under `src/app/[locale]/(public)/auth/*`
- Protected member routes live under `src/app/[locale]/(member)/*` and include `leaderboard`, `missions`, `events`, `rewards`, `stats`, `affiliate`, `leagues`, `notifications`, `profile`, `settings`, `wallet`
- Detail routes include `predict/[matchId]` for legacy redirects, `predict/[matchId]/[homeTeamId]/[awayTeamId]` as the canonical predict URL, `ai-insight/[matchId]`, `news/[slug]`, `events/[eventId]`, `rewards/[rewardId]`, `livescore/[matchId]`, `livescore/match/[providerId]`, `matches/detail/[id]`, `match/[providerId]`
- `src/app/[locale]/(member)/leagues/[id]/page.tsx` renders private-league details and standings from `GET /leagues/{id}` without exposing backend league, owner, or member IDs.
- Non-locale team detail URLs at `/football/teams/{teamId}` redirect to the default locale route `/{defaultLocale}/football/teams/{teamId}` while preserving query parameters.
- Non-locale live-score match URLs at `/livescore/match/{providerId}` redirect to the default locale route `/{defaultLocale}/livescore/match/{providerId}` while preserving query parameters.
- Predict links use the route `/predict/{apiFixtureId}/{homeTeamId}/{awayTeamId}` for API fixtures and keep local mock match ids for mock fixtures; older slug URLs such as `/predict/{matchSlug}-{apiFixtureId}/{homeTeamId}/{awayTeamId}` redirect to the canonical id-only route.
- Admin pages under `src/app/[locale]/(admin)/admin/*`
- Legal pages under `src/app/[locale]/legal/*`

API routes:

- `src/app/api/auth/{login,register,refresh,logout}/route.ts`: same-origin auth BFF routes; proxy auth calls to the scorm backend, keep refresh tokens in rotating HttpOnly cookies, strip refresh tokens from browser-visible JSON, and clear server-managed refresh sessions on failure/logout
- `src/app/api/football/fixtures/route.ts`: returns fixtures from soccer backend, cached with short s-maxage
- `src/app/api/football/fixtures/live/route.ts`: returns live fixtures from soccer backend `GET /live` with no-store caching
- `src/app/api/football/fixtures/today/route.ts`: legacy local route that now returns live fixtures from soccer backend `GET /live`
- `src/app/api/football/fixtures/upcoming/route.ts`: returns upcoming fixtures from soccer backend `GET /fixtures/upcoming`
- `src/app/api/football/teams/route.ts`: proxies favorite-team options from soccer backend `GET /teams`
- `src/app/api/football/teams/[id]/squad/route.ts`: proxies team squad players from soccer backend `GET /teams/{team_id}/squad`
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
- Product/game loops: `predictions.ts`, `missions.ts`, `achievements.ts`, `rewards.ts`, `redemptions.ts`, `private-leagues.ts`
- Page copy: `leaderboard-page-content.ts`, `ai-insight-page-content.ts`, `mission-page-content.ts`, `legal-documents.ts`, `legal-info-pages.ts`; League page copy lives in the `leagues` namespace of `src/messages/*.json`.
- News JSON is date/locale based under `src/data/news/YYYY-MM-DD/{locale}.json`
- World Cup data: `src/data/world-cup-2026.ts`

## Football Backend Layer

- `src/lib/api-football.ts`
  - Base URL: required `API_FOOTBALL_BASE_URL` from root `.env`
  - Exports fetchers for fixtures, live fixtures from `GET /live`, AI insights from `GET /ai-insights`, legacy today's fixtures mapped to the live feed, upcoming fixtures from `GET /fixtures/upcoming`, fixture details, leagues, standings, schedules, team profiles from `GET /soccer/teams/{provider_id}`, player profiles from `GET /soccer/players/{id}`, and H2H
  - League listing maps `GET /leagues` / `v1/soccer/leagues` responses from `data[]` with `provider_id`, `current_season`, `sort_order`, `logo`, and country fields into `ApiFootballLeagueEntry`
  - Normalizes backend values and proxies media URLs
  - Falls back to mock fixtures through `getMockApiFootballFixtures`
- `src/lib/football-page-data.ts`
  - `loadFixturesForDate(limit?, revalidate = 60)` uses today's Asia/Bangkok date and returns an empty list instead of stale mock fixtures when the API fails
  - `loadLiveFixtures(limit = 24, revalidate = 15)` uses `GET /live` for homepage live match highlights
  - `loadUpcomingFixtures(limit?, revalidate = 60)` uses `GET /fixtures/upcoming`
  - `pickRandomFixture`, `sortFixtures`
- `src/app/[locale]/page.tsx` loads live highlights from uncached `GET /live`, the "today matches" list from uncached date-filtered fixtures using the Asia/Bangkok date, and the highest-confidence homepage AI feature from uncached `GET /ai-insights` with live insights as fallback.
- `src/app/[locale]/ai-insight/page.tsx` maps grouped `live`, `highConfidence`, and `upsetAlert` data from soccer backend `GET /ai-insights`, displays only insights with complete confidence/probability metrics, and distinguishes empty results from API failures.
- `src/app/[locale]/ai-insight/[matchId]/page.tsx` requires a complete insight from `GET /ai-insights`, uses real model signals, supplements them with fixture detail and H2H API data, and hides unavailable sections instead of generating placeholder metrics.
- Predict detail pages load H2H fixtures through `GET /soccer/h2h/{teamA}/{teamB}` via `getApiFootballH2H`; the predict form displays those fixtures in the existing right-side context panel.
- Predict detail form sends `pointsWagered` as the base wager multiplied by confidence (`safe` x1.0, `confident` x1.5, `bold` x2.0).
- Successful prediction submission dispatches `MEMBER_WALLET_REFRESH_EVENT`; `Header` listens for it and reloads `GET /users/me` so navbar points/credits update.
- `src/app/[locale]/livescore/page.tsx` dynamically uses uncached `GET /live` through `getApiFootballLiveFixtures` for its initial fixture list with no limit; the `Livescore` client view refreshes through `/api/football/fixtures/live` once on mount or when the user presses Sync.
- `src/app/[locale]/livescore/match/[providerId]/page.tsx` reuses the live-score match detail view and loads detail data through `getApiFootballFixtureDetails(providerId)`, which calls soccer backend `GET /fixtures/{providerId}` and maps real API metadata such as referee, status long/extra time, periods, venue, lineups, events, team statistics, and player statistics.
- `src/app/[locale]/matches/detail/[id]/page.tsx` reuses the same live-score match detail view; `src/components/matches/MatchesApi.tsx` links match rows/cards to `/{locale}/matches/detail/{apiFixtureId}` when a provider id exists.
- `src/app/[locale]/match/[providerId]/page.tsx` is a legacy provider-id detail route that reuses the same view
- `src/app/[locale]/matches/page.tsx` uses uncached `GET /fixtures/upcoming` data through `loadUpcomingFixtures`; `MatchesApi` refreshes once on mount and includes status tabs for all/live/upcoming/finished/postponed/cancelled using normalized fixture status groups.
- `src/lib/football-media.ts`: rewrites football media/flag URLs through local proxy routes
- `src/lib/football-slugs.ts`: builds/extracts SEO slugs for fixtures/leagues/entities

Important behavior: `loadFixturesForDate` uses today's UTC date via `new Date().toISOString().slice(0, 10)`, not Bangkok-local date.

## System Architecture And API References

Newest architecture/API source:

- External source: `/Users/mckazine/Desktop/SCOREMATRIX_SYSTEM_ARCHITECTURE.html`
- Local summary: `SCOREMATRIX_SYSTEM_ARCHITECTURE_INDEX.md`
- Base URL: `https://api.scorematrix.live/api/v1`
- API style: REST JSON with `Bearer` JWT for user/admin endpoints; errors are documented as `{ error: { code, message } }`.
- Key target endpoints: `GET/PATCH /users/me`, `PATCH /users/me/preferences`, `GET /matches`, `GET /matches/live`, `POST/GET /predictions`, `POST /checkins`, `GET /leaderboard`, `GET /events`, `GET /rewards`, `POST /rewards/:id/redeem`, `GET /missions`, `POST /missions/:id/claim`, `GET/PATCH /notifications`, `GET/POST /referrals`, `GET/POST /credits`, `GET /stats/accuracy`, `GET /stats/form`, private leagues, payment webhook, and admin endpoints.
- Important caveat: this newer architecture differs from the older member API in `API_REFERENCE_INDEX.md`; prefer the new architecture for new feature work unless the task explicitly targets legacy member endpoints.

## Legacy Auth And Member API Reference

- Latest production source: `/Users/mckazine/Desktop/SCOREMATRIX_API_LATEST.html`
- Legacy source: `/Users/mckazine/Desktop/scorematrix-frontend-api-reference.html`
- Local summary: `API_REFERENCE_INDEX.md`
- Base URL: `https://api.scorematrix.live/api/v1/scorm`; `src/lib/api-client.ts` appends `/scorm` to `NEXT_PUBLIC_SCOREMATRIX_API_BASE_URL` when it is not already present.
- Covered endpoints: auth registration/login/logout/password reset and member profile/update/favorite-team/change-password.
- All responses include stable `code`; use `code` for frontend i18n/error handling instead of parsing backend Thai messages.
- Authenticated endpoints require `Authorization: Bearer {access_token}`.
- Important caveat: API doc lists language values `th`, `en`, `zh`, `ja`, `ko`, `vi`, while this app supports `th`, `en`, `lo`, `my`, `km`, `zh`.

Local API modules:

- `src/lib/api-client.ts`: shared `apiGet`, `apiPost`, `apiPatch`, raw/form helpers, access-token cookie helpers, locale headers, and expired-token refresh-and-retry through same-origin `POST /api/auth/refresh`. Auth token cookie name is `scorematrix-auth-token` and its persistent cookie cap matches the 15-minute access-token lifetime; the browser-readable `scorematrix-refresh-session` cookie is only a non-secret remember-me marker. Generic 401 and token-expired payloads receive one refresh/retry attempt, allowing legacy refresh cookies to migrate to HttpOnly on their next rotation. If refresh fails, it clears client auth state, asks the auth BFF to clear the HttpOnly refresh cookie, and dispatches a client session-expired event.
- `src/lib/auth-session-server.ts`: server-only auth BFF helpers for scorm backend requests, same-origin mutation checks, refresh-token extraction/redaction, and rotating `scorematrix-refresh-token` HttpOnly/Secure/SameSite=Strict cookie management. Refresh cookies are capped at the backend refresh-token lifetime of one hour.
- `src/lib/auth-guard.ts`: shared auth route guard. Protected routes include leaderboard, missions, events, rewards, stats, affiliate, leagues, profile, wallet, settings, and notifications.
- `src/lib/auth-api.ts`: typed wrappers for auth/member endpoints from the API reference. `GET/PATCH /users/me` responses are normalized from production snake_case stats/preferences into the camelCase fields used by the UI.
- `src/lib/checkins-api.ts`: typed wrapper for `GET /checkins/rewards` and `POST /checkins`; the homepage `DailyCheckIn` loads the daily reward schedule from the backend, submits check-ins before updating local streak/points, and shows backend error messages through toast and inline copy.
- `src/lib/achievements-api.ts`: typed wrapper for `GET /achievements`; the `/missions` achievements tab maps unlocked and locked API achievements into the existing mission dashboard card grid.
- `src/lib/credits-api.ts`: typed wrapper for `GET /credits/packages`; the `/credits` page uses it to load purchasable credit packages and first-purchase bonus data from the scorm API.
- `src/lib/events-api.ts`: typed wrapper for `GET /events`; the `/events` page maps API event fields into the existing event card grid and active-event highlight UI.
- `src/lib/leaderboard-api.ts`: typed wrapper for `GET /leaderboard`; the `/leaderboard` page, homepage leaderboard preview, and desktop sidebar leaderboard card all load ranking data from this endpoint only, with no mock fallback.
- `src/lib/missions-api.ts`: typed wrapper for `GET /missions` and `POST /missions/:id/claim`; the `/missions` page maps `daily`, `weekly`, and `special` API missions into the existing mission card UI and supports interactive reward claims with Zustand sync.
- `src/lib/leagues-api.ts`: typed wrappers for `GET /leagues`, `GET /leagues/:id`, `POST /leagues`, and `POST /leagues/:id/join`; entry-fee aliases are normalized, full leagues cannot be joined, league lists avoid exposing backend user IDs, and private invite codes render only when the detail response confirms the viewer is the owner.
- `src/lib/referrals-api.ts`: typed wrapper for `GET /referrals`; the `/affiliate` page maps referral code, totals, share URL, referral rows, and reward tiers into the existing affiliate dashboard UI. Invite links are normalized client-side to the current origin and locale register route `/{locale}/auth/register?ref=...`.
- `src/lib/rewards-api.ts`: typed wrapper for `GET /rewards`, `GET /rewards/{id}`, and `POST /rewards/:id/redeem`; the `/rewards` page maps API reward catalogue items into the existing tabs/card grid UI, `/rewards/[rewardId]` loads the selected reward detail from the backend and handles point spending, and the desktop sidebar rewards card loads active reward highlights from the same catalogue endpoint.
- `src/lib/stats-api.ts`: typed wrapper for `GET /stats/accuracy`; the `/stats` dashboard maps API `overall`, `trend`, and `leagueBreakdown` data into the existing summary cards and charts.
- `src/lib/soccer-api.ts`: typed client wrapper for local `/api/football/teams`, which proxies soccer backend `GET /teams`; the local route returns normalized `teams` groups for favorite-team selection while preserving the backend `data` payload.
- `src/components/auth/FavoriteTeamSelect.tsx`: grouped team selector for registration, grouped by league and showing league/team logos.
- `src/app/[locale]/(public)/auth/register/page.tsx`: submits through same-origin `POST /api/auth/register`; the BFF stores the refresh token as HttpOnly while `auth-api` stores the returned access token, and the page loads favorite teams from `GET /teams`.
- `src/app/[locale]/(public)/auth/login/page.tsx`: submits through same-origin `POST /api/auth/login`; the BFF stores the refresh token as HttpOnly while `auth-api` stores the returned access token, then the page updates `useUserStore` and redirects to locale home or `next` target.
- `src/components/layout/UserMenu.tsx`: profile dropdown logout calls same-origin `POST /api/auth/logout`, which forwards backend logout and clears the HttpOnly refresh session; the client then clears its access token/user store and redirects to locale home.
- `src/components/shared/StoreInitializer.tsx`: listens for session-expired events from `api-client`, clears the user store, shows a localized toast, and redirects to locale login after a 3-second delay with `next` set to the current URL.
- `src/components/layout/Header.tsx`: uses the server-provided auth cookie hint plus `useUserStore.isLoggedIn` for first-paint navbar state; when logged in, syncs navbar points, credits, rank, XP, and level from normalized `GET /users/me` stats into `useUserStore`; `UserMenu` shows rank and XP progress in the account dropdown.
- `src/app/[locale]/(admin)/admin/layout.tsx`: admin shell and sidebar for the `/admin` section, organized under the `(admin)` route group.
- `src/app/[locale]/(member)/profile/page.tsx`: profile dashboard UI loads current profile data through `getCurrentUser()` (`GET /scorm/users/me` via the API client base URL), syncs known fields into `useUserStore`, and falls back to the last store values on load failure.
- `src/app/[locale]/(member)/profile/edit/page.tsx`: loads `GET /member/profile`, validates editable API fields, and submits `POST /member/update-profile`.
- `src/app/[locale]/(public)/auth/forgot-password/page.tsx`: validates email and submits `POST /auth/forgot-password`; success copy follows the API's anti-enumeration behavior.
- `src/proxy.ts`: redirects unauthenticated access to protected member routes to `/{locale}/auth/login?next=...` only when both access and refresh token cookies are missing.

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

# ScoreMatrix Codebase Index

Last indexed: 2026-06-22

## Purpose

ScoreMatrix is a multilingual football prediction, live score, rewards, missions, leaderboard, and news app. Most user-facing data is currently static/mock data in `src/data`, with football fixtures and related entities loaded through a ScoreMatrix soccer backend wrapper.

Use this file as the first reference before opening many source files.

## Stack

- Framework: Next.js `16.2.9`, App Router under `src/app`
- React: `19.2.4`
- Language: TypeScript, strict mode, alias `@/*` -> `src/*`
- Styling: Tailwind CSS v4 via `@import "tailwindcss"` in `src/styles/globals.css`
- i18n: `next-intl` with locale-prefixed routes
- Client state: Zustand stores in `src/stores`
- Charts/icons: `recharts`, `lucide-react`
- Package manager files: `package-lock.json` present, use npm unless user says otherwise
- Scripts: `npm run dev`, `npm run build`, `npm run start` (`next start -p 7777`), `npm run lint`, `npm run mcp:index`, `npm run mcp:status`

Note: AGENTS.md asks to read `node_modules/next/dist/docs/` before writing Next.js code. `node_modules` is installed in this workspace.

## Codebase Memory MCP

- Project name: `Users-zeroline-Documents-scorematrix-app`
- Persistent artifact: `.codebase-memory/graph.db.zst`
- Current indexed graph: 12224 nodes, 18563 edges
- Run `npm run mcp:index` after broad code changes or when the graph looks stale.
- Run `npm run mcp:status` to confirm indexed projects from the CLI.
- The MCP database lives in `~/.cache/codebase-memory-mcp`; Codex sandboxed commands may show `nodes: 0` or fail at `dump` unless the command is allowed to run outside the sandbox.
- If Codex MCP tools return `Transport closed` while the CLI status is ready, restart the Codex session from this repo so the MCP bridge reconnects to the indexed artifact.

## Routing

Root route:

- `src/app/page.tsx` redirects `/` to `/th`
- `src/proxy.ts` uses `next-intl/middleware` and matches `/` plus locale-prefixed routes

Locale shell:

- `src/app/[locale]/layout.tsx`
- Route groups under locale are used only for organization: `(public)` for auth pages and `(member)` for protected member pages. URL paths stay the same.
- Valid locales from `src/i18n.ts`: `th`, `en`, `lo`, `my`, `km`, `zh`
- Default locale: `th`
- Layout wraps pages with `NextIntlClientProvider`, `Header`, `Sidebar`, `Footer`, `MobileBottomNav`, `ToastContainer`
- Locale layout no longer reads auth cookies, avoiding a layout-level dynamic runtime dependency. Header session state is hydrated through the lightweight same-origin `/api/auth/session` probe and member BFF calls. Do not add `generateStaticParams()` at the locale layout level unless every child route can be safely prerendered for all locales.
- Locale layout reserves top padding for the fixed `Header`; mobile footer navigation is fixed at the viewport bottom.
- Locale routes include shared skeleton loading, member-route skeleton loading, retryable error, and localized not-found fallbacks.

Main pages:

- `src/app/[locale]/page.tsx` dashboard/home
- Public routes include `livescore`, `matches`, `predict`, `ai-insight`, `news`, `world-cup-2026`, plus auth pages under `src/app/[locale]/(public)/auth/*`
- `src/app/[locale]/matches/page.tsx` renders a public professional match-center surface through `src/components/matches/MatchesApi.tsx`: compact hero, five-day matchday strip, last-updated signal, date/league/search/status filters, grouped league headers, and status-aware row actions.
- Protected member routes include `credits`, `leaderboard`, `missions`, `events`, `rewards`, `stats`, `affiliate`, `leagues`, `notifications`, `profile`, `settings`, `wallet`, and `wallet/credit-history`
- Detail routes include `predict/[matchId]` for legacy redirects, `predict/[matchId]/[homeTeamId]/[awayTeamId]` as the canonical predict URL, `ai-insight/[matchId]`, `news/[slug]`, `events/[eventId]`, `rewards/[rewardId]`, `livescore/[matchId]`, `livescore/match/[providerId]`, `matches/detail/[id]`, `match/[providerId]`
- `src/app/[locale]/(member)/leagues/[id]/page.tsx` renders private-league details and standings from `GET /leagues/{id}` without exposing backend league, owner, or member IDs. League owners additionally see `totalFeesReceived` from the detail payload as an owner-only total entry-fee metric and an owner-only recent `history` preview with a responsive searchable modal for joins and entry-fee activity. The league detail client includes an esport-style league webboard backed by scorm `GET/POST /leagues/{leagueId}/threads`, thread detail/replies, and reaction endpoints, with mock threads only as a frontend fallback when the webboard API fails.
- `src/app/[locale]/(member)/leagues/page.tsx` renders joined and available private leagues from `GET /leagues`; owner cards show `totalFeesReceived` only for leagues where `isOwner` is true, using the list payload when present and fetching detail as fallback when missing.
- Non-locale team detail URLs at `/football/teams/{teamId}` redirect to the default locale route `/{defaultLocale}/football/teams/{teamId}` while preserving query parameters.
- Non-locale player detail URLs at `/football/players/{playerId}` redirect to the default locale route `/{defaultLocale}/football/players/{playerId}` while preserving query parameters.
- Non-locale live-score match URLs at `/livescore/match/{providerId}` redirect to the default locale route `/{defaultLocale}/livescore/match/{providerId}` while preserving query parameters.
- Non-locale AI insight detail URLs at `/ai-insight/{matchId}` redirect to the default locale route `/{defaultLocale}/ai-insight/{matchId}` while preserving query parameters.
- Predict links use the route `/predict/{apiFixtureId}/{homeTeamId}/{awayTeamId}` for backend fixtures and keep local mock match ids for mock fixtures; older slug URLs such as `/predict/{matchSlug}-{apiFixtureId}/{homeTeamId}/{awayTeamId}` redirect to the canonical id-only route.
- Legal pages under `src/app/[locale]/legal/*`

Backend routes:

- `src/app/api/auth/{login,register,refresh,logout}/route.ts`: same-origin auth BFF routes; proxy auth calls to the scorm backend, keep refresh tokens in rotating HttpOnly cookies, strip refresh tokens from browser-visible JSON, and clear server-managed refresh sessions on failure/logout
- `src/app/api/data/[...path]/route.ts`: same-origin data Backend BFF; proxies browser data/member requests to `DATA_BASE_URL setting` while preserving bearer and locale headers, and normalizes proxy/backend failures or non-JSON backend responses into structured JSON errors
- `src/app/api/referral-clicks/route.ts`: same-origin public referral click tracker; accepts a register-page referral code, forwards client IP/user-agent/referer plus `referral_code` to scorm `POST /referral-clicks`, and returns no-store JSON without blocking registration UI
- `src/app/api/football/fixtures/route.ts`: returns uncached fixtures from the soccer backend
- `src/app/api/football/fixtures/live/route.ts`: returns live fixtures from soccer root `GET /?status_group=live` with no-store caching
- `src/app/api/football/fixtures/today/route.ts`: returns today's fixtures from soccer backend `GET /fixtures/today`
- `src/app/api/football/fixtures/upcoming/route.ts`: returns upcoming fixtures from soccer backend `GET /fixtures/upcoming`
- `src/app/api/football/teams/route.ts`: proxies favorite-team options from soccer backend `GET /teams`
- `src/app/api/football/teams/[id]/squad/route.ts`: proxies team squad players from soccer backend `GET /teams/{team_id}/squad`
- `src/app/api/football/players/[id]/route.ts`: proxies football player profiles from soccer backend `GET /players/{id}`
- `src/app/api/football/media/[...path]/route.ts`: proxies provider sports football media from allowlisted roots and returns cacheable image responses
- `src/app/api/football/flags/[...path]/route.ts`: proxies allowlisted flagcdn PNG paths and returns cacheable image responses
- `src/app/api/news/regenerate/route.ts`: regenerates today news JSON only when `Authorization: Bearer {NEWS_REGENERATION_SECRET|CRON_SECRET}` or `x-cron-secret` matches the configured secret

## Config

- `.env`
  - `FOOTBALL_BASE_URL setting`: football backend base; URL normalization guarantees exactly one trailing `/soccer`
  - `DATA_BASE_URL setting`: data/auth backend base; URL normalization guarantees exactly one trailing `/scorm`
  - These are the only backend backend base URL env variables; browser data requests use same-origin BFF routes.
- `next.config.ts`
  - Uses `next-intl/plugin` with `./src/i18n/request.ts`
  - Disables `poweredByHeader`
  - Enables Next.js image optimization with AVIF/WebP output and allows remote images from `https://media.api-sports.io`
  - Disables generated ETags
  - Adds security headers globally: DNS prefetch, nosniff, strict referrer policy, HSTS, frame denial, restricted permissions policy, cross-origin opener policy, and a baseline CSP compatible with the current inline JSON-LD/Tailwind usage
  - Applies no-store headers only to protected member routes, auth pages, realtime match/live score routes, auth/data Backends, and football data Backends while leaving general public locale pages and static/media assets cacheable
- `src/app/layout.tsx` no longer forces global dynamic/no-store behavior. Individual locale pages, Backend routes, and realtime football routes keep explicit dynamic/no-store settings where freshness is required.
- `src/app/layout.tsx`
  - Imports `src/styles/globals.css`
  - Uses `Inter` and `Noto_Sans_Thai` from `next/font/google`; global CSS maps the generated font variables into the project font stack
  - Defines base metadata and JSON-LD website schema
- `src/lib/json-ld.ts` provides `serializeJsonLd()` for structured-data scripts so `<` is escaped before insertion through `dangerouslySetInnerHTML`.
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
- Domain types: `match`, `team`, `prediction`, `ai-insight`, `reward`, `mission`, `leaderboard`, `event`, `news`, `user`, `credits`

Static data:

- `src/data/index.ts` re-exports most mock datasets
- Football basics: `teams.ts`, `leagues.ts`, `players.ts`, `matches.ts`, `match-events.ts`, `match-stats.ts`, `lineups.ts`
- Product/game loops: `predictions.ts`, `missions.ts`, `achievements.ts`, `rewards.ts`, `redemptions.ts`, `private-leagues.ts`
- Page copy: `leaderboard-page-content.ts`, `ai-insight-page-content.ts`, `mission-page-content.ts`, `legal-documents.ts`, `legal-info-pages.ts`; League page copy lives in the `leagues` namespace of `src/messages/*.json`.
- Legacy generated news JSON is date/locale based under `src/data/news/YYYY-MM-DD/{locale}.json`; public news pages now prefer the scorm articles Backend.
- Homepage SEO copy, metadata text, keywords, and FAQ entries live in `src/data/home-seo-content.ts` and are used by `src/app/[locale]/page.tsx` for localized metadata and visible FAQ/structured data.
- Livescore SEO copy, metadata text, keywords, and FAQ entries live in `src/data/livescore-seo-content.ts` and are used by `src/app/[locale]/livescore/page.tsx` for localized metadata, visible FAQ content, and live-event JSON-LD.
- Matches SEO copy, metadata text, keywords, and FAQ entries live in `src/data/matches-seo-content.ts` and are used by `src/app/[locale]/matches/page.tsx` for localized metadata, visible FAQ content, and fixture-list JSON-LD.
- AI Insight SEO copy, metadata text, keywords, and FAQ entries live in `src/data/ai-insight-seo-content.ts` and are used by `src/app/[locale]/ai-insight/page.tsx` for localized metadata, visible FAQ content, and insight-list JSON-LD.
- Predict SEO copy, metadata text, keywords, and FAQ entries live in `src/data/predict-seo-content.ts` and are used by `src/app/[locale]/predict/page.tsx` for localized metadata, visible FAQ content, and prediction-flow JSON-LD.
- News SEO copy, metadata text, keywords, and FAQ entries live in `src/data/news-seo-content.ts` and are used by `src/app/[locale]/news/page.tsx` for localized metadata, canonical/hreflang alternates, search-page robots directives, visible FAQ content, CollectionPage/FAQ/Breadcrumb JSON-LD, and article ItemList JSON-LD.
- Register SEO copy, metadata text, keywords, and FAQ entries live in `src/data/register-seo-content.ts` and are used by `src/app/[locale]/(public)/auth/register/page.tsx` for localized metadata, visible FAQ content, RegisterAction JSON-LD, and sitemap inclusion.
- Login SEO copy, metadata text, keywords, and FAQ entries live in `src/data/login-seo-content.ts` and are used by `src/app/[locale]/(public)/auth/login/page.tsx` for localized metadata, visible FAQ content, LoginAction JSON-LD, and sitemap inclusion.
- Team contact SEO/support copy lives in `src/data/team-contact-content.ts`; `src/app/[locale]/legal/contact/page.tsx` uses it for localized metadata, official support email `helloscorematrix@gmail.com`, visible FAQ content, ContactPage/Organization JSON-LD, and support-channel content.
- World Cup data: `src/data/world-cup-2026.ts`
- World Cup SEO content: `src/data/world-cup-2026-seo-content.ts`
- `src/app/[locale]/world-cup-2026/page.tsx` builds live World Cup groups from league detail data, preserves provider team IDs for links to localized team profiles, assigns collision-free team codes, filters duplicate or invalid self-match fixtures before rendering, and emits localized SEO metadata plus WebPage/SportsEvent/FAQ/Breadcrumb JSON-LD. When the soccer Backend fails or returns no standings, the page falls back to `src/data/world-cup-2026.ts` so the group board remains available.
- `src/components/home/WorldFootballFeature.tsx` displays live World Cup standings and matches of the day on the home page, with data server-fetched and passed down from `src/app/[locale]/page.tsx`.


## Football Backend Layer

- `src/lib/api-football.ts`
  - Base URL: required `FOOTBALL_BASE_URL setting` from root `.env`
  - Exports fetchers for fixtures, live fixtures from soccer root `GET /?status_group=live`, AI insights from `GET /ai-insights`, today's fixtures from `GET /fixtures/today`, upcoming fixtures from `GET /fixtures/upcoming`, fixture details, leagues, standings, schedules, team profiles from `GET /soccer/teams/{provider_id}`, player profiles from `GET /soccer/players/{id}`, and H2H
  - Team profile normalization preserves base team/venue fields plus optional `leagues[]` and `squad.players[]` returned by `GET /soccer/teams/{provider_id}`
  - League listing maps `GET /leagues` / `v1/soccer/leagues` responses from `data[]` with `provider_id`, `current_season`, `sort_order`, `logo`, and country fields into `ApiFootballLeagueEntry`
  - League detail normalization maps `GET /soccer/leagues/{provider_id}` into league metadata, country info, embedded teams, and embedded standings for the league detail page
  - Normalizes backend values and proxies media URLs; soccer requests use a 10-second timeout and structured failure logging, fixture response types omit the obsolete `source` field, and football fixture fetchers return empty results or backend errors instead of mock fixtures
- `src/lib/football-page-data.ts`
  - `loadFixturesForDate(limit?)` uses today's Asia/Bangkok date and returns an empty list instead of stale mock fixtures when the Backend fails
  - `loadLiveFixtures()` uses uncached soccer root `GET /?status_group=live` with no limit for homepage live match highlights and reports Backend failure separately from an empty result
  - `loadTodayFixtures(limit?)` uses uncached `GET /fixtures/today`
  - `loadUpcomingFixtures(limit?)` uses uncached `GET /fixtures/upcoming`
  - `pickRandomFixture`, `sortFixtures`
- `src/app/[locale]/page.tsx` loads live highlights exclusively from uncached soccer root `GET /?status_group=live` with no mock fallback; the client live section refreshes every 45 seconds while the tab is visible, preserves the last good result, and distinguishes backend errors from no live matches. The page also loads the "today matches" preview from uncached `GET /fixtures/today` sorted with the same `sortFixtures` order as `/matches`, and the highest-confidence homepage AI feature from uncached `GET /ai-insights` with live insights as fallback.
- The homepage hero banner loads public scorm banners from `GET /banners` via `src/lib/banners-api.ts`; `src/components/home/HeroBanner.tsx` renders backend-provided title, description, background image, and link URL with static translated slides only as a fallback when the Backend returns no banners.
- `src/app/[locale]/ai-insight/page.tsx` maps and deduplicates grouped `live`, `highConfidence`, and `upsetAlert` data from soccer backend `GET /ai-insights`; the list exposes `all`, `live`, `highConfidence`, and `upsetAlert` category filters with backend-group counts and distinguishes empty results from Backend failures. The page also emits localized metadata, canonical/hreflang alternates, visible FAQ content, FAQ/Breadcrumb JSON-LD, and a limited AI-insight ItemList from the loaded insights.
- `src/app/[locale]/ai-insight/[matchId]/page.tsx` renders a full AI match dashboard from scorm `GET /ai-insights/{fixtureId}` with bearer auth when available and a professional eSport-style match center: broadcast hero, large team panels, status/score board, confidence cards, probability map, model verdict, key factors, model comparison, community sentiment, form deep-dive, injury impact, lineup/trend cards, and optional head-to-head data when present in the payload. The detail route emits match-specific localized metadata, canonical/hreflang alternates, indexable robots directives, Open Graph/Twitter metadata, and WebPage/AnalysisNewsArticle/SportsEvent/Breadcrumb JSON-LD only when insight data is accessible; scorm `no_entitlement` responses render a login/package access gate using the backend message and quota data. When the AI response omits fixture metadata, the loader hydrates it from soccer `GET /fixtures/{fixtureId}`; only genuine backend 404 responses become a not-found page.
- AI insight detail hero reuses the shared `StatusBadge` with the fixture-detail status, matching the match-detail and other football pages.
- `src/app/[locale]/predict/page.tsx` no longer preloads soccer upcoming fixtures on the server; `src/components/predict/PredictApi.tsx` now loads scorm backend `GET https://api.scorematrix.live/api/v1/scorm/predictable-matches?excludePredicted=false` on the client, omits `Authorization` for guests, includes bearer auth for logged-in users, and renders the public prediction hub as the main conversion surface: professional hero, guest-safe platform preview stats, scoring-rule CTA, league/team search, all/open/predicted/live filters, grouped prediction rows, login-aware row actions, and authenticated prediction history. The public predict hub emits localized metadata, canonical/hreflang alternates, visible FAQ content, FAQ/Breadcrumb JSON-LD, and HowTo JSON-LD; protected predict detail URLs remain disallowed in robots.
- Predict detail pages load H2H fixtures through `GET /soccer/h2h/{teamA}/{teamB}` via `getApiFootballH2H` for AI suggestion context; the right-side panel now shows match-detail navigation and an AI insight link only when `GET /ai-insights/{fixtureId}` has data.
- Predict detail form loads scoring rules from scorm `GET /scoring-rules`; score previews use backend result tiers, extra bonuses, confidence multipliers, boost, streak, and formula text, while submitted `pointsWagered` remains the base wager multiplied by confidence.
- Successful prediction submission dispatches `MEMBER_WALLET_REFRESH_EVENT`; `Header` listens for it and reloads `GET /users/me` so navbar points/credits update.
- `src/app/[locale]/livescore/page.tsx` dynamically uses uncached soccer root `GET /?status_group=live` through `getApiFootballLiveFixtures` for its initial fixture list with no limit and returns an explicit error state on failure instead of mock fixtures; the `Livescore` client view renders a professional live match center with compact summary, last-updated signal, league/search filters, grouped league panels, status-aware rows, and match-center row actions. It refreshes through `/api/football/fixtures/live` every 45 seconds while the tab is visible or when the user presses Sync, preserving the last good result on refresh failure. The page also emits localized metadata, canonical/hreflang alternates, visible FAQ content, FAQ/Breadcrumb JSON-LD, and a limited live-event ItemList from the initially loaded fixtures.
- `src/app/[locale]/livescore/match/[providerId]/page.tsx` reuses the live-score match detail view and loads detail data through `getApiFootballFixtureDetails(providerId)`, which calls soccer backend `GET /fixtures/{providerId}` and maps real backend metadata such as referee, status long/extra time, periods, venue, lineups, events, team statistics, and player statistics.
- Fixture-detail lineup normalization accepts incomplete payloads and `start_xi` aliases, and always supplies safe `team`, `coach`, `startXI`, and `substitutes` fields before match-detail rendering.
- Fixture-detail normalization also reads the soccer backend's `team_statistics` and `team_squads` supplements; match-detail routes render these as separate season-statistics and squad-roster panels when fixture-level `statistics` or `lineups` are unavailable.
- `src/app/[locale]/matches/detail/[id]/page.tsx` reuses the same live-score match detail view; `src/components/matches/MatchesApi.tsx` links match rows/cards to `/{locale}/matches/detail/{apiFixtureId}` when a provider id exists.
- Match detail renders score data without fallback: the current score comes only from Backend `goals`, period scores come only from Backend `score.halftime`, `score.fulltime`, `score.extratime`, and `score.penalty`, and a score is shown only when both home and away values are present.
- `src/app/[locale]/match/[providerId]/page.tsx` is a legacy provider-id detail route that reuses the same view
- `src/app/[locale]/matches/page.tsx` loads the selected Bangkok-local date through soccer root `GET /` with `limit=500`; `MatchesApi` defaults to all fixtures, keeps date/league/status filters in the URL only after the user selects filters, uses backend whole-day counts, and treats stale NS/TBD plus AWD/WO according to the fixture Backend status-group contract. When the selected date is today and live matches exist, the client refreshes `/api/football/fixtures` every 45 seconds while the browser tab is visible. The page also emits localized metadata, canonical/hreflang alternates, visible FAQ content, FAQ/Breadcrumb JSON-LD, and a limited fixture ItemList from the selected date.
- `src/app/[locale]/football/teams/[teamId]/page.tsx` renders the team profile from `GET /soccer/teams/{provider_id}` with venue details, optional season stats, league participation cards, and a position-grouped squad roster that links to player detail pages.
- `src/app/[locale]/football/leagues/[leagueId]/page.tsx` now renders a redesigned league detail page from `GET /soccer/leagues/{provider_id}` with hero metadata, featured teams, embedded standings, and a season schedule panel
- `src/lib/football-media.ts`: rewrites football media/flag URLs through local proxy routes
- `src/lib/football-slugs.ts`: builds/extracts SEO slugs for fixtures/leagues/entities

Important behavior: `loadFixturesForDate` uses today's UTC date via `new Date().toISOString().slice(0, 10)`, not Bangkok-local date.

## System Architecture And Backend References

Newest architecture/backend source:

- External source: `/Users/mckazine/Desktop/SCOREMATRIX_SYSTEM_ARCHITECTURE.html`
- Local summary: `SCOREMATRIX_SYSTEM_ARCHITECTURE_INDEX.md`
- Backend URLs are configured only through `DATA_BASE_URL setting` and `FOOTBALL_BASE_URL setting`.
- Backend style: REST JSON with `Bearer` JWT for member-facing endpoints; errors are documented as `{ error: { code, message } }`.
- Key target endpoints: `GET/PATCH /users/me`, `PATCH /users/me/preferences`, `GET /matches`, `GET /matches/live`, `POST/GET /predictions`, `POST /checkins`, `GET /leaderboard`, `GET /events`, `GET /rewards`, `POST /rewards/:id/redeem`, `GET /missions`, `POST /missions/:id/claim`, `GET/PATCH /notifications`, `GET/POST /referrals`, `GET/POST /credits`, `GET /stats/accuracy`, `GET /stats/form`, private leagues, and payment webhook.
- Important caveat: this newer architecture differs from the older member Backend in `Backend_REFERENCE_INDEX.md`; prefer the new architecture for new feature work unless the task explicitly targets legacy member endpoints.

## Legacy Auth And Member Backend Reference

- Latest production source: `/Users/mckazine/Desktop/SCOREMATRIX_Backend_LATEST.html`
- Legacy source: `/Users/mckazine/Desktop/scorematrix-frontend-api-reference.html`
- Local summary: `Backend_REFERENCE_INDEX.md`
- Base URL: configured by server-only `DATA_BASE_URL setting`; shared URL normalization guarantees exactly one `/scorm` segment.
- Covered endpoints: auth registration/login/logout/password reset and member profile/update/favorite-team/change-password.
- All responses include stable `code`; use `code` for frontend i18n/error handling instead of parsing backend Thai messages.
- Authenticated endpoints require `Authorization: Bearer {access_token}`.
- Important caveat: backend doc lists language values `th`, `en`, `zh`, `ja`, `ko`, `vi`, while this app supports `th`, `en`, `lo`, `my`, `km`, `zh`.

Local Backend modules:

- `src/lib/backend-api-urls.ts`: server-only URL builder for the two backend env variables; strips duplicate leading/trailing namespace segments before producing URLs with exactly one `/soccer` or `/scorm`.
- `src/lib/api-client.ts`: shared `apiGet`, `apiPost`, `apiPatch`, raw/form helpers, access-token cookie helpers, locale headers, and expired-token refresh-and-retry through same-origin `POST /api/auth/refresh`. General data requests use same-origin `/api/data/**`, which proxies to `DATA_BASE_URL setting`. Auth token cookie name is `scorematrix-auth-token` and its persistent cookie cap matches the 15-minute access-token lifetime; the browser-readable `scorematrix-refresh-session` cookie is only a non-secret remember-me marker. Generic 401, token-expired, and missing-token payloads receive one refresh/retry attempt, allowing legacy refresh cookies to migrate to HttpOnly on their next rotation. If refresh fails, it clears client auth state, asks the auth BFF to clear the HttpOnly refresh cookie, and dispatches a client session-expired event. Non-JSON error responses are converted into structured `invalid_backend_response` failures with a truncated response-body detail; successful non-JSON responses still throw as invalid backend responses.
- `src/lib/auth-session-server.ts`: server-only auth BFF helpers for scorm backend requests, same-origin mutation checks, token extraction/redaction, and rotating `scorematrix-auth-token` plus `scorematrix-refresh-token` HttpOnly/Secure/SameSite=Strict cookie management. Access cookies are capped at 15 minutes and refresh cookies at one hour.
- `src/lib/auth-guard.ts`: shared auth route guard. Protected routes include credits, leaderboard, missions, events, rewards, stats, affiliate, leagues, profile, wallet, settings, and notifications.
- `src/lib/auth-api.ts`: typed wrappers for auth/member endpoints from the Backend reference. `GET/PATCH /users/me` responses are normalized from production snake_case stats/preferences into the camelCase fields used by the UI; missing member entitlements become `{}` and returned entitlements are sanitized against the credit entitlement table.
- `src/lib/credit-entitlements.ts`: source of truth for credit package rights. It defines the allowed entitlement keys/values and feature rows for the 50/100/200/500/1000 THB packages so member rights cannot exceed the package comparison table.
- `src/lib/checkins-api.ts`: typed wrapper for `GET /checkins/rewards` and `POST /checkins`; the homepage `DailyCheckIn` loads the daily reward schedule from the backend, tolerates camelCase or snake_case check-in reward payloads, submits check-ins before updating local streak/points, and shows backend error messages through toast and inline copy.
- `src/lib/achievements-api.ts`: typed wrapper for `GET /achievements`; the `/missions` achievements tab maps unlocked and locked Backend achievements into the existing mission dashboard card grid.
- `src/lib/credits-api.ts`: typed wrapper for `GET /credits/packages`; the `/credits` page uses it to load purchasable credit packages and first-purchase bonus data from the scorm Backend. Frontend package styling/features are matched by package price against the entitlement table rather than by API ordering.
- `src/lib/checkout-api.ts`: typed wrapper for credit checkout. The `/credits` page creates real backend purchases through same-origin `POST /api/data/credits/purchase`, sends `paymentMethod: "credit_card"` for the Stripe-only checkout flow plus locale-aware Stripe return URLs (`/{locale}/payment/success` and `/{locale}/payment/cancel`), and redirects to the backend-provided Stripe/payment URL. Payment return routes use `src/lib/payment-return-bridge.ts` to serve a no-store same-site HTML bridge before navigating to `/credits?checkout=...`; this avoids login redirects caused by `SameSite=Strict` auth cookies during cross-site payment-provider redirect chains. The target URL uses `src/lib/public-origin.ts` to prefer forwarded public host/protocol and avoid leaking internal localhost origins. Credits remain server-authoritative and are applied asynchronously by the Stripe webhook (`POST /webhooks/stripe`).
- `src/lib/credit-purchases-api.ts`: typed wrapper for `GET /credits/purchases`; the `/wallet/credit-history` page lists credit purchase history with status filters, totals, payment method labels, and pagination.
- `src/lib/events-api.ts`: typed wrapper for `GET /events`; the `/events` page maps Backend event fields into the existing event card grid, sorts active events first, surfaces `isRegistered` state in cards, and `/events/[eventId]` now renders a redesigned backend-backed detail view with server-fetched title/description/timing/fees plus a client registration panel that honors `isRegistered`, points, and credits.
- `src/lib/leaderboard-api.ts`: typed wrapper for authenticated `GET /leaderboard?period=daily|weekly|season`; the UI keeps the local `seasonal` tab key but sends backend period `season`. The normalizer supports both per-period responses and combined payloads keyed by `daily`, `weekly`, `seasonal`, or `season`, including period-specific rewards. The `/leaderboard` page reloads ranking data when its period tab changes, while the homepage leaderboard preview and desktop sidebar card load weekly rankings, with no mock fallback.
- `src/lib/missions-api.ts`: typed wrapper for `GET /missions` and `POST /missions/:id/claim`; the `/missions` page maps `daily`, `weekly`, and `special` Backend missions into the existing mission card UI and supports interactive reward claims with Zustand sync.
- `src/lib/levels-api.ts`: typed wrapper for `GET /levels`; the `/profile` page renders a prominent member level roadmap from backend level config, highlighting current/next level XP progress, reward points, rank, max owned leagues, and max league members.
- `src/lib/leagues-api.ts`: typed wrappers for `GET /leagues`, `GET /leagues/:id`, `POST /leagues`, `POST /leagues/:id/join`, `POST /leagues/:id/leave`, `POST /leagues/:id/kick/:uid`, `GET /leagues/:id/requests`, and join-request approve/reject actions; free league joins are surfaced as pending owner approval, paid joins remain immediate, leave/kick actions show the 7-day league cooldown, entry-fee aliases are normalized, full leagues cannot be joined, league lists avoid exposing backend user IDs, detail standings normalize member display name, username, avatar, level, joined date, prediction count, wins, points, and accuracy when the backend provides them, detail history normalizes `history[]` entries for owner-only UI, `totalFeesReceived` is normalized from league list/detail aliases for owner-only UI, and private invite codes render only when the detail response confirms the viewer is the owner.
- `src/lib/referrals-api.ts`: typed wrapper for affiliate referral data. The `/affiliate` page uses scorm `GET /referrals/code` plus `GET /referrals` for code, clicks, signup totals, earnings, referral rows, and reward tiers; it no longer probes the obsolete singular `GET /referral` endpoint. Invite links are normalized client-side to the current origin and locale register route `/{locale}/auth/register?ref=...`; the register page posts referral-link visits to same-origin `/api/referral-clicks`.
- `src/lib/rewards-api.ts`: typed wrapper for `GET /rewards`, `GET /rewards/{id}`, and `POST /rewards/:id/redeem`; the `/rewards` page maps Backend reward catalogue items into the existing tabs/card grid UI, `/rewards/[rewardId]` loads the selected reward detail from the backend and handles point spending, and the homepage tabbed widget loads active reward highlights from the same catalogue endpoint.
- `src/lib/stats-api.ts`: typed wrapper for `GET /stats/accuracy`; the `/stats` dashboard maps Backend `overall`, `trend`, and `leagueBreakdown` data into the existing summary cards and charts.
- `src/lib/soccer-api.ts`: typed client wrapper for local `/api/football/teams`, which proxies soccer backend `GET /teams`; the local route returns normalized `teams` groups for favorite-team selection while preserving the backend `data` payload.
- `src/components/auth/FavoriteTeamSelect.tsx`: grouped team selector for registration, grouped by league and showing league/team logos.
- `src/components/ui/Avatar.tsx`: shared member avatar primitive. Pass `level` when rendering real users so the esports frame and compact `L1`-`L10` badge appear consistently; levels above 10 clamp to the level 10 frame.
- `src/app/[locale]/(public)/auth/register/page.tsx`: server wrapper for the register route; emits localized SEO metadata, canonical/hreflang alternates, visible FAQ content, FAQ/Breadcrumb/RegisterAction JSON-LD, and renders `RegisterClient`. `RegisterClient` submits through same-origin `POST /api/auth/register`; the BFF stores access and refresh tokens as HttpOnly cookies, strips tokens from browser-visible JSON, and the client loads favorite teams from `GET /teams`.
- `src/app/[locale]/(public)/auth/login/page.tsx`: server wrapper for the login route; emits localized SEO metadata, canonical/hreflang alternates, visible FAQ content, FAQ/Breadcrumb/LoginAction JSON-LD, and renders `LoginClient`. `LoginClient` submits through same-origin `POST /api/auth/login`; the BFF stores access and refresh tokens as HttpOnly cookies, strips tokens from browser-visible JSON, then the client updates `useUserStore` and redirects to locale home or `next` target.
- `src/app/api/auth/session/route.ts`: no-store same-origin session probe used by the header to discover HttpOnly-cookie sessions without making the locale layout dynamic.
- `src/app/api/profile/avatar/route.ts`: authenticated same-origin profile-avatar upload fallback; stores local files under `public/uploads/profile-avatars`, accepts `previousAvatarUrl`, and removes the previous local avatar file after a successful replacement so each account keeps a single active uploaded image.
- `src/components/layout/UserMenu.tsx`: profile dropdown logout calls same-origin `POST /api/auth/logout`, which forwards backend logout and clears the HttpOnly refresh session; the client then clears its access token/user store and redirects to locale login.
- `src/components/shared/StoreInitializer.tsx`: listens for session-expired events from `api-client`, clears the user store, shows a localized toast, and immediately redirects to locale login with `next` set to the current URL.
- `src/components/layout/Header.tsx`: uses the server-provided auth cookie hint plus `useUserStore.isLoggedIn` for first-paint navbar state; when logged in, syncs navbar points, credits, rank, XP, and level from normalized `GET /users/me` stats into `useUserStore`; `UserMenu` shows rank and XP progress in the account dropdown.
- Mobile hamburger navigation in `src/components/layout/Header.tsx` uses the full app menu set with icons, locked member routes linking to login, and a scrollable dropdown so every route remains reachable on small screens. The fixed `MobileBottomNav` remains a short primary-action bar.
- `src/app/[locale]/(member)/profile/page.tsx`: profile dashboard UI loads current profile data through `getCurrentUser()` (`GET /api/data/users/me`, proxied to the scorm data backend), syncs known fields into `useUserStore`, and falls back to the last store values on load failure.
- `src/app/[locale]/(member)/profile/edit/page.tsx`: loads `GET /member/profile`, validates editable Backend fields, and submits `POST /member/update-profile`.
- `src/app/[locale]/(public)/auth/forgot-password/page.tsx`: validates email and submits `POST /auth/forgot-password`; success copy follows the Backend's anti-enumeration behavior.
- `src/proxy.ts`: redirects unauthenticated access to protected member routes to `/{locale}/auth/login?next=...` only when both access and refresh token cookies are missing.
- `src/components/layout/Header.tsx`, `Sidebar.tsx`, and `Footer.tsx` expose a localized public "contact team" link to `/{locale}/legal/contact`.
- `src/app/sitemap.ts` includes only public indexable locale routes plus public login/register pages and news articles; protected member routes are intentionally omitted because unauthenticated users are redirected to login.
- `src/app/robots.ts` disallows forgot-password, protected member areas including credits, Backend routes, and protected predict detail URLs while allowing public pages such as home, login, register, contact, livescore, matches, predict index, AI insight index, football league pages, legal pages, news, and World Cup pages.

## News

- `src/lib/articles-api.ts`
  - Loads public articles from the scorm backend `GET /articles`, `GET /articles?type=news`, `GET /articles?type=analysis`, paginated `GET /articles?page=&limit=`, and detail `GET /articles/{slug}`.
  - Normalizes Thai Backend payloads into `NewsArticle`, including `content`, `keywords`, `view_count`, `updated_at`, backend images, and `news`/`analysis` categories.
  - For non-Thai locale routes, translates Thai title, summary, and content server-side with a cached translation request and falls back to the Thai source text if translation is unavailable.
- `src/app/[locale]/news/page.tsx` uses `src/lib/articles-api.ts` for backend-backed list data, supports `type=news|analysis`, emits localized metadata, canonical/hreflang alternates, and CollectionPage/ItemList JSON-LD.
- `src/app/[locale]/news/[slug]/page.tsx` uses `GET /articles/{slug}` for detail rendering, so the backend can increment `view_count`; it emits article-specific metadata, keywords, robots directives, Open Graph/Twitter tags, NewsArticle/AnalysisNewsArticle JSON-LD, and breadcrumb JSON-LD.
- Header and desktop sidebar expose the localized public `news` navigation item as "News / Analysis" style copy.
- `src/lib/news-generator.ts`
  - Page size: `NEWS_PAGE_SIZE = 9`
  - Reads generated JSON articles from `src/data/news`
  - Exports `getTodayArticles`, `getArticleBySlug`, `searchArticles`, `getAllArticles`, `getPaginatedArticles`, `getLatestArticles`, `getAllNewsStaticParams`, `regenerateTodayNews`
- `src/components/news/NewsListClient.tsx` and `NewsDetailClient.tsx` handle news client UI; the list exposes URL-backed `news`/`analysis` filters and detail shows backend view counts when present.

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
3. Keep pages dynamically rendered; project-wide caching and static route generation are disabled.
4. Use `getTranslations` server-side or `useTranslations` in client components
5. Update navigation in `Header`, `Sidebar`, and `MobileBottomNav` if the page should be reachable

Add visible copy:

1. Prefer message keys in `src/messages/*.json`
2. For large page-specific copy, check `src/data/*-page-content.ts`
3. Keep all six locales in sync

Add football backend usage:

1. Reuse `src/lib/api-football.ts`
2. Keep fetch/cache behavior explicit
3. Do not import server-only fetch logic into client components
4. Prefer a route handler or Server Component data load when client interactivity is not required

Validate:

1. `npm run lint`
2. `npm run build` for route/config/rendering changes
3. Browser check for UI changes if a dev server is running or can be started

## Known Caveats

- Local Next.js bundled docs are available under `node_modules/next/dist/docs/`; read the relevant guide before changing App Router, metadata, route handlers, proxy, caching, or config.
- `README.md` is still mostly the create-next-app default.
- `package.json` name is `deepseek-app`, while the product is ScoreMatrix.
- `src/app/globals.css` appears unused; active styles come from `src/styles/globals.css`.
- Some hardcoded English UI text exists inside client components, especially notifications and layout widgets.
- `src/types/common.ts` has a `Locale` union that does not match the active `next-intl` locales.

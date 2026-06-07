# ScoreMatrix System Architecture Index

Source: `/Users/mckazine/Desktop/SCOREMATRIX_SYSTEM_ARCHITECTURE.html`

Last read: 2026-05-24

## Scope

This is the newer ScoreMatrix system architecture and API documentation, version 1.0, May 2026.

- Data API base URL is configured by `API_DATA_BASE_URL` and normalized to exactly one trailing `/scorm`.
- Football API base URL is configured by `API_FOOTBALL_BASE_URL` and normalized to exactly one trailing `/soccer`.
- Backend: Node.js 22, Express 5 or Fastify, PostgreSQL 16, Redis 7, Meilisearch
- Frontend target: Next.js 16, React 19, Zustand, Tailwind CSS v4, `next-intl`
- API style: REST JSON, bearer JWT for authenticated user/admin endpoints
- Error shape in this document:

```ts
type ApiError = {
  error: {
    code: string;
    message: string;
  };
};
```

Important: this newer architecture differs from the older `API_REFERENCE_INDEX.md` member API. Prefer this file for new feature work unless the task explicitly targets the legacy member/auth API.

## Architecture Summary

ScoreMatrix is documented as a separated frontend/backend architecture:

- Browser frontend calls data endpoints through the Next.js BFF under `/api/data/*`.
- Next.js API routes proxy football data under `/api/football/*`.
- Backend service stack includes REST route handlers, service layer, repository/DB access, Redis for sessions/rate limits/leaderboard cache, and Meilisearch for search.
- Football data is proxied from external football APIs, including `api.scorematrix.live` and API-Football.
- S3-compatible storage, such as MinIO or R2, is intended for avatars, reward images, and badges.

## Currency System

The product has two non-withdrawable currencies:

- `freePoints`: earned from predictions, missions, check-ins, achievements, and referrals; used for reward redemption.
- `premiumCredits`: purchased with real money; used for premium features, event entry, and exclusive rewards.

Both are server-authoritative in the target architecture. Do not rely on localStorage as the source of truth for balances.

## Database Map

Core user tables:

- `users`: identity, login email, display profile, avatar, favorite team, role, birth year, country, locale, audit/login metadata, marketing consent, terms acceptance.
- `user_stats`: balances, XP, level, rank, streaks, prediction totals, accuracy, completed missions, achievements, inventory items, referral counts/earnings.
- `user_preferences`: public profile and notification toggles.
- `refresh_tokens`: hashed refresh tokens, device/IP metadata, expiry, revocation.

Game and economy tables:

- `matches`, `predictions`, `points_transactions`
- `checkins`, `referrals`, `notifications`, `credit_purchases`
- `event_registrations`, `redemptions`, `user_missions`, `user_achievements`

Reference/config tables:

- `teams`, `leagues`, `players`
- `credit_packages`, `missions`, `achievements`, `rewards`
- `special_events`, `leaderboard_rewards`

Important relationship rules:

- `users` has many predictions, check-ins, transactions, redemptions, user missions, achievements, referrals, notifications, and event registrations.
- `predictions` belongs to a user and match.
- `points_transactions` is the audit trail for free/premium currency changes.
- `redemptions` belongs to user and reward.
- `user_missions` joins users to missions.
- `user_achievements` joins users to achievements.

## Auth And Session Model

Auth endpoints:

- `POST /auth/register`: create account and return user plus tokens.
- `POST /auth/login`: login by email or username; returns user, access token, refresh token, `expiresIn: 900`.
- `POST /auth/refresh`: rotates refresh token and returns a new access/refresh pair.
- `POST /auth/logout`: bearer auth; revokes current refresh token.
- `POST /auth/forgot-password`: always returns success; sends email with 6-digit OTP plus reset link, valid 15 minutes.
- `POST /auth/reset-password`: reset by token or OTP.

Target token handling:

- Access token: JWT, 15 minutes, stored in memory/Zustand, not localStorage.
- Refresh token: opaque token, 7 days, stored as SHA-256 hash server-side and in an httpOnly, Secure, SameSite=Strict cookie client-side.
- On `401`, frontend should call `/auth/refresh`; if refresh fails, clear state and redirect to login.
- JWT algorithm: RS256, payload includes `sub`, `role`, `iat`, `exp`, and `jti`.

Registration fields:

- `username`: 3-20 chars, alphanumeric plus underscore
- `email`: valid email
- `password`: min 8 chars, uppercase plus number
- `displayName`: 1-50 chars
- `locale`: `th | en | lo | my | km | zh`, default `th`
- Optional: `birthYear`, `country`, `favoriteTeamId`, `referralCode`
- `acceptedTerms`: required `true`

Login response user includes `id`, `username`, `email`, `displayName`, `role`, `avatarUrl`, `stats`, and `preferences`.

## User/Profile Endpoints

`GET /users/me` is the target profile hydration endpoint.

Observed production response shape:

```ts
type GetCurrentUserResponse = {
  success: true;
  code: "M001" | string;
  message: string;
  data: CurrentUser;
};
```

`data` includes:

- Root fields: `id`, `username`, `email`, `displayName`, `avatarUrl`, `bio`, `role`, `favoriteTeamId`, `birthYear`, `country`, `locale`, `createdAt`
- `stats`: `freePoints`, `premiumCredits`, `xp`, `level`, `rank`, `streak`, `bestStreak`, `totalPredictions`, `correctPredictions`, `accuracy`, `missionsCompleted`, `achievementsUnlocked`, `streakShields`, `predictionBoosts`, `referralCount`, `qualifiedReferrals`, `totalReferralEarnings`
- `preferences`: `publicProfile`, `pushNotifications`, `matchReminder1hr`, `matchReminder30min`, `resultNotification`, `rankChangeAlert`

Profile update:

- `PATCH /users/me`
- Optional fields: `displayName`, `bio`, `favoriteTeamId`, `locale`, `avatarUrl`

Preference update:

- `PATCH /users/me/preferences`
- Optional booleans: `publicProfile`, `pushNotifications`, `matchReminder1hr`, `matchReminder30min`, `resultNotification`, `rankChangeAlert`

## Match And Prediction Endpoints

Matches:

- `GET /matches`
  - Query: `date` `YYYY-MM-DD`, `status` `upcoming|live|finished`, `leagueId`, `page`, `limit` max 50
  - Response: paginated matches with teams, league, scores, status, kickoff, venue, and optional `userPrediction`
- `GET /matches/live`
  - Returns live matches without pagination, includes current `minute` and recent `events`.
- `GET /matches/:id`
  - Detail response includes teams, league, scores, status, kickoff, round, venue, referee, events, lineups, statistics, last five head-to-head, and optional `userPrediction`.

Predictions:

- `POST /predictions`
  - Request: `matchId`, `predictedHomeScore`, `predictedAwayScore`
  - Optional: `firstScorerPlayerId`, `totalGoals`, `halfTimeHome`, `halfTimeAway`, `confidenceLevel: safe|confident|bold`, `useBoost`
  - Validation: match must exist, status must be `upcoming`, kickoff must be future, one prediction per user per match.
  - `201` returns prediction and `boostApplied`.
- `GET /predictions`
  - Query: `status: pending|correct|incorrect|partial`, `page`, `limit`
  - Paginated prediction history with match summary and points.
- `GET /predictions/:id`
  - Detail with scoring breakdown and match data.

Prediction error codes include `DUPLICATE_PREDICTION` and `MATCH_LOCKED`.

## Points And Check-ins

- `GET /points/transactions`
  - Query: `currencyType: free|premium`, `source: prediction|mission|checkin|referral|purchase|redemption`, `page`, `limit`
- `POST /checkins`
  - Awards 5-10 points, returns `amount`, `dayOfStreak`, `currentStreak`, and optional `bonus: streakShield`.
  - `409 ALREADY_CHECKED_IN` if already claimed today.
- `GET /checkins/history`
  - Query: `month: YYYY-MM`
  - Returns current/best streak, monthly check-in records, total check-ins, and total points earned.

## Leaderboard And Events

Leaderboard:

- `GET /leaderboard`
  - Query: `period: daily|weekly|seasonal`, `tier: all|bronze-silver|gold-platinum|diamond-master`, `limit` max 100
  - Returns period bounds, entries, current `userEntry`, and configured rewards.
- `GET /leaderboard/rewards`
  - Returns daily, weekly, and seasonal rank reward tables.
- `POST /leaderboard/rewards/claim`
  - Body: `period: daily|weekly|seasonal`
  - Only past periods allowed; active periods return `PERIOD_NOT_ENDED`.

Events:

- `GET /events`
  - Query: `status: upcoming|active|ended`
- `GET /events/:id`
  - Returns event details, entry fees, prize pool, rules, status, registration state, and optional user rank.
- `POST /events/:id/register`
  - Deducts event entry fee in premium credits and creates `event_registrations`.
  - `402 INSUFFICIENT_CREDITS` if balance is insufficient.
- `GET /events/:id/leaderboard`
  - Paginated event leaderboard with `userEntry`.

## Rewards And Redemptions

- `GET /rewards`
  - Query: `category: merch|digital|cosmetic|voucher`, `page`, `limit`
  - Returns paginated active rewards with costs, stock, image, limited flag, and `canAfford`.
- `GET /rewards/:id`
  - Returns reward detail, stock, `requiresShipping`, user balance, `canAfford`, and redemption count.
- `POST /rewards/:id/redeem`
  - Body includes `shippingAddress` only when shipping is required.
  - Creates redemption, deducts points/credits, creates points transaction, returns `newBalance`.
  - Errors: `INSUFFICIENT_POINTS`, `INSUFFICIENT_CREDITS`, `OUT_OF_STOCK`.
- `GET /redemptions`
  - Query: `status: pending|approved|shipped|delivered|cancelled`, `page`, `limit`
  - Returns redemption history with reward summary and shipping/tracking data.

## Missions And Achievements

- `GET /missions`
  - Returns `daily`, `weekly`, and `special` mission arrays.
  - Mission fields include title, requirement, reward points/XP/credits, icon, expiry, and `userProgress`.
- `POST /missions/:id/claim`
  - Returns claimed status, rewards, and new balance.
  - `422 MISSION_NOT_COMPLETED` if not completed.
- `GET /achievements`
  - Returns `unlocked`, `locked`, `hidden`, `totalUnlocked`, and `totalAvailable`.
  - Locked achievements include progress current/required.

## Notifications

- `GET /notifications`
  - Query: `read: true|false`, `page`, `limit`
  - Returns paginated notifications and `unreadCount`.
- `PATCH /notifications/:id/read`
  - Marks one notification read.
- `PATCH /notifications/read-all`
  - Marks all notifications read and returns `markedRead`.

## Referrals

- `GET /referrals`
  - Returns `referralCode`, totals, referrals, `shareUrl`, and reward tiers.
- `GET /referrals/code`
  - Returns referral code, share URL, and QR code URL.
- `POST /referrals/apply`
  - Body: `referralCode`
  - Awards 50 free points each to referrer and referred user.
  - Can only apply once, cannot self-refer, cannot apply after registering with a referral code.

## Credits And Payments

- `GET /credits/packages`
  - Returns credit packages and first purchase bonus.
- `POST /credits/purchase`
  - Body: `packageId`, `paymentMethod: promptpay|credit_card|truemoney|rabbit_linepay`, optional `couponCode`
  - Returns pending purchase and payment QR/expiry.
  - Credits are applied asynchronously by payment webhook.
- `GET /credits/purchases`
  - Query: `status: pending|completed|failed|refunded`, `page`, `limit`
  - Returns purchase history and `totalSpentThb`.
- `POST /webhooks/payment`
  - HMAC-SHA256 via `X-Signature`.
  - Body includes gateway `transactionId`, `purchaseId`, `status: success|failed|expired`, amount, currency, paidAt.
  - Idempotent by `transactionId`.

## Stats

- `GET /stats/accuracy`
  - Returns overall totals, breakdown by result type, breakdown by confidence, last 30 day trend, and league breakdown.
- `GET /stats/form`
  - Returns last 5/10 results, current/best streak, points last 7 days, points by source, all-time points, weekly/monthly prediction counts.

## Private Leagues

- `GET /leagues`
  - Returns joined and available private leagues.
- `POST /leagues`
  - Body: `name`, optional `description`, `maxMembers`, `entryFeeCredits`, `isPrivate`.
  - Returns created league and `inviteCode`.
- `GET /leagues/:id`
  - Returns owner, standings, recent activity, rank, invite code, and league settings.
- `POST /leagues/:id/join`
  - Body: optional `inviteCode` for private leagues.
  - Errors: `FULL`, `WRONG_CODE`, `INSUFFICIENT_CREDITS`.

## Admin Endpoints

All admin endpoints require `role = admin` in JWT. Admin rate limit: 300 requests/min.

- `GET /admin/users`
  - Query: `q`, `role`, `sortBy: created_at|points|predictions`, `order`, `page`, `limit`
  - Returns users with stats and account flags.
- `PATCH /admin/users/:id`
  - Optional: `role`, `freePoints`, `premiumCredits`, `unlockAccount`, `banUser`, `adminNote`.
  - Setting balances is absolute, not delta.
- `GET /admin/redemptions`
  - Query by status and pagination; returns pending count.
- `PATCH /admin/redemptions/:id`
  - Body: `status`, optional `trackingNumber`, `note`.
  - Cancelling refunds points/credits; shipped triggers push notification.
- `GET /admin/fraud`
  - Query: `severity: low|medium|high`, `status: flagged|investigating|cleared|confirmed`, `page`, `limit`
  - Returns fraud evidence, anomaly score, related accounts, rapid prediction flags.

## Error Codes

Common errors:

- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED`
- `401 TOKEN_EXPIRED`
- `403 FORBIDDEN`
- `404 NOT_FOUND`
- `409 USERNAME_TAKEN`
- `409 EMAIL_TAKEN`
- `409 ALREADY_CHECKED_IN`
- `409 DUPLICATE_PREDICTION`
- `409 MATCH_LOCKED`
- `402 INSUFFICIENT_POINTS`
- `402 INSUFFICIENT_CREDITS`
- `402 OUT_OF_STOCK`
- `422 MISSION_NOT_COMPLETED`
- `422 ALREADY_CLAIMED`
- `429 RATE_LIMITED`
- `429 ACCOUNT_LOCKED`
- `500 INTERNAL_ERROR`

## Security And Validation

Rate limits:

- `/auth/login`: 5 attempts per IP plus 5 per account per 15 min
- `/auth/register`: 3 registrations per IP per hour
- `POST /predictions`: 30 per user per hour
- `POST /checkins`: 1 per user per day
- `POST /credits/purchase`: 5 per user per hour
- Other endpoints: 100 per user per minute
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

Input and transport:

- Zod validation for body/query/params before route handlers.
- Shared contracts are recommended, e.g. `packages/contracts/`.
- Trim and sanitize strings; enforce numeric bounds.
- UUID validation for ID params.
- Parameterized SQL through Kysely or Drizzle.
- HTTPS/HSTS, strict CORS allowlist for `scorematrix.live` and `*.scorematrix.live`.
- CSRF protection via double-submit cookie for state-changing operations.
- Passwords bcrypt cost 12.
- State-changing operations should be audit logged.
- PostgreSQL RLS: users only read/write their own data.

## Frontend Migration Guide

Target replacements for current mock/local flows:

- User data: hydrate `useUserStore` from `GET /users/me`.
- Points/credits: server-authoritative with `points_transactions`; do not trust localStorage.
- Predictions: `POST /predictions` and `GET /predictions`; server calculates points.
- Check-ins: `POST /checkins`; server validates 1/day.
- Leaderboard: `GET /leaderboard`; backend materialized view refreshed hourly.
- Notifications: `GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`.
- Rewards: `GET /rewards`, `POST /rewards/:id/redeem`.
- Events: `GET /events`, `POST /events/:id/register`.
- Referrals: `GET /referrals`, `GET /referrals/code`, `POST /referrals/apply`.
- Stats: `GET /stats/accuracy`, `GET /stats/form`.
- Auth: JWT plus refresh token rotation, replacing mock or legacy auth flows.

## Current Repo Integration Notes

- Current `src/lib/api-client.ts` still primarily models the older success envelope for many wrappers. Some new architecture endpoints may return raw root objects, but production `GET /users/me` currently returns `{ success, code, message, data }`.
- Existing `getCurrentUser()` in `src/lib/auth-api.ts` uses `apiGetRaw("/users/me")` so the profile page can unwrap either raw user data or the observed success envelope.
- Existing legacy member endpoints in `API_REFERENCE_INDEX.md`, such as `/member/profile` and `/member/update-profile`, are separate from this newer `/users/me` architecture.
- For new resource work, add typed wrappers that match this document and avoid forcing the old `ApiSuccess` shape unless backend confirms it still wraps responses.
- For state changes, update Zustand optimistically only where the doc says immediate/optimistic behavior is expected, and always reconcile with server response/new balances.

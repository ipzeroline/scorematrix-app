# ScoreMatrix Frontend API Index

Latest source: `/Users/mckazine/Desktop/SCOREMATRIX_API_LATEST.html`

Legacy source: `/Users/mckazine/Desktop/scorematrix-frontend-api-reference.html`

Last read: 2026-05-24

## Scope

This API reference covers the production ScoreMatrix SCORM API used by the frontend.

- Base URL: `https://api.scorematrix.live/api/v1/scorm`
- `src/lib/api-client.ts` appends `/scorm` to `NEXT_PUBLIC_SCOREMATRIX_API_BASE_URL` when the env value is still `https://api.scorematrix.live/api/v1`.
- All responses include a stable `code` field.
- Frontend should map `code` values to localized UI messages instead of parsing backend Thai text.
- Authenticated endpoints use:

```http
Authorization: Bearer {access_token}
```

## Response Shape

Success:

```ts
type ApiSuccess<T = unknown> = {
  success: true;
  code: string;
  message: string;
  data?: T;
};
```

Error:

```ts
type ApiError = {
  success: false;
  code?: string;
  message: string;
  errors?: Record<string, string[]>;
  error_fields?: string[];
  duplicate_fields?: string[];
  details?: Record<string, unknown>;
  error_code?: string;
};
```

Some newer business endpoints return errors as:

```ts
type ApiErrorEnvelope = {
  error: {
    code: string;
    message: string;
  };
};
```

Common HTTP status codes:

- `200`: success
- `201`: created, e.g. prediction created
- `401`: expired token or wrong credentials
- `403`: disabled account
- `404`: not found
- `409`: duplicate or conflict
- `422`: validation or business error

## Public Auth Endpoints

### `POST /auth/register`

Primary production registration endpoint for `scorematrix-app`.

Required request fields:

- `username`: string, 3-20 chars, unique in `members.user_name`
- `email`: valid email, max 100 chars, unique in `members.email`
- `password`: string, min 8 chars, must include at least one uppercase letter and one number

Optional request fields:

- `confirmPassword`: must match `password`
- `displayName`: max 100 chars, defaults to `username`
- `phone`: max 20 chars, defaults to `username`
- `birthYear`: integer, 1900-current year
- `country`: max 50 chars
- `favoriteTeam` or `favoriteTeamId`: team ID, max 100 chars
- `playerType`: `casual`, `analyst`, or `competitive`
- `language` or `locale`: `th`, `en`, `lo`, `my`, `km`, `zh`
- `referralCode`: max 10 chars
- `acceptTerms` or `acceptedTerms`: truthy if sent
- `acceptTeam`: boolean
- `marketingConsent`: boolean

Success response:

```ts
type RegisterData = {
  user: {
    id: string;
    username: string;
    email: string;
    displayName: string;
    createdAt: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
};
```

Notes:

- `A001`: registration success
- `A002`: invalid registration data
- `duplicate_fields` can include `username` and/or `email`
- `birthYear` is sent as a Gregorian year and stored as a backend `birth_day`.

### `POST /auth/login`

Login with email or username and password.

Required:

- `identifier`: email or username
- `password`

Optional:

- `rememberMe`: currently reserved, does not affect token expiry

Success response data:

```ts
type LoginData = {
  user: {
    id: string;
    username: string;
    email: string | null;
    displayName: string;
    avatarUrl: string | null;
    role: "user" | string;
    favoriteTeamId: string | null;
    birthYear: number | null;
    country: string | null;
    locale: string;
    stats: CurrentUserStats;
    preferences: CurrentUserPreferences;
    createdAt: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
};
```

Codes:

- `A010`: login success
- `A011`: wrong credentials
- `A012`: account disabled
- `A013`: missing login fields

### `POST /auth/forgot-password`

Requests password reset email.

Required:

- `email`: valid email, max 100 chars

Security behavior:

- Always returns success to prevent email enumeration.
- Token is cached in Redis as `password_reset:{email}` for 60 minutes.
- Reset link format: `https://scorematrix.live/th/auth/reset-password?token={raw_token}&email={urlencoded_email}`

Success code:

- `A030`

### `POST /auth/reset-password`

Resets password using a reset token.

Required:

- `token`
- `password`: min 8 chars

Codes:

- `A031`: reset success
- `A032`: invalid or expired reset link
- `A033`: reset link expired

## Authenticated Endpoints

### `POST /auth/logout`

Requires bearer token. Revokes the user's refresh tokens; the JWT access token remains valid until expiry.

Success code:

- `A022`

### `GET /users/me`

Requires bearer token. Production response is a raw user object, not wrapped in `{ success, data }`.

Important fields:

- `id`, `username`, `email`, `displayName`, `avatarUrl`, `bio`, `role`
- `favoriteTeamId`, `birthYear`, `country`, `locale`, `createdAt`
- `stats`: snake_case keys such as `free_points`, `premium_credits`, `total_predictions`, `correct_predictions`, `missions_completed`, `achievements_unlocked`
- `preferences`: snake_case keys such as `public_profile`, `push_notifications`, `match_reminder_1hr`, `match_reminder_30min`, `result_notification`, `rank_change_alert`

Frontend note:

- `src/lib/auth-api.ts` normalizes production snake_case stats/preferences into camelCase aliases used by existing UI code.

### `PATCH /users/me`

Requires bearer token. Light profile update.

Optional request fields:

- `displayName`: 1-50 chars
- `bio`: max 200 chars
- `favoriteTeamId`: max 50 chars
- `locale`: `th`, `en`, `lo`, `my`, `km`, `zh`
- `avatarUrl`: max 500 chars

Response:

- Same raw shape as `GET /users/me`.

### `PATCH /users/me/preferences`

Requires bearer token. Optional boolean request fields:

- `publicProfile`
- `pushNotifications`
- `matchReminder1hr`
- `matchReminder30min`
- `resultNotification`
- `rankChangeAlert`

Production response uses snake_case preference keys with `0`/`1` values.

### `GET /member/profile`

Requires bearer token. Returns member profile, wallet/balance fields, promotion flags, deposit/withdraw capabilities, system flags, referral/downline info, and app-specific profile fields.

Important app fields in `data.profile`:

- `user_name`
- `name`
- `email`
- `tel`
- `phone`
- `favorite_team`
- `country`
- `language`
- `player_type`
- `marketing_consent`
- `balance`
- `point_deposit`
- `diamond`
- `balance_free`
- `credit`
- `downline`
- `bank_code`
- `bank_name`
- `bank_image`
- `bank_image_url`

Doc note: app fields such as `favorite_team`, `email`, `country`, and `language` may be `null` for older members.

Success code:

- `M001`

Failure code:

- `M002`

### `POST /member/update-profile`

Requires bearer token. Partial profile update; send only fields being changed.

Optional request fields:

- `displayName`: max 100 chars, split into firstname/lastname
- `phone`: max 20 chars, updates `tel`
- `country`: max 50 chars
- `favoriteTeam`: max 100 chars
- `language`: max 10 chars
- `birthYear`: 1900-current year
- `playerType`: shown in example, maps to `player_type`
- `marketingConsent`: shown in example, maps to `marketing_consent`

Success response includes:

- `member_code`
- `name`
- `email`
- `tel`
- `country`
- `favorite_team`
- `language`
- `player_type`
- `marketing_consent`
- `birth_day`

Codes:

- `M003`: profile updated
- `M004`: profile update failed

### `POST /member/favorite-team`

Requires bearer token. Lightweight endpoint for updating only favorite team.

Optional:

- `favorite_team`: string or `null`, team ID or clear favorite team

Success response includes:

- `member_code`
- `favorite_team`

Success code:

- `M007`

### `POST /member/change-password`

Requires bearer token.

Required:

- `password`: new password, min 8 chars
- `password_confirmation`

Success response includes:

- `member_code`

Success code:

- `A034`

## Product Endpoints

These production endpoints are documented in `/Users/mckazine/Desktop/SCOREMATRIX_API_LATEST.html` but are not all wired into the UI yet.

- `POST /checkins`: daily check-in, no body. Duplicate check-in returns `409` with `{ error: { code: "ALREADY_CHECKED_IN", message } }`.
- `GET /checkins/history`: optional `month=YYYY-MM`.
- `GET /rewards`: optional `category`, `page`, `limit`; response `{ data, pagination }`.
- `GET /rewards/{id}`: reward detail with `userBalance` and `canAfford`.
- `GET /redemptions`: optional `status`, `page`.
- `GET /missions`: response groups `daily`, `weekly`, `special`.
- `GET /achievements`: response groups `unlocked`, `locked`, `hidden`.
- `GET /leaderboard`: optional `period=weekly|monthly|alltime`, `page`, `limit`; response includes `entries`, `userEntry`, `rewards`.
- `GET /events`: response `{ data }`.
- `GET /predictions`: response `{ data, pagination }`.
- `GET /notifications`: response `{ data, unreadCount, pagination }`.
- `GET /points/transactions`: response `{ data, pagination }`.
- `GET /stats/accuracy`: response includes `overall`, breakdowns, trend, and league breakdown.
- `GET /referrals`: response includes `referralCode`, totals, `shareUrl`, and `rewardTiers`.
- `GET /credits/packages`: response `{ packages, firstPurchaseBonus }`.
- `GET /leagues`: response `{ data, pagination }`.

## Response Code Groups

Authentication:

- `A001`: register success
- `A002`: register validation
- `A003`: username duplicate
- `A004`: email duplicate
- `A005`: register failed
- `A006`: bank check failed
- `A007`: banks success
- `A008`: banks failed
- `A009`: bank name success
- `A010`: login success
- `A011`: login failed
- `A012`: account disabled
- `A013`: login missing fields
- `A020`: token refreshed
- `A021`: token invalid or expired
- `A022`: logout success
- `A030`: forgot password sent
- `A031`: reset password success
- `A032`: reset invalid
- `A033`: reset expired
- `A034`: change password success

Member:

- `M001`: profile success
- `M002`: profile not found
- `M003`: profile updated
- `M004`: profile update failed
- `M005`: preferences updated
- `M006`: preferences failed
- `M007`: favorite team updated
- `M008`: wallet updated
- `M010`: balance success
- `M011`: balance failed

Other documented code groups:

- Predictions: `P001`-`P004`
- Check-in: `C001`-`C003`
- Points: `PT001`
- Leaderboard: `L001`
- Matches: `MT001`
- Events: `E001`-`E005`
- Generic: `G001`-`G006`

## Implementation Notes For This Repo

- Prefer wrapping these calls in a dedicated client/server API module instead of scattering raw `fetch` calls across components.
- Store access tokens only in a Client Component/store or server-side auth mechanism chosen by the project; do not expose tokens in Server Component props unnecessarily.
- For login/register UI, use stable `code` and field arrays (`error_fields`, `duplicate_fields`) to drive localized errors.
- The API doc lists language values `th`, `en`, `zh`, `ja`, `ko`, `vi`, while this app supports `th`, `en`, `lo`, `my`, `km`, `zh`. Treat this as an integration mismatch to verify before sending locale directly.

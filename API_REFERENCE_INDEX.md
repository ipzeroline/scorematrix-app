# ScoreMatrix Frontend API Index

Source: `/Users/mckazine/Desktop/scorematrix-frontend-api-reference.html`

Last read: 2026-05-18

## Scope

This API reference covers Auth and Member endpoints for the ScoreMatrix frontend.

- Base URL: `https://api.scorematrix.live/api/v1`
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

Common HTTP status codes:

- `200`: success
- `201`: created, e.g. prediction created
- `401`: expired token or wrong credentials
- `403`: disabled account
- `404`: not found
- `409`: duplicate or conflict
- `422`: validation or business error

## Public Auth Endpoints

### `POST /auth/register-app`

Primary registration endpoint for `scorematrix-app`.

Required request fields:

- `username`: string, 3-20 chars, unique in `members.user_name`
- `email`: valid email, max 100 chars, unique in `members.email`
- `password`: string, 8-10 chars

Optional request fields:

- `confirmPassword`: must match `password`
- `displayName`: max 100 chars, defaults to `username`
- `phone`: max 20 chars, defaults to `username`
- `birthYear`: integer, 1900-current year
- `country`: max 50 chars
- `favoriteTeam` or `favoriteTeamId`: team ID, max 100 chars
- `playerType`: `casual`, `analyst`, or `competitive`
- `language` or `locale`: max 10 chars
- `referralCode`: max 24 chars
- `acceptTerms` or `acceptedTerms`: truthy if sent
- `acceptTeam`: boolean
- `marketingConsent`: boolean

Backend mapping:

- `username` -> `user_name`, lowercase and strip tags
- `email` -> `email`, lowercase and strip tags
- `displayName` -> `name`, `firstname`, `lastname`, split by first space
- `phone` -> `tel`, `wallet_id`; if absent, uses username
- `birthYear` -> `birth_day` as `{year}-01-01`
- `playerType` -> `player_type`
- `marketingConsent` -> `marketing_consent`
- `referralCode` -> `upline_code`, looked up from `members.referral_code`

Success code:

- `A001`: registration success

Validation/server error notes:

- `A002`: invalid registration data
- `duplicate_fields` can include `username` and/or `email`
- Server failure may return `error_code: "REGISTER_UNKNOWN_FAILURE"` and `details.stage`

### `POST /auth/register`

Gambling platform registration. Use only if the product flow explicitly needs bank/wallet registration.

Required:

- `firstname`
- `lastname`
- `password`: 6-10 chars
- `user_name`: phone number digits only, unique
- `tel`: 10-digit phone starting with `0`, unique
- `wallet_id`: digits only, unique
- `bank`: integer from `GET /auth/register/banks`
- `acc_no`: 1-14 digits, unique per bank
- `refer`: member code

Optional:

- `password_confirm`
- `favorite_team`
- `referral_code`
- `marketing`
- `name`

Success code:

- `A001`

### `POST /auth/register-with-username`

Variant of gambling registration where `user_name` is 5-10 chars, contains at least one `a-z` letter, and must not be a phone number.

### `GET /auth/register/banks`

Returns bank dropdown options.

Response data:

```ts
type BankOption = {
  code: number;
  name: string;
  name_th: string;
  name_en: string;
  shortcode: string;
  image: string;
  image_url: string;
};
```

Success code:

- `A007`

Failure code:

- `A008`

### `POST /auth/register/bank-account-name`

Resolves bank account owner name before registration.

Required:

- `bank`: integer bank code
- `acc_no`: account number

Success response includes:

- `valid`
- `bank`
- `acc_no`
- `account_name`
- `firstname`
- `lastname`

Success code:

- `A009`

Failure code:

- `A006`

### `POST /auth/login`

Login with email or username and password.

Required:

- `identifier`: email or username
- `password`

Optional:

- `rememberMe`: currently reserved, does not affect token expiry

Backward compatibility:

- `user_name` can be sent instead of `identifier`.

Success response data:

```ts
type LoginData = {
  access_token: string;
  token_type: "Bearer";
  expires_at: string;
  expires_in: number;
  member: {
    code: number;
    user_name: string;
    name: string;
    email: string | null;
    favorite_team: string | null;
    confirm: string;
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

Resets password using email token.

Required:

- `email`
- `token`
- `password`: 6-10 chars

Optional:

- `password_confirm`

Codes:

- `A031`: reset success
- `A032`: invalid or expired reset link
- `A033`: reset link expired

## Authenticated Endpoints

### `POST /auth/logout`

Requires bearer token. Blacklists current token.

Success code:

- `A022`

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

Doc inconsistency:

- Endpoint section says success code `M008`.
- Code table says `M007` is Favorite Team Updated and `M008` is Wallet Updated.
- Prefer handling both `M007` and `M008` as success for favorite-team until backend is verified.

### `POST /member/change-password`

Requires bearer token.

Required:

- `password`: new password, 6-10 chars
- `password_confirmation`

Success response includes:

- `member_code`

Success code:

- `A034`

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
- `M008`: wallet updated in code table, but favorite-team endpoint example returns this
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

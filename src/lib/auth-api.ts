import {
  apiGet,
  apiGetRaw,
  apiPatchRaw,
  apiPost,
  apiPostFormRaw,
  apiPostRaw,
  clearStoredAuthToken,
  setStoredAuthTokens,
  type ApiSuccess,
  type ApiRequestOptions,
} from "@/lib/api-client";

export type RegisterAppRequest = {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
  displayName?: string;
  phone?: string;
  birthYear?: number;
  country?: string;
  favoriteTeam?: string;
  favoriteTeamId?: string;
  playerType?: "casual" | "analyst" | "competitive" | string;
  language?: string;
  locale?: string;
  referralCode?: string;
  acceptTerms?: boolean;
  acceptedTerms?: boolean;
  acceptTeam?: boolean;
  marketingConsent?: boolean;
};

export type RegisterAppData = {
  user?: LoginData["user"];
  tokens?: LoginData["tokens"];
  acceptTeam?: boolean;
  favoriteTeam?: string | null;
};

export type LoginRequest = {
  identifier: string;
  password: string;
  rememberMe?: boolean;
};

export type LoginData = {
  access_token?: string;
  token_type?: "Bearer";
  expires_at?: string;
  expires_in?: number;
  member?: {
    code: number;
    user_name: string;
    name: string;
    email: string | null;
    favorite_team: string | null;
    confirm: string;
  };
  user?: {
    id: string | number;
    username: string;
    email: string | null;
    displayName: string;
    role?: string;
    avatarUrl?: string | null;
    stats?: CurrentUserStats | null;
    preferences?: CurrentUserPreferences | null;
  };
  tokens?: {
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
  };
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  email: string;
  token: string;
  password: string;
  password_confirm?: string;
};

export type BankOption = {
  code: number;
  name: string;
  name_th: string;
  name_en: string;
  shortcode: string;
  image: string;
  image_url: string;
};

export type BankAccountNameRequest = {
  bank: number;
  acc_no: string;
};

export type BankAccountNameData = {
  valid: boolean;
  bank: number;
  acc_no: string;
  account_name: string;
  firstname: string;
  lastname: string;
};

export type MemberProfileData = {
  profile: {
    balance: number;
    point_deposit: number;
    diamond: number;
    balance_free: number;
    credit: number;
    user_name: string;
    name: string;
    email: string | null;
    tel: string | null;
    phone: string | null;
    favorite_team: string | null;
    country: string | null;
    language: string | null;
    player_type: string | null;
    marketing_consent: boolean | null;
    birth_day?: string | null;
    downline: number;
    bank_code?: number | null;
    bank_name?: string | null;
    bank_image?: string | null;
    bank_image_url?: string | null;
    [key: string]: unknown;
  };
  promotion?: unknown;
  withdraw?: boolean;
  deposit?: unknown;
  system?: unknown;
  spin?: unknown;
};

export type CurrentUserData = {
  id?: string | number;
  code?: string | number;
  username?: string | null;
  user_name?: string | null;
  name?: string | null;
  displayName?: string | null;
  display_name?: string | null;
  email?: string | null;
  tel?: string | null;
  phone?: string | null;
  favorite_team?: string | null;
  favoriteTeam?: string | null;
  favoriteTeamId?: string | number | null;
  avatarUrl?: string | null;
  bio?: string | null;
  role?: string | null;
  country?: string | null;
  locale?: string | null;
  language?: string | null;
  player_type?: string | null;
  playerType?: string | null;
  marketing_consent?: boolean | null;
  marketingConsent?: boolean | null;
  birth_day?: string | null;
  birthYear?: string | number | null;
  balance?: number | string | null;
  point_deposit?: number | string | null;
  balance_free?: number | string | null;
  credit?: number | string | null;
  freePoints?: number | string | null;
  premiumCredits?: number | string | null;
  rank?: string | null;
  xp?: number | string | null;
  level?: number | string | null;
  accuracy?: number | string | null;
  total_predictions?: number | string | null;
  totalPredictions?: number | string | null;
  correct_predictions?: number | string | null;
  correctPredictions?: number | string | null;
  best_streak?: number | string | null;
  bestStreak?: number | string | null;
  achievements_unlocked?: number | string | null;
  achievementsUnlocked?: number | string | null;
  stats?: CurrentUserStats | null;
  preferences?: CurrentUserPreferences | null;
  createdAt?: string | null;
  [key: string]: unknown;
};

export type CurrentUserStats = {
  freePoints?: number | string | null;
  free_points?: number | string | null;
  premiumCredits?: number | string | null;
  premium_credits?: number | string | null;
  xp?: number | string | null;
  level?: number | string | null;
  rank?: string | null;
  streak?: number | string | null;
  bestStreak?: number | string | null;
  best_streak?: number | string | null;
  totalPredictions?: number | string | null;
  total_predictions?: number | string | null;
  correctPredictions?: number | string | null;
  correct_predictions?: number | string | null;
  accuracy?: number | string | null;
  missionsCompleted?: number | string | null;
  missions_completed?: number | string | null;
  achievementsUnlocked?: number | string | null;
  achievements_unlocked?: number | string | null;
  streakShields?: number | string | null;
  streak_shields?: number | string | null;
  predictionBoosts?: number | string | null;
  prediction_boosts?: number | string | null;
  referralCount?: number | string | null;
  referral_count?: number | string | null;
  qualifiedReferrals?: number | string | null;
  qualified_referrals?: number | string | null;
  totalReferralEarnings?: number | string | null;
  total_referral_earnings?: number | string | null;
};

export type CurrentUserPreferences = {
  publicProfile?: boolean | null;
  public_profile?: boolean | number | null;
  pushNotifications?: boolean | null;
  push_notifications?: boolean | number | null;
  matchReminder1hr?: boolean | null;
  match_reminder_1hr?: boolean | number | null;
  matchReminder30min?: boolean | null;
  match_reminder_30min?: boolean | number | null;
  resultNotification?: boolean | null;
  result_notification?: boolean | number | null;
  rankChangeAlert?: boolean | null;
  rank_change_alert?: boolean | number | null;
};

export type UpdateCurrentUserRequest = {
  displayName?: string;
  bio?: string;
  favoriteTeamId?: string;
  locale?: string;
  avatarUrl?: string;
};

export type UploadProfileAvatarResponse = {
  success?: boolean;
  code?: string;
  message?: string;
  url?: string;
  avatarUrl?: string;
  imageUrl?: string;
  data?: {
    url?: string;
    avatarUrl?: string;
    imageUrl?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export type CurrentUserResponse =
  | CurrentUserData
  | {
      success?: boolean;
      code?: string;
      message?: string;
      user?: CurrentUserData;
      member?: CurrentUserData;
      profile?: CurrentUserData;
      data?: CurrentUserData;
    };

export type UpdateProfileRequest = {
  displayName?: string;
  phone?: string;
  country?: string;
  favoriteTeam?: string;
  language?: string;
  birthYear?: number;
  playerType?: string;
  marketingConsent?: boolean;
};

export type UpdateProfileData = {
  member_code: number;
  name: string;
  email: string | null;
  tel: string | null;
  country: string | null;
  favorite_team: string | null;
  language: string | null;
  player_type: string | null;
  marketing_consent: boolean | null;
  birth_day: string | null;
};

export type FavoriteTeamData = {
  member_code: number;
  favorite_team: string | null;
};

export type ChangePasswordRequest = {
  password: string;
  password_confirmation: string;
};

export type ChangePasswordData = {
  member_code: number;
};

export async function registerApp(
  body: RegisterAppRequest,
  options: ApiRequestOptions & { remember?: boolean; persistToken?: boolean } = {}
) {
  const response = await apiPostRaw<RegisterAppData | ApiSuccess<RegisterAppData>, RegisterAppRequest>(
    "/auth/register",
    body,
    withBodyLocale(body, options)
  );
  const tokens = extractAuthTokens(response);

  if (options.persistToken !== false && tokens?.accessToken) {
    setStoredAuthTokens(
      tokens.accessToken,
      tokens.refreshToken,
      options.remember ?? true
    );
  }

  return response;
}

export async function login(
  body: LoginRequest,
  options: ApiRequestOptions & { remember?: boolean; persistToken?: boolean } = {}
) {
  const response = await apiPost<LoginData, LoginRequest>(
    "/auth/login",
    body,
    options
  );
  const token = response.data?.access_token ?? response.data?.tokens?.accessToken;
  const refreshToken = response.data?.tokens?.refreshToken;
  if (response.data?.user) {
    response.data.user = normalizeCurrentUserData(response.data.user) as NonNullable<LoginData["user"]>;
  }

  if (!token) {
    throw new Error("Login response did not include an access token");
  }

  if (options.persistToken !== false) {
    setStoredAuthTokens(
      token,
      refreshToken,
      options.remember ?? body.rememberMe ?? true
    );
  }

  return response;
}

export function forgotPassword(
  body: ForgotPasswordRequest,
  options?: ApiRequestOptions
) {
  return apiPost<undefined, ForgotPasswordRequest>(
    "/auth/forgot-password",
    body,
    options
  );
}

export function resetPassword(
  body: ResetPasswordRequest,
  options?: ApiRequestOptions
) {
  return apiPost<undefined, ResetPasswordRequest>(
    "/auth/reset-password",
    body,
    options
  );
}

export async function logout(options?: ApiRequestOptions) {
  try {
    return await apiPost<undefined>("/auth/logout", undefined, options);
  } finally {
    clearStoredAuthToken();
  }
}

export function getRegisterBanks(options?: ApiRequestOptions) {
  return apiGet<{ banks: BankOption[] }>("/auth/register/banks", options);
}

export function resolveBankAccountName(
  body: BankAccountNameRequest,
  options?: ApiRequestOptions
) {
  return apiPost<BankAccountNameData, BankAccountNameRequest>(
    "/auth/register/bank-account-name",
    body,
    options
  );
}

export function getMemberProfile(options?: ApiRequestOptions) {
  return apiGet<MemberProfileData>("/member/profile", options);
}

export function extractCurrentUser(response: CurrentUserResponse): CurrentUserData | null {
  if (!response) return null;
  if ("user" in response && response.user) {
    return extractCurrentUser(response.user);
  }
  if ("member" in response && response.member) {
    return extractCurrentUser(response.member);
  }
  if ("profile" in response && response.profile) {
    return extractCurrentUser(response.profile);
  }
  if ("data" in response && response.data) {
    return extractCurrentUser(response.data);
  }
  return response as CurrentUserData;
}

export async function getCurrentUser(options?: ApiRequestOptions) {
  const response = await apiGetRaw<CurrentUserResponse>("/users/me", options);
  return normalizeCurrentUserResponse(response);
}

export async function updateCurrentUser(
  body: UpdateCurrentUserRequest,
  options?: ApiRequestOptions
) {
  const response = await apiPatchRaw<CurrentUserResponse, UpdateCurrentUserRequest>(
    "/users/me",
    body,
    options
  );
  return normalizeCurrentUserResponse(response);
}

export function uploadProfileAvatar(file: File, options?: ApiRequestOptions) {
  const body = new FormData();
  body.append("file", file);

  return apiPostFormRaw<UploadProfileAvatarResponse>(
    "/users/me/avatar",
    body,
    options
  );
}

export function updateMemberProfile(
  body: UpdateProfileRequest,
  options?: ApiRequestOptions
) {
  return apiPost<UpdateProfileData, UpdateProfileRequest>(
    "/member/update-profile",
    body,
    withBodyLocale(body, options)
  );
}

export function updateFavoriteTeam(
  favoriteTeam: string | null,
  options?: ApiRequestOptions
): Promise<ApiSuccess<FavoriteTeamData>> {
  return apiPost<FavoriteTeamData, { favorite_team: string | null }>(
    "/member/favorite-team",
    { favorite_team: favoriteTeam },
    options
  );
}

export function changePassword(
  body: ChangePasswordRequest,
  options?: ApiRequestOptions
) {
  return apiPost<ChangePasswordData, ChangePasswordRequest>(
    "/member/change-password",
    body,
    options
  );
}

function withBodyLocale<T extends { language?: string; locale?: string }>(
  body: T,
  options?: ApiRequestOptions
) {
  return {
    ...options,
    locale: options?.locale ?? body.language ?? body.locale,
  };
}

function extractAuthTokens(response: RegisterAppData | ApiSuccess<RegisterAppData>) {
  return "success" in response ? response.data?.tokens : response.tokens;
}

function normalizeCurrentUserResponse(response: CurrentUserResponse): CurrentUserResponse {
  if (!isRecord(response)) return response;

  if (isCurrentUserPayload(response)) {
    return normalizeCurrentUserData(response);
  }

  return {
    ...response,
    user: isRecord(response.user) ? normalizeCurrentUserData(response.user) : response.user,
    member: isRecord(response.member) ? normalizeCurrentUserData(response.member) : response.member,
    profile: isRecord(response.profile) ? normalizeCurrentUserData(response.profile) : response.profile,
    data: isRecord(response.data) ? normalizeCurrentUserData(response.data) : response.data,
  };
}

function normalizeCurrentUserData(user: CurrentUserData): CurrentUserData {
  const stats = normalizeCurrentUserStats(user.stats);
  const preferences = normalizeCurrentUserPreferences(user.preferences);

  return {
    ...user,
    username: pickValue(user.username, user.user_name),
    displayName: pickValue(user.displayName, user.display_name, user.name),
    favoriteTeamId: pickValue(user.favoriteTeamId, user.favoriteTeam, user.favorite_team),
    locale: pickValue(user.locale, user.language),
    playerType: pickValue(user.playerType, user.player_type),
    marketingConsent: pickValue(user.marketingConsent, user.marketing_consent),
    freePoints: pickValue(user.freePoints, stats?.freePoints, user.point_deposit, user.balance_free),
    premiumCredits: pickValue(user.premiumCredits, stats?.premiumCredits, user.credit, user.balance),
    rank: pickValue(user.rank, stats?.rank),
    xp: pickValue(user.xp, stats?.xp),
    level: pickValue(user.level, stats?.level),
    totalPredictions: pickValue(user.totalPredictions, stats?.totalPredictions, user.total_predictions),
    correctPredictions: pickValue(user.correctPredictions, stats?.correctPredictions, user.correct_predictions),
    bestStreak: pickValue(user.bestStreak, stats?.bestStreak, user.best_streak),
    achievementsUnlocked: pickValue(
      user.achievementsUnlocked,
      stats?.achievementsUnlocked,
      user.achievements_unlocked
    ),
    stats,
    preferences,
  };
}

function normalizeCurrentUserStats(stats?: CurrentUserStats | null) {
  if (!stats) return stats;

  return {
    ...stats,
    freePoints: pickValue(stats.freePoints, stats.free_points),
    premiumCredits: pickValue(stats.premiumCredits, stats.premium_credits),
    bestStreak: pickValue(stats.bestStreak, stats.best_streak),
    totalPredictions: pickValue(stats.totalPredictions, stats.total_predictions),
    correctPredictions: pickValue(stats.correctPredictions, stats.correct_predictions),
    missionsCompleted: pickValue(stats.missionsCompleted, stats.missions_completed),
    achievementsUnlocked: pickValue(stats.achievementsUnlocked, stats.achievements_unlocked),
    streakShields: pickValue(stats.streakShields, stats.streak_shields),
    predictionBoosts: pickValue(stats.predictionBoosts, stats.prediction_boosts),
    referralCount: pickValue(stats.referralCount, stats.referral_count),
    qualifiedReferrals: pickValue(stats.qualifiedReferrals, stats.qualified_referrals),
    totalReferralEarnings: pickValue(
      stats.totalReferralEarnings,
      stats.total_referral_earnings
    ),
  };
}

function normalizeCurrentUserPreferences(preferences?: CurrentUserPreferences | null) {
  if (!preferences) return preferences;

  return {
    ...preferences,
    publicProfile: booleanValue(pickValue(preferences.publicProfile, preferences.public_profile)),
    pushNotifications: booleanValue(
      pickValue(preferences.pushNotifications, preferences.push_notifications)
    ),
    matchReminder1hr: booleanValue(
      pickValue(preferences.matchReminder1hr, preferences.match_reminder_1hr)
    ),
    matchReminder30min: booleanValue(
      pickValue(preferences.matchReminder30min, preferences.match_reminder_30min)
    ),
    resultNotification: booleanValue(
      pickValue(preferences.resultNotification, preferences.result_notification)
    ),
    rankChangeAlert: booleanValue(
      pickValue(preferences.rankChangeAlert, preferences.rank_change_alert)
    ),
  };
}

function isCurrentUserPayload(value: Record<string, unknown>): value is CurrentUserData {
  return (
    "id" in value ||
    "username" in value ||
    "user_name" in value ||
    "displayName" in value ||
    "display_name" in value
  );
}

function pickValue<T>(...values: Array<T | null | undefined>) {
  return values.find((value) => value !== undefined && value !== null);
}

function booleanValue(value: boolean | number | null | undefined) {
  if (value === undefined || value === null) return value;
  return Boolean(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

import {
  apiGet,
  apiPost,
  clearStoredAuthToken,
  setStoredAuthToken,
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
  acceptTeam?: boolean;
  favoriteTeam?: string | null;
};

export type LoginRequest = {
  identifier: string;
  password: string;
  rememberMe?: boolean;
};

export type LoginData = {
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

export function registerApp(
  body: RegisterAppRequest,
  options?: ApiRequestOptions
) {
  return apiPost<RegisterAppData, RegisterAppRequest>(
    "/auth/register-app",
    body,
    withBodyLocale(body, options)
  );
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

  if (!response.data?.access_token) {
    throw new Error("Login response did not include an access token");
  }

  if (options.persistToken !== false) {
    setStoredAuthToken(response.data.access_token, options.remember ?? body.rememberMe ?? true);
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

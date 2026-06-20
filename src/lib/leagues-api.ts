import {
  ApiClientError,
  apiGetRaw,
  apiPatchFormRaw,
  apiPostFormRaw,
  apiPostRaw,
  type ApiRequestOptions,
} from "@/lib/api-client";

export type LeagueTopMember = {
  userId: string;
  points: number;
};

export type JoinedLeague = {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  maxMembers: number;
  entryFeeCredits: number | null;
  logoUrl: string | null;
  isPrivate: boolean;
  inviteCode: string | null;
  prizePool: number;
  isOwner: boolean;
  myRank: number;
  myPoints: number;
  top3: LeagueTopMember[];
};

export type AvailableLeague = {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  maxMembers: number;
  entryFee: number;
  entryFeeCredits: number;
  logoUrl: string | null;
  isLocked: boolean;
};

export type LeaguesResponse = {
  joined: JoinedLeague[];
  available: AvailableLeague[];
  limits?: {
    create?: LeagueLimit;
    join?: LeagueLimit;
  };
  pagination?: LeaguePagination;
};

export type LeagueLimit = {
  used: number;
  max: number;
  remaining: number;
};

export type LeaguePagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type LeagueStanding = {
  rank: number;
  userId: string;
  points: number;
  accuracy: number;
};

export type LeagueJoinStatus = "joined" | "pending" | "rejected" | "unknown";

export type JoinLeagueResult = {
  status: LeagueJoinStatus;
  message?: string;
};

export type LeagueJoinRequest = {
  id: string;
  userId: string;
  displayName: string;
  status: "pending" | "approved" | "rejected" | string;
  requestedAt: string | null;
};

export type LeagueDetail = {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  maxMembers: number;
  entryFeeCredits: number;
  logoUrl: string | null;
  isPrivate: boolean;
  isOwner: boolean;
  inviteCode: string | null;
  createdAt: string;
  owner: {
    id: string;
  };
  standings: LeagueStanding[];
  myRank: number | null;
};

export type CreateLeagueInput = {
  name: string;
  description: string | null;
  maxMembers: number | null;
  entryFeeCredits: number | null;
  isPrivate: boolean | null;
  inviteCode?: string | null;
  logo?: File | null;
};

export type UpdateLeagueInput = {
  name?: string;
  description?: string | null;
  maxMembers?: number | null;
  entryFeeCredits?: number | null;
  isPrivate?: boolean | null;
  inviteCode?: string | null;
  logo?: File | null;
};

export type CreatedLeague = {
  id?: string | number;
  name?: string;
  description?: string | null;
  maxMembers?: number;
  entryFeeCredits?: number;
  isPrivate?: boolean;
  inviteCode?: string | null;
  [key: string]: unknown;
};

export type JoinLeagueInput = {
  inviteCode: string;
};

export function createLeague(
  input: CreateLeagueInput,
  options?: ApiRequestOptions
) {
  const formData = buildLeagueFormData(input);
  return formData
    ? apiPostFormRaw<CreatedLeague>("/leagues", formData, options)
    : apiPostRaw<CreatedLeague, CreateLeagueInput>("/leagues", input, options);
}

export function updateLeague(
  leagueId: string,
  input: UpdateLeagueInput,
  options?: ApiRequestOptions
) {
  const formData = buildLeagueFormData(input, true);
  return apiPatchFormRaw<CreatedLeague>(
    `/leagues/${encodeURIComponent(leagueId)}`,
    formData,
    options
  );
}

export function getLeagues(
  options?: ApiRequestOptions & {
    page?: number;
    limit?: number;
    search?: string;
  }
) {
  const path = buildLeaguesPath(options);

  return apiGetRaw<LeaguesResponse>(path, options).then((response) => ({
    joined: (response.joined ?? []).map((league) => ({
      ...league,
      entryFeeCredits: resolveOptionalEntryFeeCredits(league),
      logoUrl: resolveLogoUrl(league),
      isPrivate: resolveIsPrivate(league),
      inviteCode: resolveInviteCode(league),
    })),
    available: (response.available ?? []).map((league) => ({
      ...league,
      entryFeeCredits: resolveEntryFeeCredits(league),
      logoUrl: resolveLogoUrl(league),
    })),
    limits: response.limits,
    pagination: normalizePagination(response.pagination, options),
  }));
}

export function getLeague(leagueId: string, options?: ApiRequestOptions) {
  return apiGetRaw<LeagueDetail>(
    `/leagues/${encodeURIComponent(leagueId)}`,
    options
  ).then((league) => ({
    ...league,
    entryFeeCredits: resolveEntryFeeCredits(league),
    isOwner: resolveIsOwner(league),
    isPrivate: resolveIsPrivate(league),
    inviteCode: resolveInviteCode(league),
    logoUrl: resolveLogoUrl(league),
  }));
}

export function joinLeague(
  leagueId: string,
  input?: JoinLeagueInput,
  options?: ApiRequestOptions
) {
  return apiPostRaw<unknown, JoinLeagueInput>(
    `/leagues/${encodeURIComponent(leagueId)}/join`,
    input,
    options
  ).then(normalizeJoinLeagueResult);
}

export function leaveLeague(leagueId: string, options?: ApiRequestOptions) {
  return apiPostRaw<unknown>(
    `/leagues/${encodeURIComponent(leagueId)}/leave`,
    undefined,
    options
  );
}

export function kickLeagueMember(
  leagueId: string,
  userId: string,
  options?: ApiRequestOptions
) {
  return apiPostRaw<unknown>(
    `/leagues/${encodeURIComponent(leagueId)}/kick/${encodeURIComponent(userId)}`,
    undefined,
    options
  );
}

export function getLeagueJoinRequests(
  leagueId: string,
  options?: ApiRequestOptions
) {
  return apiGetRaw<unknown>(
    `/leagues/${encodeURIComponent(leagueId)}/requests`,
    options
  ).then(normalizeLeagueJoinRequests);
}

export function approveLeagueJoinRequest(
  leagueId: string,
  requestId: string,
  requestUserId: string,
  options?: ApiRequestOptions
) {
  return postLeagueRequestAction(
    leagueId,
    requestId,
    requestUserId,
    "approve",
    options
  );
}

export function rejectLeagueJoinRequest(
  leagueId: string,
  requestId: string,
  requestUserId: string,
  options?: ApiRequestOptions
) {
  return postLeagueRequestAction(
    leagueId,
    requestId,
    requestUserId,
    "reject",
    options
  );
}

async function postLeagueRequestAction(
  leagueId: string,
  requestId: string,
  requestUserId: string,
  action: "approve" | "reject",
  options?: ApiRequestOptions
) {
  const keys = Array.from(new Set([requestId, requestUserId].filter(Boolean)));
  let lastError: unknown;

  for (const key of keys) {
    try {
      return await apiPostRaw<unknown>(
        `/leagues/${encodeURIComponent(leagueId)}/requests/${encodeURIComponent(
          key
        )}/${action}`,
        undefined,
        options
      );
    } catch (error) {
      lastError = error;
      if (!(error instanceof ApiClientError) || error.status !== 404) {
        throw error;
      }
    }
  }

  throw lastError;
}

function resolveOptionalEntryFeeCredits(value: unknown): number | null {
  return findEntryFeeCredits(value);
}

function resolveEntryFeeCredits(value: unknown): number {
  return findEntryFeeCredits(value) ?? 0;
}

function findEntryFeeCredits(value: unknown): number | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  for (const candidate of [
    record.entryFeeCredits,
    record.entry_fee_credits,
    record.entryFee,
    record.entry_fee,
  ]) {
    if (candidate === null || candidate === undefined || candidate === "") {
      continue;
    }
    const amount = Number(candidate);
    if (Number.isFinite(amount) && amount >= 0) return amount;
  }

  return null;
}

function resolveIsOwner(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;

  const record = value as Record<string, unknown>;
  return record.isOwner === true || record.is_owner === true;
}

function buildLeaguesPath(
  options?: ApiRequestOptions & {
    page?: number;
    limit?: number;
    search?: string;
  }
) {
  const params = new URLSearchParams();
  if (options?.page && options.page > 1) params.set("page", String(options.page));
  if (options?.limit) params.set("limit", String(options.limit));
  const search = options?.search?.trim();
  if (search) params.set("search", search);

  const query = params.toString();
  return `/leagues${query ? `?${query}` : ""}`;
}

function buildLeagueFormData(
  input: CreateLeagueInput | UpdateLeagueInput,
  force: true
): FormData;
function buildLeagueFormData(
  input: CreateLeagueInput | UpdateLeagueInput,
  force?: false
): FormData | null;
function buildLeagueFormData(
  input: CreateLeagueInput | UpdateLeagueInput,
  force = false
) {
  const hasLogo = input.logo instanceof File;
  const hasInviteCode = "inviteCode" in input && input.inviteCode !== undefined;
  if (!force && !hasLogo && !hasInviteCode) return null;

  const formData = new FormData();
  appendFormValue(formData, "name", input.name);
  appendFormValue(formData, "description", input.description);
  appendFormValue(formData, "maxMembers", input.maxMembers);
  appendFormValue(formData, "entryFeeCredits", input.entryFeeCredits);
  appendFormValue(
    formData,
    "isPrivate",
    typeof input.isPrivate === "boolean"
      ? input.isPrivate
        ? "1"
        : "0"
      : input.isPrivate
  );
  appendFormValue(formData, "inviteCode", input.inviteCode);
  if (input.logo instanceof File) formData.append("logo", input.logo);
  return formData;
}

function appendFormValue(
  formData: FormData,
  key: string,
  value: string | number | boolean | null | undefined
) {
  if (value === undefined || value === null || value === "") return;
  formData.append(key, String(value));
}

function resolveLogoUrl(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const logo = record.logoUrl ?? record.logo_url ?? record.logo;
  return typeof logo === "string" && logo.trim() ? logo : null;
}

function resolveIsPrivate(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return record.isPrivate === true || record.is_private === true || record.isLocked === true;
}

function resolveInviteCode(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const code = record.inviteCode ?? record.invite_code;
  return typeof code === "string" && code.trim() ? code : null;
}

function normalizeJoinLeagueResult(payload: unknown): JoinLeagueResult {
  const record = unwrapDataRecord(payload);
  const rawStatus =
    readString(record?.status) ??
    readString(record?.joinStatus) ??
    readString(record?.join_status) ??
    readString(record?.membershipStatus) ??
    readString(record?.membership_status) ??
    readString(record?.requestStatus) ??
    readString(record?.request_status);
  const normalizedStatus = rawStatus?.toLowerCase();

  if (
    normalizedStatus === "pending" ||
    normalizedStatus === "waiting" ||
    normalizedStatus === "awaiting_approval" ||
    normalizedStatus === "approval_pending"
  ) {
    return { status: "pending", message: readString(record?.message) };
  }

  if (
    normalizedStatus === "joined" ||
    normalizedStatus === "approved" ||
    normalizedStatus === "member" ||
    normalizedStatus === "active"
  ) {
    return { status: "joined", message: readString(record?.message) };
  }

  if (normalizedStatus === "rejected" || normalizedStatus === "declined") {
    return { status: "rejected", message: readString(record?.message) };
  }

  return { status: "unknown", message: readString(record?.message) };
}

function normalizeLeagueJoinRequests(payload: unknown): LeagueJoinRequest[] {
  const record = unwrapDataRecord(payload);
  const candidates =
    (Array.isArray(record?.requests) && record.requests) ||
    (Array.isArray(record?.pending) && record.pending) ||
    (Array.isArray(record?.data) && record.data) ||
    (Array.isArray(payload) && payload) ||
    [];

  return candidates
    .map((item) => normalizeLeagueJoinRequest(item))
    .filter((request): request is LeagueJoinRequest => request !== null);
}

function normalizeLeagueJoinRequest(value: unknown): LeagueJoinRequest | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const userRecord = readRecord(record.user) ?? readRecord(record.member);
  const userId =
    readString(record.userId) ??
    readString(record.user_id) ??
    readString(record.memberId) ??
    readString(record.member_id) ??
    readString(userRecord?.id);
  const id =
    readString(record.id) ??
    readString(record.requestId) ??
    readString(record.request_id) ??
    userId;

  if (!id || !userId) return null;

  return {
    id,
    userId,
    displayName:
      readString(record.displayName) ??
      readString(record.display_name) ??
      readString(record.name) ??
      readString(userRecord?.displayName) ??
      readString(userRecord?.display_name) ??
      readString(userRecord?.username) ??
      readString(userRecord?.name) ??
      "Member",
    status:
      readString(record.status) ??
      readString(record.requestStatus) ??
      readString(record.request_status) ??
      "pending",
    requestedAt:
      readString(record.requestedAt) ??
      readString(record.requested_at) ??
      readString(record.createdAt) ??
      readString(record.created_at) ??
      null,
  };
}

function unwrapDataRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object") return undefined;
  const record = value as Record<string, unknown>;
  const data = readRecord(record.data);
  return data ?? record;
}

function readRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : undefined;
}

function readString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return undefined;
}

function normalizePagination(
  pagination: LeaguesResponse["pagination"],
  options?: { page?: number; limit?: number }
): LeaguePagination {
  return {
    page: Number(pagination?.page ?? options?.page ?? 1),
    limit: Number(pagination?.limit ?? options?.limit ?? 20),
    total: Number(pagination?.total ?? 0),
    totalPages: Number(pagination?.totalPages ?? 0),
  };
}

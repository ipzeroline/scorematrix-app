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
  totalFeesReceived: number | null;
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
  joinStatus?: LeagueJoinStatus;
};

export type LeaguesResponse = {
  joined: JoinedLeague[];
  available: AvailableLeague[];
  limits?: {
    create?: LeagueLimit;
    join?: LeagueLimit;
    owned?: OwnedLeagueLimit;
  };
  pagination?: LeaguePagination;
};

export type LeagueLimit = {
  used: number;
  max: number;
  remaining: number;
};

export type OwnedLeagueLimit = {
  leagues: number;
  totalMembers: number;
  totalPoints: number;
  availableSlots: number;
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
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  points: number;
  accuracy: number;
  predictionsCount: number | null;
  correctPredictions: number | null;
  wins: number | null;
  level: number | null;
  joinedAt: string | null;
};

export type LeagueJoinStatus = "joined" | "pending" | "rejected" | "unknown";

export type JoinLeagueResult = {
  status: LeagueJoinStatus;
  message?: string;
};

export type LeagueJoinRequest = {
  id: string;
  userId: string;
  username: string | null;
  displayName: string;
  avatarUrl: string | null;
  status: "pending" | "approved" | "rejected" | string;
  requestedAt: string | null;
};

export type LeagueHistoryEntry = {
  id: string;
  userId: string | null;
  username: string | null;
  type: string;
  referenceType: string | null;
  pointsChange: number;
  metadata: Record<string, unknown>;
  createdAt: string | null;
};

export type LeagueDetail = {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  maxMembers: number;
  entryFeeCredits: number;
  totalFeesReceived: number;
  logoUrl: string | null;
  isPrivate: boolean;
  isOwner: boolean;
  inviteCode: string | null;
  createdAt: string;
  owner: {
    id: string;
  };
  standings: LeagueStanding[];
  history: LeagueHistoryEntry[];
  myRank: number | null;
  myPoints?: number | null;
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
      totalFeesReceived: resolveOptionalTotalFeesReceived(league),
      logoUrl: resolveLogoUrl(league),
      isPrivate: resolveIsPrivate(league),
      inviteCode: resolveInviteCode(league),
    })),
    available: (response.available ?? []).map((league) => ({
      ...league,
      entryFeeCredits: resolveEntryFeeCredits(league),
      logoUrl: resolveLogoUrl(league),
      joinStatus: resolveLeagueJoinStatus(league),
    })),
    limits: response.limits,
    pagination: normalizePagination(response.pagination, options),
  }));
}

export function getLeague(leagueId: string, options?: ApiRequestOptions) {
  return apiGetRaw<LeagueDetail>(
    `/leagues/${encodeURIComponent(leagueId)}`,
    options
  ).then((league) => {
    const record = unwrapDataRecord(league) ?? readRecord(league);
    const standings = normalizeLeagueStandings(readStandingCandidates(record));
    const memberProfiles = normalizeLeagueStandings(readMemberCandidates(record));
    const history = normalizeLeagueHistory(readHistoryCandidates(record));

    return {
      ...league,
      ...record,
      entryFeeCredits: resolveEntryFeeCredits(record),
      isOwner: resolveIsOwner(record),
      isPrivate: resolveIsPrivate(record),
      inviteCode: resolveInviteCode(record),
      logoUrl: resolveLogoUrl(record),
      standings: mergeLeagueStandingProfiles(standings, memberProfiles),
      history,
      myPoints: resolveLeagueMyPoints(record),
      totalFeesReceived: resolveTotalFeesReceived(record),
    };
  });
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

function resolveTotalFeesReceived(value: unknown): number {
  return resolveOptionalTotalFeesReceived(value) ?? 0;
}

function resolveOptionalTotalFeesReceived(value: unknown): number | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  for (const candidate of [
    record.totalFeesReceived,
    record.total_fees_received,
    record.totalFeeReceived,
    record.total_fee_received,
  ]) {
    if (candidate === null || candidate === undefined || candidate === "") {
      continue;
    }
    const amount = Number(candidate);
    if (Number.isFinite(amount) && amount >= 0) return amount;
  }

  return null;
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
  const role =
    readString(record.role) ??
    readString(record.myRole) ??
    readString(record.my_role) ??
    readString(record.membershipRole) ??
    readString(record.membership_role);

  return (
    record.isOwner === true ||
    record.is_owner === true ||
    record.owner === true ||
    record.canManage === true ||
    record.can_manage === true ||
    role?.toLowerCase() === "owner"
  );
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

function resolveLeagueMyPoints(value: unknown): number | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  return (
    readNumber(
      record.myPoints,
      record.my_points,
      record.points,
      record.score,
      readRecord(record.member)?.points,
      readRecord(record.membership)?.points,
      readRecord(record.currentUser)?.points,
      readRecord(record.current_user)?.points
    ) ?? null
  );
}

function normalizeJoinLeagueResult(payload: unknown): JoinLeagueResult {
  const record = unwrapDataRecord(payload);
  return {
    status: resolveLeagueJoinStatus(record),
    message: readString(record?.message),
  };
}

function resolveLeagueJoinStatus(value: unknown): LeagueJoinStatus {
  if (!value || typeof value !== "object") return "unknown";

  const record = value as Record<string, unknown>;
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
    return "pending";
  }

  if (
    normalizedStatus === "joined" ||
    normalizedStatus === "approved" ||
    normalizedStatus === "member" ||
    normalizedStatus === "active"
  ) {
    return "joined";
  }

  if (normalizedStatus === "rejected" || normalizedStatus === "declined") {
    return "rejected";
  }

  return "unknown";
}

function normalizeLeagueJoinRequests(payload: unknown): LeagueJoinRequest[] {
  const record = unwrapDataRecord(payload);
  const candidates =
    (Array.isArray(record?.requests) && record.requests) ||
    (Array.isArray(record?.joinRequests) && record.joinRequests) ||
    (Array.isArray(record?.join_requests) && record.join_requests) ||
    (Array.isArray(record?.pendingRequests) && record.pendingRequests) ||
    (Array.isArray(record?.pending_requests) && record.pending_requests) ||
    (Array.isArray(record?.items) && record.items) ||
    (Array.isArray(record?.results) && record.results) ||
    (Array.isArray(record?.pending) && record.pending) ||
    (Array.isArray(record?.data) && record.data) ||
    (Array.isArray(payload) && payload) ||
    [];

  return candidates
    .map((item) => normalizeLeagueJoinRequest(item))
    .filter((request): request is LeagueJoinRequest => request !== null);
}

function normalizeLeagueStandings(value: unknown): LeagueStanding[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => normalizeLeagueStanding(item, index))
    .filter((standing): standing is LeagueStanding => standing !== null)
    .sort((a, b) => a.rank - b.rank);
}

function readStandingCandidates(record: Record<string, unknown> | undefined) {
  return (
    readArray(record?.standings) ??
    readArray(record?.leaderboard) ??
    readArray(record?.rankings) ??
    readArray(record?.ranking) ??
    readArray(record?.scores) ??
    []
  );
}

function readMemberCandidates(record: Record<string, unknown> | undefined) {
  return (
    readArray(record?.members) ??
    readArray(record?.member_list) ??
    readArray(record?.users) ??
    readArray(record?.participants) ??
    []
  );
}

function readHistoryCandidates(record: Record<string, unknown> | undefined) {
  return (
    readArray(record?.history) ??
    readArray(record?.activities) ??
    readArray(record?.activity) ??
    readArray(record?.logs) ??
    readArray(record?.events) ??
    []
  );
}

function normalizeLeagueHistory(values: unknown[]) {
  return values
    .map(normalizeLeagueHistoryEntry)
    .filter((entry): entry is LeagueHistoryEntry => entry !== null);
}

function normalizeLeagueHistoryEntry(value: unknown): LeagueHistoryEntry | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const id = readString(record.id);
  const createdAt =
    readString(record.createdAt) ??
    readString(record.created_at) ??
    readString(record.timestamp) ??
    null;
  const type = readString(record.type) ?? readString(record.eventType) ?? "activity";

  if (!id && !createdAt) return null;

  return {
    id: id ?? `${type}:${createdAt}`,
    userId:
      readString(record.userId) ??
      readString(record.user_id) ??
      readString(record.memberId) ??
      readString(record.member_id) ??
      null,
    username:
      readString(record.username) ??
      readString(record.userName) ??
      readString(record.user_name) ??
      null,
    type,
    referenceType:
      readString(record.referenceType) ??
      readString(record.reference_type) ??
      null,
    pointsChange:
      readNumber(
        record.pointsChange,
        record.points_change,
        record.amount,
        record.value
      ) ?? 0,
    metadata: readRecord(record.metadata) ?? {},
    createdAt,
  };
}

function mergeLeagueStandingProfiles(
  standings: LeagueStanding[],
  memberProfiles: LeagueStanding[]
) {
  if (standings.length === 0) return memberProfiles;
  if (memberProfiles.length === 0) return standings;

  const profilesByUserId = new Map(
    memberProfiles.map((profile) => [profile.userId, profile])
  );

  return standings.map((standing) => {
    const profile = profilesByUserId.get(standing.userId);
    if (!profile) return standing;

    return {
      ...standing,
      username: standing.username ?? profile.username,
      displayName: standing.displayName ?? profile.displayName,
      avatarUrl: standing.avatarUrl ?? profile.avatarUrl,
      predictionsCount: standing.predictionsCount ?? profile.predictionsCount,
      correctPredictions: standing.correctPredictions ?? profile.correctPredictions,
      wins: standing.wins ?? profile.wins,
      level: standing.level ?? profile.level,
      joinedAt: standing.joinedAt ?? profile.joinedAt,
    };
  });
}

function normalizeLeagueStanding(
  value: unknown,
  index: number
): LeagueStanding | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const userRecord = readRecord(record.user) ?? readRecord(record.member);
  const statsRecord =
    readRecord(record.stats) ??
    readRecord(record.statistics) ??
    readRecord(userRecord?.stats) ??
    readRecord(userRecord?.statistics);
  const userId =
    readString(record.userId) ??
    readString(record.user_id) ??
    readString(record.memberId) ??
    readString(record.member_id) ??
    readString(userRecord?.id);

  if (!userId) return null;

  const predictionsCount =
    readNumber(
      record.predictionsCount,
      record.predictions_count,
      record.totalPredictions,
      record.total_predictions,
      record.predictions,
      statsRecord?.predictionsCount,
      statsRecord?.predictions_count,
      statsRecord?.totalPredictions,
      statsRecord?.total_predictions,
      statsRecord?.predictions
    ) ?? null;
  const correctPredictions =
    readNumber(
      record.correctPredictions,
      record.correct_predictions,
      statsRecord?.correctPredictions,
      statsRecord?.correct_predictions
    ) ?? null;

  return {
    rank: readNumber(record.rank, record.position, record.place) ?? index + 1,
    userId,
    username:
      readString(record.username) ??
      readString(userRecord?.username) ??
      readString(userRecord?.name) ??
      null,
    displayName:
      readString(record.displayName) ??
      readString(record.display_name) ??
      readString(record.name) ??
      readString(userRecord?.displayName) ??
      readString(userRecord?.display_name) ??
      readString(userRecord?.name) ??
      readString(userRecord?.username) ??
      null,
    avatarUrl:
      readString(record.avatarUrl) ??
      readString(record.avatar_url) ??
      readString(record.avatar) ??
      readString(record.imageUrl) ??
      readString(record.image_url) ??
      readString(userRecord?.avatarUrl) ??
      readString(userRecord?.avatar_url) ??
      readString(userRecord?.avatar) ??
      readString(userRecord?.imageUrl) ??
      readString(userRecord?.image_url) ??
      null,
    points:
      readNumber(
        record.points,
        record.score,
        record.totalPoints,
        record.total_points,
        statsRecord?.points,
        statsRecord?.score,
        statsRecord?.totalPoints,
        statsRecord?.total_points
      ) ?? 0,
    accuracy:
      readNumber(
        record.accuracy,
        record.accuracyRate,
        record.accuracy_rate,
        statsRecord?.accuracy,
        statsRecord?.accuracyRate,
        statsRecord?.accuracy_rate
      ) ?? 0,
    predictionsCount,
    correctPredictions,
    wins:
      readNumber(record.wins, record.win, statsRecord?.wins, statsRecord?.win) ??
      correctPredictions,
    level:
      readNumber(record.level, userRecord?.level, statsRecord?.level) ?? null,
    joinedAt:
      readString(record.joinedAt) ??
      readString(record.joined_at) ??
      readString(record.createdAt) ??
      readString(record.created_at) ??
      readString(userRecord?.joinedAt) ??
      readString(userRecord?.joined_at) ??
      null,
  };
}

function normalizeLeagueJoinRequest(value: unknown): LeagueJoinRequest | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const userRecord = readFirstRecord(
    record.user,
    record.member,
    record.profile,
    record.userProfile,
    record.user_profile,
    record.memberProfile,
    record.member_profile,
    record.requester,
    record.applicant,
    record.account,
    record.createdBy,
    record.created_by
  );
  const userId =
    readString(record.userId) ??
    readString(record.user_id) ??
    readString(record.memberId) ??
    readString(record.member_id) ??
    readString(record.requesterId) ??
    readString(record.requester_id) ??
    readString(record.applicantId) ??
    readString(record.applicant_id) ??
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
    username:
      readString(record.username) ??
      readString(record.userName) ??
      readString(record.user_name) ??
      readString(record.nickname) ??
      readString(userRecord?.username) ??
      readString(userRecord?.userName) ??
      readString(userRecord?.user_name) ??
      readString(userRecord?.nickname) ??
      null,
    displayName:
      readString(record.displayName) ??
      readString(record.display_name) ??
      readString(record.fullName) ??
      readString(record.full_name) ??
      readString(record.name) ??
      readString(userRecord?.displayName) ??
      readString(userRecord?.display_name) ??
      readString(userRecord?.fullName) ??
      readString(userRecord?.full_name) ??
      joinNameParts(userRecord?.firstName, userRecord?.lastName) ??
      joinNameParts(userRecord?.first_name, userRecord?.last_name) ??
      readString(userRecord?.username) ??
      readString(userRecord?.name) ??
      "Member",
    avatarUrl:
      readString(record.avatarUrl) ??
      readString(record.avatar_url) ??
      readString(record.avatar) ??
      readString(record.imageUrl) ??
      readString(record.image_url) ??
      readString(record.image) ??
      readString(record.photo) ??
      readString(record.picture) ??
      readString(record.profilePhoto) ??
      readString(record.profile_photo) ??
      readString(record.profileImageUrl) ??
      readString(record.profile_image_url) ??
      readString(userRecord?.avatarUrl) ??
      readString(userRecord?.avatar_url) ??
      readString(userRecord?.avatar) ??
      readString(userRecord?.imageUrl) ??
      readString(userRecord?.image_url) ??
      readString(userRecord?.image) ??
      readString(userRecord?.photo) ??
      readString(userRecord?.picture) ??
      readString(userRecord?.profilePhoto) ??
      readString(userRecord?.profile_photo) ??
      readString(userRecord?.profileImageUrl) ??
      readString(userRecord?.profile_image_url) ??
      null,
    status:
      normalizeLeagueJoinRequestStatus(
        readString(record.status) ??
          readString(record.requestStatus) ??
          readString(record.request_status) ??
          readString(record.joinStatus) ??
          readString(record.join_status)
      ),
    requestedAt:
      readString(record.requestedAt) ??
      readString(record.requested_at) ??
      readString(record.createdAt) ??
      readString(record.created_at) ??
      null,
  };
}

function normalizeLeagueJoinRequestStatus(status: string | null | undefined) {
  const normalizedStatus = status?.toLowerCase();

  if (
    !normalizedStatus ||
    normalizedStatus === "pending" ||
    normalizedStatus === "waiting" ||
    normalizedStatus === "awaiting_approval" ||
    normalizedStatus === "approval_pending" ||
    normalizedStatus === "pending_approval"
  ) {
    return "pending";
  }

  if (normalizedStatus === "approved" || normalizedStatus === "joined") {
    return "approved";
  }

  if (normalizedStatus === "rejected" || normalizedStatus === "declined") {
    return "rejected";
  }

  return status ?? "pending";
}

function unwrapDataRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object") return undefined;
  const record = value as Record<string, unknown>;
  const data = readRecord(record.data);
  return data ?? record;
}

function readFirstRecord(...values: unknown[]) {
  for (const value of values) {
    const record = readRecord(value);
    if (record) return record;
  }

  return undefined;
}

function readRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : undefined;
}

function readArray(value: unknown): unknown[] | undefined {
  return Array.isArray(value) ? value : undefined;
}

function readString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return undefined;
}

function readNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue;
    const numberValue = Number(value);
    if (Number.isFinite(numberValue)) return numberValue;
  }
  return undefined;
}

function joinNameParts(firstName: unknown, lastName: unknown) {
  const name = [readString(firstName), readString(lastName)]
    .filter(Boolean)
    .join(" ")
    .trim();
  return name || undefined;
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

import { apiGetRaw, apiPostRaw, type ApiRequestOptions } from "@/lib/api-client";

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
  isLocked: boolean;
};

export type LeaguesResponse = {
  joined: JoinedLeague[];
  available: AvailableLeague[];
};

export type LeagueStanding = {
  rank: number;
  userId: string;
  points: number;
  accuracy: number;
};

export type LeagueDetail = {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
  maxMembers: number;
  entryFeeCredits: number;
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
  return apiPostRaw<CreatedLeague, CreateLeagueInput>("/leagues", input, options);
}

export function getLeagues(options?: ApiRequestOptions) {
  return apiGetRaw<LeaguesResponse>("/leagues", options).then((response) => ({
    joined: (response.joined ?? []).map((league) => ({
      ...league,
      entryFeeCredits: resolveOptionalEntryFeeCredits(league),
    })),
    available: (response.available ?? []).map((league) => ({
      ...league,
      entryFeeCredits: resolveEntryFeeCredits(league),
    })),
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
  );
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

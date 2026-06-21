import {
  apiDeleteRaw,
  apiGetRaw,
  apiPatchRaw,
  apiPostRaw,
  apiPutRaw,
  type ApiRequestOptions,
} from "@/lib/api-client";

export type LeagueWebboardChannel = "general" | "predictions" | "results";
export type LeagueWebboardReaction = "fire" | "target" | "smile";

export type LeagueWebboardUser = {
  id: string | null;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  level: number | null;
  rank: string | null;
};

export type LeagueWebboardThread = {
  id: string;
  channel: LeagueWebboardChannel;
  title: string;
  body: string;
  bodyPreview: string;
  tags: string[];
  isPinned: boolean;
  isLocked: boolean;
  viewsCount: number;
  repliesCount: number;
  reactionsCount: number;
  reactions: Record<LeagueWebboardReaction, number>;
  myReaction: LeagueWebboardReaction | null;
  author: LeagueWebboardUser;
  createdAt: string | null;
  updatedAt: string | null;
  lastReplyAt: string | null;
};

export type LeagueWebboardReply = {
  id: string;
  body: string;
  author: LeagueWebboardUser;
  createdAt: string | null;
  updatedAt: string | null;
};

export type LeagueWebboardListResult = {
  threads: LeagueWebboardThread[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  channelCounts: Record<LeagueWebboardChannel, number>;
};

export type LeagueWebboardDetailResult = {
  thread: LeagueWebboardThread;
  replies: LeagueWebboardReply[];
};

export type CreateLeagueThreadInput = {
  channel: LeagueWebboardChannel;
  title: string;
  body: string;
  tags?: string[];
};

export type CreateLeagueReplyInput = {
  body: string;
};

const EMPTY_REACTIONS: Record<LeagueWebboardReaction, number> = {
  fire: 0,
  target: 0,
  smile: 0,
};

const EMPTY_COUNTS: Record<LeagueWebboardChannel, number> = {
  general: 0,
  predictions: 0,
  results: 0,
};

export async function getLeagueThreads(
  leagueId: string,
  input: {
    channel?: LeagueWebboardChannel;
    search?: string;
    page?: number;
    limit?: number;
  } = {},
  options?: ApiRequestOptions
): Promise<LeagueWebboardListResult> {
  const params = new URLSearchParams();
  if (input.channel) params.set("channel", input.channel);
  if (input.search?.trim()) params.set("search", input.search.trim());
  if (input.page) params.set("page", String(input.page));
  if (input.limit) params.set("limit", String(input.limit));
  const query = params.toString();
  const payload = await apiGetRaw<unknown>(
    `/leagues/${encodeURIComponent(leagueId)}/threads${query ? `?${query}` : ""}`,
    options
  );

  return normalizeThreadList(payload, input.page ?? 1, input.limit ?? 20);
}

export async function getLeagueThread(
  leagueId: string,
  threadId: string,
  options?: ApiRequestOptions
): Promise<LeagueWebboardDetailResult> {
  const payload = await apiGetRaw<unknown>(
    `/leagues/${encodeURIComponent(leagueId)}/threads/${encodeURIComponent(threadId)}`,
    options
  );

  return normalizeThreadDetail(payload);
}

export async function createLeagueThread(
  leagueId: string,
  input: CreateLeagueThreadInput,
  options?: ApiRequestOptions
) {
  const payload = await apiPostRaw<unknown, CreateLeagueThreadInput>(
    `/leagues/${encodeURIComponent(leagueId)}/threads`,
    input,
    options
  );

  return normalizeThread(extractThreadPayload(payload));
}

export async function createLeagueThreadReply(
  leagueId: string,
  threadId: string,
  input: CreateLeagueReplyInput,
  options?: ApiRequestOptions
) {
  const payload = await apiPostRaw<unknown, CreateLeagueReplyInput>(
    `/leagues/${encodeURIComponent(leagueId)}/threads/${encodeURIComponent(threadId)}/replies`,
    input,
    options
  );

  return normalizeReply(extractReplyPayload(payload));
}

export async function setLeagueThreadReaction(
  leagueId: string,
  threadId: string,
  reaction: LeagueWebboardReaction,
  options?: ApiRequestOptions
) {
  const payload = await apiPutRaw<unknown, { reaction: LeagueWebboardReaction }>(
    `/leagues/${encodeURIComponent(leagueId)}/threads/${encodeURIComponent(threadId)}/reaction`,
    { reaction },
    options
  );

  return normalizeReactionPayload(payload, reaction);
}

export async function deleteLeagueThreadReaction(
  leagueId: string,
  threadId: string,
  options?: ApiRequestOptions
) {
  const payload = await apiDeleteRaw<unknown>(
    `/leagues/${encodeURIComponent(leagueId)}/threads/${encodeURIComponent(threadId)}/reaction`,
    options
  );

  return normalizeReactionPayload(payload, null);
}

export async function setLeagueThreadPinned(
  leagueId: string,
  threadId: string,
  isPinned: boolean,
  options?: ApiRequestOptions
) {
  const payload = await apiPatchRaw<unknown, { isPinned: boolean }>(
    `/leagues/${encodeURIComponent(leagueId)}/threads/${encodeURIComponent(threadId)}/pin`,
    { isPinned },
    options
  );

  return normalizeThread(extractThreadPayload(payload));
}

export async function setLeagueThreadLocked(
  leagueId: string,
  threadId: string,
  isLocked: boolean,
  options?: ApiRequestOptions
) {
  const payload = await apiPatchRaw<unknown, { isLocked: boolean }>(
    `/leagues/${encodeURIComponent(leagueId)}/threads/${encodeURIComponent(threadId)}/lock`,
    { isLocked },
    options
  );

  return normalizeThread(extractThreadPayload(payload));
}

export async function deleteLeagueThread(
  leagueId: string,
  threadId: string,
  options?: ApiRequestOptions
) {
  await apiDeleteRaw<unknown>(
    `/leagues/${encodeURIComponent(leagueId)}/threads/${encodeURIComponent(threadId)}`,
    options
  );
}

function normalizeThreadList(
  payload: unknown,
  fallbackPage: number,
  fallbackLimit: number
): LeagueWebboardListResult {
  const envelope = unwrap(payload);
  const data = readArray(envelope?.data) ?? readArray(envelope?.threads) ?? [];
  const paginationRecord = readRecord(envelope?.pagination);

  return {
    threads: data.map(normalizeThread),
    pagination: {
      page: readNumber(paginationRecord?.page) ?? fallbackPage,
      limit: readNumber(paginationRecord?.limit) ?? fallbackLimit,
      total: readNumber(paginationRecord?.total) ?? data.length,
      totalPages:
        readNumber(paginationRecord?.totalPages, paginationRecord?.total_pages) ??
        1,
    },
    channelCounts: normalizeChannelCounts(envelope?.channelCounts),
  };
}

function normalizeThreadDetail(payload: unknown): LeagueWebboardDetailResult {
  const envelope = unwrap(payload);
  const thread = normalizeThread(extractThreadPayload(envelope));
  const replies =
    readArray(envelope?.replies) ??
    readArray(readRecord(envelope?.data)?.replies) ??
    [];

  return {
    thread,
    replies: replies.map(normalizeReply),
  };
}

function extractThreadPayload(payload: unknown) {
  const envelope = unwrap(payload);
  return (
    readRecord(envelope?.thread) ??
    readRecord(readRecord(envelope?.data)?.thread) ??
    readRecord(envelope?.data) ??
    readRecord(envelope) ??
    {}
  );
}

function extractReplyPayload(payload: unknown) {
  const envelope = unwrap(payload);
  return (
    readRecord(envelope?.reply) ??
    readRecord(readRecord(envelope?.data)?.reply) ??
    readRecord(envelope?.data) ??
    readRecord(envelope) ??
    {}
  );
}

function normalizeThread(raw: unknown): LeagueWebboardThread {
  const record = readRecord(raw) ?? {};
  const reactions = normalizeReactions(record.reactions);
  const repliesCount = readNumber(record.repliesCount, record.replies_count) ?? 0;
  const reactionsCount =
    readNumber(record.reactionsCount, record.reactions_count) ??
    Object.values(reactions).reduce((sum, value) => sum + value, 0);

  return {
    id: readString(record.id) ?? "",
    channel: normalizeChannel(record.channel),
    title: readString(record.title) ?? "",
    body: readString(record.body) ?? readString(record.bodyPreview, record.body_preview) ?? "",
    bodyPreview:
      readString(record.bodyPreview, record.body_preview) ??
      readString(record.body)?.slice(0, 150) ??
      "",
    tags: normalizeTags(record.tags),
    isPinned: readBoolean(record.isPinned, record.is_pinned) ?? false,
    isLocked: readBoolean(record.isLocked, record.is_locked) ?? false,
    viewsCount: readNumber(record.viewsCount, record.views_count) ?? 0,
    repliesCount,
    reactionsCount,
    reactions,
    myReaction: normalizeReaction(record.myReaction ?? record.my_reaction),
    author: normalizeUser(record.author ?? record.user),
    createdAt: readString(record.createdAt, record.created_at),
    updatedAt: readString(record.updatedAt, record.updated_at),
    lastReplyAt: readString(record.lastReplyAt, record.last_reply_at),
  };
}

function normalizeReply(raw: unknown): LeagueWebboardReply {
  const record = readRecord(raw) ?? {};

  return {
    id: readString(record.id) ?? "",
    body: readString(record.body) ?? "",
    author: normalizeUser(record.author ?? record.user),
    createdAt: readString(record.createdAt, record.created_at),
    updatedAt: readString(record.updatedAt, record.updated_at),
  };
}

function normalizeUser(raw: unknown): LeagueWebboardUser {
  const record = readRecord(raw) ?? {};
  const username = readString(record.username, record.displayName, record.display_name) ?? "";

  return {
    id: readString(record.id),
    username,
    displayName: readString(record.displayName, record.display_name),
    avatarUrl: readString(record.avatarUrl, record.avatar_url),
    level: readNumber(record.level),
    rank: readString(record.rank),
  };
}

function normalizeReactionPayload(
  payload: unknown,
  fallbackReaction: LeagueWebboardReaction | null
) {
  const envelope = unwrap(payload);
  const source = readRecord(envelope?.data) ?? envelope;
  const thread = readRecord(source?.thread);

  return {
    myReaction:
      normalizeReaction(
        source?.myReaction ??
          source?.my_reaction ??
          source?.reaction ??
          thread?.myReaction ??
          thread?.my_reaction
      ) ?? fallbackReaction,
    reactions: normalizeReactions(source?.reactions ?? thread?.reactions),
  };
}

function normalizeChannelCounts(raw: unknown): Record<LeagueWebboardChannel, number> {
  const record = readRecord(raw) ?? {};
  return {
    general: readNumber(record.general) ?? EMPTY_COUNTS.general,
    predictions: readNumber(record.predictions) ?? EMPTY_COUNTS.predictions,
    results: readNumber(record.results) ?? EMPTY_COUNTS.results,
  };
}

function normalizeReactions(raw: unknown): Record<LeagueWebboardReaction, number> {
  const record = readRecord(raw) ?? {};
  return {
    fire: readNumber(record.fire) ?? EMPTY_REACTIONS.fire,
    target: readNumber(record.target) ?? EMPTY_REACTIONS.target,
    smile: readNumber(record.smile) ?? EMPTY_REACTIONS.smile,
  };
}

function normalizeChannel(value: unknown): LeagueWebboardChannel {
  return value === "predictions" || value === "results" ? value : "general";
}

function normalizeReaction(value: unknown): LeagueWebboardReaction | null {
  return value === "fire" || value === "target" || value === "smile"
    ? value
    : null;
}

function normalizeTags(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((tag) => readString(tag)).filter((tag): tag is string => Boolean(tag));
  }
  if (typeof value === "string") {
    return value.split(",").map((tag) => tag.trim()).filter(Boolean);
  }
  return [];
}

function unwrap(payload: unknown) {
  const record = readRecord(payload);
  if (!record) return undefined;
  if (record.success === true && readRecord(record.data)) return readRecord(record.data);
  return record;
}

function readRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : undefined;
}

function readArray(value: unknown): unknown[] | undefined {
  return Array.isArray(value) ? value : undefined;
}

function readString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return null;
}

function readNumber(...values: unknown[]): number | null {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

function readBoolean(...values: unknown[]): boolean | null {
  for (const value of values) {
    if (typeof value === "boolean") return value;
    if (value === "true" || value === "1" || value === 1) return true;
    if (value === "false" || value === "0" || value === 0) return false;
  }
  return null;
}

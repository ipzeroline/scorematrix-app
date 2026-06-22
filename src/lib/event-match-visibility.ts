import type { EventMatchData } from "@/types/event";

export function getVisibleEventMatches<T extends Pick<EventMatchData, "date" | "status">>(
  matches: T[],
  now = Date.now()
) {
  return matches.filter((match) => isVisibleEventMatch(match, now));
}

export function isVisibleEventMatch(
  match: Pick<EventMatchData, "date" | "status">,
  now = Date.now()
) {
  if (match.status === "finished") return false;

  const matchDate = parseEventMatchDate(match.date);
  if (!matchDate) return true;

  return matchDate.getTime() >= now || match.status === "live";
}

export function parseEventMatchDate(dateStr: string) {
  if (!dateStr || typeof dateStr !== "string") return null;

  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  const directDate = new Date(trimmed);
  if (Number.isFinite(directDate.getTime())) return directDate;

  const normalizedDate = new Date(trimmed.replace(" ", "T"));
  if (Number.isFinite(normalizedDate.getTime())) return normalizedDate;

  return null;
}

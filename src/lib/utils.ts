export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export const THAILAND_TIME_ZONE = "Asia/Bangkok";
export const THAILAND_TIME_ZONE_ABBR = "ICT";
export const THAILAND_TIME_ZONE_LABEL = "Asia/Bangkok (ICT, UTC+7)";

export function formatDate(date: string | Date, locale = "en-US"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    timeZone: THAILAND_TIME_ZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(date: string | Date, locale = "en-US"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString(locale, {
    timeZone: THAILAND_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDateTime(date: string | Date, locale = "en-US"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString(locale, {
    timeZone: THAILAND_TIME_ZONE,
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatMatchTimeWithZone(date: string | Date, locale = "en-US"): string {
  return `${formatTime(date, locale)} ${THAILAND_TIME_ZONE_ABBR}`;
}

export function formatMatchDateTimeWithZone(date: string | Date, locale = "en-US"): string {
  return `${formatDateTime(date, locale)} ${THAILAND_TIME_ZONE_ABBR}`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString();
}

export function timeAgo(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function countdown(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = d.getTime() - Date.now();
  if (diff <= 0) return "Starting...";
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

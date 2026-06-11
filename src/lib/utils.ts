export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export const THAILAND_TIME_ZONE = "Asia/Bangkok";
export const THAILAND_TIME_ZONE_ABBR = "UTC+7";
export const THAILAND_TIME_ZONE_LABEL = "Asia/Bangkok (UTC+7)";

export function getThailandDateKey(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: THAILAND_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

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

/**
 * Locale-aware relative time ("2 ชั่วโมงที่แล้ว", "2 hours ago").
 * Falls back to an absolute date for anything older than ~30 days.
 */
export function formatRelativeTime(
  date: string | Date,
  locale = "en-US"
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";

  const diffSeconds = Math.round((d.getTime() - Date.now()) / 1000);
  const absSeconds = Math.abs(diffSeconds);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  const divisions: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "second"],
    [3600, "minute"],
    [86400, "hour"],
    [2592000, "day"],
  ];

  if (absSeconds < 60) return rtf.format(Math.min(diffSeconds, -1), "second");
  for (let i = 1; i < divisions.length; i++) {
    const [limit, unit] = divisions[i];
    if (absSeconds < limit) {
      const value = Math.round(diffSeconds / divisions[i - 1][0]);
      return rtf.format(value, unit);
    }
  }
  return formatDate(d, locale);
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

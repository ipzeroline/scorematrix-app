const API_SPORTS_MEDIA_HOST = "media.api-sports.io";
const FLAG_CDN_HOST = "flagcdn.com";
const API_SPORTS_MEDIA_BASE_URL = `https://${API_SPORTS_MEDIA_HOST}`;

export function proxyFootballMediaUrl(src?: string | null): string | null {
  if (!src) return null;

  if (src.startsWith("/football/") || src.startsWith("/flags/")) {
    return `${API_SPORTS_MEDIA_BASE_URL}${src}`;
  }

  try {
    const url = new URL(src);

    if (url.hostname === API_SPORTS_MEDIA_HOST) {
      return src;
    }

    if (url.hostname === FLAG_CDN_HOST) {
      return `/api/football/flags${url.pathname}`;
    }
  } catch {
    return src;
  }

  return src;
}

export function proxyFootballMediaValue<T>(value: T): T {
  if (typeof value === "string") {
    return (value ? proxyFootballMediaUrl(value) : value) as T;
  }

  if (Array.isArray(value)) {
    return value.map(proxyFootballMediaValue) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        proxyFootballMediaValue(nestedValue),
      ])
    ) as T;
  }

  return value;
}

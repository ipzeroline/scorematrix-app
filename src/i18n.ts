export const LOCALES = [
  { code: "th", label: "Thai", native: "ไทย" },
  { code: "en", label: "English", native: "English" },
  { code: "lo", label: "Lao", native: "ລາວ" },
  { code: "my", label: "Burmese", native: "မြန်မာ" },
  { code: "km", label: "Khmer", native: "ខ្មែរ" },
  { code: "zh", label: "Chinese", native: "中文" },
] as const;

export const DEFAULT_LOCALE = "th";

export const LOCALE_CODES = LOCALES.map((locale) => locale.code);

export const LOCALE_MATCHER = `/(${LOCALE_CODES.join("|")})/:path*`;

export type LocaleCode = (typeof LOCALE_CODES)[number];

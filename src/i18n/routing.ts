import { defineRouting } from 'next-intl/routing';
import { DEFAULT_LOCALE, LOCALE_CODES } from '@/i18n';

export const routing = defineRouting({
  locales: LOCALE_CODES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'always',
  localeDetection: false,
});

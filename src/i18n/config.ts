import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

import ar from './locales/ar.json';
import bn from './locales/bn.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import ko from './locales/ko.json';
import pl from './locales/pl.json';
import ru from './locales/ru.json';
import ur from './locales/ur.json';
import zhHans from './locales/zh-Hans.json';

// TODO: add Haitian Creole (`ht`) once we have a translation source.
// LibreTranslate does not currently support it — needs another provider
// or manual translation.
//
// TODO: restore Traditional Chinese (`zh-Hant`). Removed 2026-07-24
// because the map's tile renderer failed to display Traditional CJK
// glyphs, blanking the map when this locale was selected. Locale
// files, static layer files, and Directus language row for `zh-Hant`
// are all removed; browser tags that would previously map to `zh-Hant`
// now fall through to `zh-Hans`.
export const SUPPORTED_LANGUAGES = [
  'ar', 'bn', 'en', 'es', 'fr', 'ko', 'pl', 'ru', 'ur', 'zh-Hans',
] as const;

export const RTL_LANGUAGES = new Set<string>(['ar', 'ur']);

function detectLanguage(): string {
  const params = new URLSearchParams(window.location.search);
  const paramLang = params.get('lang');
  if (paramLang && (SUPPORTED_LANGUAGES as readonly string[]).includes(paramLang)) {
    return paramLang;
  }

  // Browser preferred language — try the full BCP-47 tag first (matches
  // zh-CN → zh-Hans etc.), then the base prefix.
  const raw = navigator.language;
  const mapped = mapBrowserTagToSupported(raw);
  if (mapped) return mapped;

  return 'en';
}

function mapBrowserTagToSupported(tag: string): string | null {
  const lower = tag.toLowerCase();
  const supportedLower = new Set(SUPPORTED_LANGUAGES.map((s) => s.toLowerCase()));

  // All Chinese variants → Simplified. Traditional (zh-Hant) is
  // temporarily unsupported (see the TODO above).
  if (lower === 'zh' || lower.startsWith('zh-')) return 'zh-Hans';

  // For everything else, drop the region and match by prefix
  const prefix = lower.split('-')[0];
  if (supportedLower.has(prefix)) {
    // Find the canonical casing from SUPPORTED_LANGUAGES
    return SUPPORTED_LANGUAGES.find((s) => s.toLowerCase() === prefix) ?? null;
  }
  return null;
}

i18n.use(initReactI18next).init({
  resources: {
    ar: {translation: ar},
    bn: {translation: bn},
    en: {translation: en},
    es: {translation: es},
    fr: {translation: fr},
    ko: {translation: ko},
    pl: {translation: pl},
    ru: {translation: ru},
    ur: {translation: ur},
    'zh-Hans': {translation: zhHans},
  },
  lng: detectLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

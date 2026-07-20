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
import zhHant from './locales/zh-Hant.json';

// TODO: add Haitian Creole (`ht`) once we have a translation source.
// LibreTranslate does not currently support it — needs another provider
// or manual translation.
export const SUPPORTED_LANGUAGES = [
  'ar', 'bn', 'en', 'es', 'fr', 'ko', 'pl', 'ru', 'ur', 'zh-Hans', 'zh-Hant',
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

  // Simplified Chinese variants
  if (['zh-cn', 'zh-sg', 'zh-hans', 'zh-hans-cn', 'zh-hans-sg'].some((t) => lower.startsWith(t))) {
    return 'zh-Hans';
  }
  // Traditional Chinese variants
  if (['zh-tw', 'zh-hk', 'zh-mo', 'zh-hant', 'zh-hant-tw', 'zh-hant-hk'].some((t) => lower.startsWith(t))) {
    return 'zh-Hant';
  }
  // Generic zh → Simplified
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
    'zh-Hant': {translation: zhHant},
  },
  lng: detectLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

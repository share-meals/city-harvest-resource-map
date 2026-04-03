import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

import en from './locales/en.json';
import es from './locales/es.json';
import zh from './locales/zh.json';
import ko from './locales/ko.json';

const SUPPORTED_LANGUAGES = ['en', 'es', 'zh', 'ko'];

function detectLanguage(): string {
  // 1. Check URL query parameter (?lang=es)
  const params = new URLSearchParams(window.location.search);
  const paramLang = params.get('lang');
  if (paramLang && SUPPORTED_LANGUAGES.includes(paramLang)) {
    return paramLang;
  }

  // 2. Check browser preferred language
  const browserLang = navigator.language.split('-')[0];
  if (SUPPORTED_LANGUAGES.includes(browserLang)) {
    return browserLang;
  }

  // 3. Default to English
  return 'en';
}

i18n.use(initReactI18next).init({
  resources: {
    en: {translation: en},
    es: {translation: es},
    zh: {translation: zh},
    ko: {translation: ko},
  },
  lng: detectLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

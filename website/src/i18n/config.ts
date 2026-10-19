import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी' },
] as const;

export type SupportedLanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];

// Every src/i18n/locales/<lng>/<namespace>.json file is picked up automatically —
// add a new namespace by adding the matching en/ and hi/ JSON files, no config change needed.
const enModules = import.meta.glob('./locales/en/*.json', { eager: true }) as Record<
  string,
  { default: Record<string, unknown> }
>;
const hiModules = import.meta.glob('./locales/hi/*.json', { eager: true }) as Record<
  string,
  { default: Record<string, unknown> }
>;

function buildResources(modules: Record<string, { default: Record<string, unknown> }>) {
  const result: Record<string, Record<string, unknown>> = {};
  for (const path in modules) {
    const match = path.match(/([^/]+)\.json$/);
    if (match) {
      result[match[1]] = modules[path].default;
    }
  }
  return result;
}

const enResources = buildResources(enModules);
const hiResources = buildResources(hiModules);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: false,
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi'],
    defaultNS: 'common',
    ns: Object.keys(enResources),
    resources: {
      en: enResources,
      hi: hiResources,
    },
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'eternal_lang',
    },
  });

export default i18n;

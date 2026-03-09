import React, { useState, useEffect, createContext, useContext, ReactNode, FC } from 'react';

// --- Types ---
type Translations = Record<string, string | Record<string, any>>;
type TranslationStore = Record<string, Translations>;
type InterpolationParams = Record<string, string | number>;

interface I18nConfig {
  translations: TranslationStore;
  defaultLocale: string;
}

// --- Private State ---
let globalLocale: string = 'en';
let globalTranslations: TranslationStore = {};
const listeners = new Set<() => void>();

// --- Core API ---
const getNested = (obj: Translations, path: string): string | undefined => {
  return path.split('.').reduce<string | undefined | Translations>((acc, part) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, string | Translations>)[part];
    }
    return undefined;
  }, obj) as string | undefined;
};

/**
 * Initializes the i18n service. This should be called once when the app starts.
 * @param config - The configuration object with translations and a default locale.
 */
export const createI18n = (config: I18nConfig): void => {
  globalTranslations = config.translations;
  globalLocale = config.defaultLocale;
};

/**
 * Sets the current locale and notifies all subscribed components.
 * @param locale - The new locale string (e.g., 'es').
 */
export const setLocale = (locale: string): void => {
  if (globalTranslations[locale]) {
    globalLocale = locale;
    listeners.forEach(listener => listener());
  } else {
    console.warn(`[i18n] Locale "${locale}" not found in translations.`);
  }
};

/**
 * Gets the current active locale.
 * @returns The current locale string.
 */
export const getLocale = (): string => globalLocale;

/**
 * The main translation function.
 * @param key - The key for the translation string (e.g., 'greeting.welcome').
 * @param params - Optional parameters for interpolation (e.g., { name: 'Alex' }).
 * @returns The translated and interpolated string.
 */
export const t = (key: string, params?: InterpolationParams): string => {
  const currentTranslations = globalTranslations[globalLocale] || globalTranslations[Object.keys(globalTranslations)[0]] || {};
  let translated = getNested(currentTranslations, key) || key;

  if (params) {
    Object.entries(params).forEach(([paramKey, value]) => {
      translated = translated.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(value));
    });
  }
  return translated;
};

// --- React Integration ---
const I18nContext = createContext({ locale: globalLocale, t });

/**
 * A React hook that provides the current locale and the translation function `t`.
 * Components using this hook will re-render when the locale changes.
 * @returns An object containing the current `locale` and the `t` function.
 */
export const useTranslation = () => {
  const [locale, setCurrentLocale] = useState(globalLocale);

  useEffect(() => {
    const listener = () => setCurrentLocale(globalLocale);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return { locale, t };
};

/**
 * A provider component to wrap your application and provide i18n context.
 * While not strictly necessary due to the singleton nature of this utility,
 * it can be useful for context-based updates if preferred.
 */
export const I18nProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const { locale, t: translationFunc } = useTranslation();
    const value = { locale, t: translationFunc };
    // Fix: Replaced JSX with React.createElement because this is a .ts file, not .tsx.
    // This resolves parsing errors where JSX tags were misinterpreted as operators.
    return React.createElement(I18nContext.Provider, { value }, children);
};
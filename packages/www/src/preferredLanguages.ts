import { GoogleLanguage, isGoogleLanguage } from '@vocably/model';
import { searchConfig } from './constants';

/**
 * The language the visitor most likely wants translations in: the one they
 * last picked on this website, or else the first supported one their browser
 * asks for.
 */
export const getPreferredTargetLanguage = (): GoogleLanguage => {
  const localStorageTargetLanguage = localStorage.getItem(
    searchConfig.targetLanguageLocalStorageKey
  );
  if (isGoogleLanguage(localStorageTargetLanguage ?? '')) {
    return localStorageTargetLanguage as GoogleLanguage;
  }

  const navigatorLanguage = navigator.languages.find((language) =>
    isGoogleLanguage(language)
  );
  if (navigatorLanguage) {
    return navigatorLanguage as GoogleLanguage;
  }

  const anotherNavigatorLanguage = navigator.language.split('-')[0];
  if (isGoogleLanguage(anotherNavigatorLanguage)) {
    return anotherNavigatorLanguage;
  }

  return 'en';
};

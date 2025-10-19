import { getCurrentLocale } from '@/ui/hooks/useI18n';
import { changeLanguage, initI18n, t } from '@unisat/i18n';

import preferenceService from './preference';

initI18n('en');

if (chrome && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((message) => {
    if (message && message.type === 'CHANGE_LANGUAGE' && message.locale) {
      // Map zh_CN to zh_TW since @unisat/i18n only supports zh_TW
      const mappedLocale = message.locale === 'zh_CN' ? 'zh_TW' : message.locale;
      
      changeLanguage(mappedLocale);
      // Also update chrome storage
      chrome.storage.local.set({ i18nextLng: mappedLocale });
      // Synchronize with PreferenceService (use mapped locale)
      try {
        preferenceService.setLocale(mappedLocale);
      } catch (error) {
        console.error('Failed to update locale in preference service:', error);
      }
    }
  });
}

const i18nCompatObject = {
  changeLanguage,
  t,
  getCurrentLocale
};

export { getCurrentLocale, t };

export default i18nCompatObject;

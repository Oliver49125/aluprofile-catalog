import React, { createContext, useContext, useEffect, useState } from 'react';
import { API_BASE } from './utils/apiBase';

export type Lang = 'en' | 'de';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const GERMAN_TIMEZONES = [
  'Europe/Vienna',
  'Europe/Berlin',
  'Europe/Busingen',
  'Europe/Zurich',
  'Europe/Vaduz',
  'Europe/Luxembourg',
];

export function detectBrowserLanguage(): Lang {
  // 1. Check URL query parameters (?lang=de or ?lang=en)
  if (typeof window !== 'undefined' && window.location?.search) {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get('lang')?.toLowerCase();
      if (urlLang === 'de' || urlLang === 'en') {
        try {
          window.localStorage.setItem('aluprofile_lang', urlLang);
          window.localStorage.setItem('aluprofile_lang_manual', 'true');
        } catch {
          // ignore
        }
        return urlLang;
      }
    } catch {
      // ignore
    }
  }

  // 2. Check localStorage if user has an explicit manual saved preference
  if (typeof window !== 'undefined') {
    try {
      const saved = window.localStorage.getItem('aluprofile_lang');
      const isManual = window.localStorage.getItem('aluprofile_lang_manual') === 'true';
      if ((saved === 'en' || saved === 'de') && isManual) {
        return saved;
      }
    } catch {
      // ignore
    }
  }

  // 3. Browser Languages (navigator.languages and navigator.language)
  if (typeof navigator !== 'undefined') {
    try {
      const candidateLangs: string[] = [
        ...(Array.isArray(navigator.languages) ? navigator.languages : []),
        navigator.language,
        (navigator as any).userLanguage,
        (navigator as any).browserLanguage,
      ].filter(Boolean);

      // Check all preferred browser locales
      for (const raw of candidateLangs) {
        const l = raw.toLowerCase().trim();
        // Starts with 'de' (e.g. 'de', 'de-de', 'de-at', 'de-ch', 'de-lu', 'de-li')
        if (l === 'de' || l.startsWith('de-') || l.startsWith('de_')) {
          return 'de';
        }
        // Regional German-speaking locale code (e.g. 'en-at', 'en-de', 'en-ch')
        if (
          l.endsWith('-at') ||
          l.endsWith('-de') ||
          l.endsWith('-ch') ||
          l.endsWith('-li') ||
          l.endsWith('-lu')
        ) {
          return 'de';
        }
      }
    } catch {
      // ignore
    }
  }

  // 4. System Timezone detection for German-speaking countries
  if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) {
        const lowerTz = tz.toLowerCase();
        if (
          GERMAN_TIMEZONES.some((gtz) => lowerTz === gtz.toLowerCase()) ||
          lowerTz.includes('vienna') ||
          lowerTz.includes('berlin') ||
          lowerTz.includes('zurich')
        ) {
          return 'de';
        }
      }
    } catch {
      // ignore
    }
  }

  // 5. Default to 'en' for English-speaking countries and all other international visitors
  return 'en';
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    return detectBrowserLanguage();
  });

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    try {
      window.localStorage.setItem('aluprofile_lang', newLang);
      window.localStorage.setItem('aluprofile_lang_manual', 'true');
      window.dispatchEvent(new CustomEvent('aluprofile_lang_change', { detail: newLang }));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    // 1. Keep <html lang="..."> attribute in sync for SEO and accessibility
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang === 'de' ? 'de-DE' : 'en-US';
    }
  }, [lang]);

  useEffect(() => {
    // 2. Cross-tab and custom event listeners
    const handleCustomChange = (e: any) => {
      if (e.detail === 'en' || e.detail === 'de') {
        setLangState(e.detail);
      }
    };
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'aluprofile_lang' && (e.newValue === 'en' || e.newValue === 'de')) {
        setLangState(e.newValue);
      }
    };

    window.addEventListener('aluprofile_lang_change', handleCustomChange);
    window.addEventListener('storage', handleStorageChange);

    // 3. Background IP / Geo Country verification (only if user hasn't manually set preference)
    const isManual = window.localStorage.getItem('aluprofile_lang_manual') === 'true';
    const hasUrlLang = new URLSearchParams(window.location.search).has('lang');

    if (!isManual && !hasUrlLang) {
      let tz = '';
      try {
        tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      } catch {
        // ignore
      }

      fetch(`${API_BASE}/public/detect-language?timezone=${encodeURIComponent(tz)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.lang && (data.lang === 'de' || data.lang === 'en')) {
            // Re-verify that user did not manually pick language while request was in flight
            if (window.localStorage.getItem('aluprofile_lang_manual') !== 'true') {
              setLangState((current) => {
                if (current !== data.lang) {
                  try {
                    window.localStorage.setItem('aluprofile_lang', data.lang);
                    window.dispatchEvent(
                      new CustomEvent('aluprofile_lang_change', { detail: data.lang }),
                    );
                  } catch {
                    // ignore
                  }
                  return data.lang;
                }
                return current;
              });
            }
          }
        })
        .catch(() => {});
    }

    return () => {
      window.removeEventListener('aluprofile_lang_change', handleCustomChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

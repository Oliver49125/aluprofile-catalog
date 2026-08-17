import React, { createContext, useContext, useEffect, useState } from 'react';

export type Lang = 'en' | 'de';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const saved = window.localStorage.getItem('aluprofile_lang');
      if (saved === 'en' || saved === 'de') return saved;
    } catch (e) {
      // ignore
    }
    return 'en';
  });

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    try {
      window.localStorage.setItem('aluprofile_lang', newLang);
      window.dispatchEvent(new CustomEvent('aluprofile_lang_change', { detail: newLang }));
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
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

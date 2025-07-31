"use client";

import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import type { Language, TranslationKey } from '@/lib/translations';
import { translations } from '@/lib/translations';

type LanguageContextType = {
  lang: Language;
  dir: 'ltr' | 'rtl';
  t: (key: TranslationKey) => string;
  toggleLanguage: () => void;
};

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    const storedLang = localStorage.getItem('language') as Language;
    if (storedLang && ['en', 'ar'].includes(storedLang)) {
      setLang(storedLang);
    }
  }, []);

  const dir = useMemo(() => (lang === 'ar' ? 'rtl' : 'ltr'), [lang]);

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'ar' : 'en';
    setLang(newLang);
    localStorage.setItem('language', newLang);
  };

  const t = (key: TranslationKey): string => {
    return translations[lang][key] || translations['en'][key];
  };

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const value = {
    lang,
    dir,
    t,
    toggleLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

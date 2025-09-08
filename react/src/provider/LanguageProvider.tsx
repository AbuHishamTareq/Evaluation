// src/components/LanguageProvider.tsx
import { useEffect, useState } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import en from '../lang/en';
import ar from '../lang/ar';
import type { Language, LanguageProviderProps } from '../types/types';

const translations: Record<Language, Record<string, string>> = {
  en,
  ar,
};


const getInitialLanguage = (): Language => {
  const saved = localStorage.getItem('language');
  return saved === 'ar' ? 'ar' : 'en'; // fallback to 'en'
};

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguageStatus] = useState<Language>(getInitialLanguage);

  // Whenever language changes, update localStorage
  const setLanguage = (lang: Language) => {
    setLanguageStatus(lang);
    localStorage.setItem('language', lang);
  };

  // Optional: ensure <html dir> is correct (for RTL/LTR layout)
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);
  
  const t = (key: string): string => {
    const lexicon = translations[language];
    return lexicon[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div
        className={language === 'ar' ? 'rtl font-arabic' : 'ltr'}
        dir={language === 'ar' ? 'rtl' : 'ltr'}
        style={{
          fontFamily:
            language === 'ar'
              ? 'Janna'
              : 'inherit',
        }}
      >
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

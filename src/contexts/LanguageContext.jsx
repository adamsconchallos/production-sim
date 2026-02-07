import React, { createContext, useContext, useState, useEffect } from 'react';
import { tutorial as tutorialEN } from '../translations/en/tutorial';
import { tutorial as tutorialES } from '../translations/es/tutorial';

const LanguageContext = createContext();

const translations = {
  en: {
    tutorial: tutorialEN
  },
  es: {
    tutorial: tutorialES
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('stratfi_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('stratfi_lang', lang);
  }, [lang]);

  const t = (path) => {
    const keys = path.split('.');
    let result = translations[lang];
    for (const key of keys) {
      if (result && result[key]) {
        result = result[key];
      } else {
        // Return key as fallback if translation missing
        return key; 
      }
    }
    return result || path;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { translations, Language, TranslationKey } from '@/constants/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
});

const STORE_KEY = 'scrible_language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load saved language
    const loadLang = async () => {
      try {
        let saved;
        if (Platform.OS === 'web') {
          saved = window.localStorage.getItem(STORE_KEY);
        } else {
          saved = await SecureStore.getItemAsync(STORE_KEY);
        }
        if (saved === 'es' || saved === 'en' || saved === 'fi') {
          setLanguageState(saved);
        }
      } catch (e) {
        // Ignore read errors
      } finally {
        setIsLoaded(true);
      }
    };
    loadLang();
  }, []);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    try {
      if (Platform.OS === 'web') {
        window.localStorage.setItem(STORE_KEY, lang);
      } else {
        await SecureStore.setItemAsync(STORE_KEY, lang);
      }
    } catch (e) {
      // Ignore write errors
    }
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  // Prevent flicker before language is loaded
  if (!isLoaded) return null;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);

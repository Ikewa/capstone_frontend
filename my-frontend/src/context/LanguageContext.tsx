/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useState, useContext, type ReactNode, useEffect } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  translate: (text: string) => Promise<string>;
  translateSync: (text: string) => string;
  translateBatch: (texts: string[]) => Promise<string[]>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

// Enhanced translation cache with better structure
const translationCache = new Map<string, Map<string, string>>();

// Initialize cache for languages
const getLanguageCache = (lang: string) => {
  if (!translationCache.has(lang)) {
    translationCache.set(lang, new Map<string, string>());
  }
  return translationCache.get(lang)!;
};

// Debounce helper to batch translations
let batchQueue: { text: string; resolve: (value: string) => void; reject: (reason?: any) => void }[] = [];
let batchTimeout: ReturnType<typeof setTimeout> | null = null;

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
  };

  // Internal batch translation function - FIXED VERSION
  const translateBatchInternal = async (texts: string[], lang: string): Promise<string[]> => {
    const cache = getLanguageCache(lang);
    const results: string[] = [];
    const uncachedTexts: string[] = [];
    const uncachedIndices: number[] = [];

    // Check cache first
    texts.forEach((text, index) => {
      if (cache.has(text)) {
        results[index] = cache.get(text)!;
      } else {
        uncachedTexts.push(text);
        uncachedIndices.push(index);
      }
    });

    // If everything is cached, return immediately
    if (uncachedTexts.length === 0) return results;

    // ✅ Translate each text individually to avoid separator conflicts
    for (let i = 0; i < uncachedTexts.length; i++) {
      const text = uncachedTexts[i];
      const originalIndex = uncachedIndices[i];
      
      try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        // Parse response
        const translated = data[0][0][0];
        
        results[originalIndex] = translated;
        cache.set(text, translated);
        
        // Small delay to avoid rate limiting (only 10ms)
        if (i < uncachedTexts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      } catch (error) {
        console.error('Translation error for:', text, error);
        results[originalIndex] = text; // Fallback to original
      }
    }

    return results;
  };

  // Process batched translations
  const processBatch = async (lang: string) => {
    if (batchQueue.length === 0) return;

    const currentBatch = [...batchQueue];
    batchQueue = [];

    const textsToTranslate = currentBatch.map(item => item.text);
    
    try {
      const translations = await translateBatchInternal(textsToTranslate, lang);
      
      currentBatch.forEach((item, index) => {
        item.resolve(translations[index]);
      });
    } catch (error) {
      currentBatch.forEach((item) => {
        item.reject(error);
      });
    }
  };

  // Translate text using Google Translate API (with auto-batching)
  const translate = async (text: string): Promise<string> => {
    if (!text) return '';
    if (language === 'en') return text;

    // Check cache first
    const cache = getLanguageCache(language);
    if (cache.has(text)) {
      return cache.get(text)!;
    }

    // Add to batch queue
    return new Promise((resolve, reject) => {
      batchQueue.push({ text, resolve, reject });

      // Clear existing timeout
      if (batchTimeout) {
        clearTimeout(batchTimeout);
      }

      // Process batch after a short delay (batching window)
      batchTimeout = setTimeout(() => {
        processBatch(language);
      }, 50); // 50ms batching window
    });
  };

  // Batch translation API (for explicit batching)
  const translateBatch = async (texts: string[]): Promise<string[]> => {
    if (texts.length === 0) return [];
    if (language === 'en') return texts;

    return translateBatchInternal(texts, language);
  };

  // Synchronous translation for already cached items
  const translateSync = (text: string): string => {
    if (!text) return '';
    if (language === 'en') return text;

    const cache = getLanguageCache(language);
    return cache.get(text) || text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translate, translateSync, translateBatch }}>
      {children}
    </LanguageContext.Provider>
  );
};

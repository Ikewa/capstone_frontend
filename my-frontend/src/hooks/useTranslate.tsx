import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

export const useTranslate = (text: string | string[]) => {
  const { language, translate, translateBatch } = useLanguage();
  const [translated, setTranslated] = useState<string | string[]>(text);
  const [loading, setLoading] = useState(false);
  
  // Use ref to track if component is mounted (prevent memory leaks)
  const isMountedRef = useRef(true);
  
  // Stable reference for text to avoid infinite loops
  const textRef = useRef(text);
  const textKey = Array.isArray(text) ? JSON.stringify(text) : text;

  useEffect(() => {
    isMountedRef.current = true;
    textRef.current = text;

    return () => {
      isMountedRef.current = false;
    };
  }, [text]);

  useEffect(() => {
    const translateText = async () => {
      // If English, no translation needed
      if (language === 'en') {
        if (isMountedRef.current) {
          setTranslated(text);
        }
        return;
      }

      setLoading(true);

      try {
        if (Array.isArray(text)) {
          // ✅ USE BATCH TRANSLATION for arrays (much faster!)
          const results = await translateBatch(text);
          
          if (isMountedRef.current) {
            setTranslated(results);
          }
        } else {
          // Single string translation (auto-batches with other translate calls)
          const result = await translate(text);
          
          if (isMountedRef.current) {
            setTranslated(result);
          }
        }
      } catch (error) {
        console.error('Translation error:', error);
        
        if (isMountedRef.current) {
          setTranslated(text); // Fallback to original text
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    translateText();
  }, [textKey, language, translate, translateBatch]);

  return { translated, loading };
};
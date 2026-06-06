import { createContext, useContext, useEffect, useState } from 'react';
import { tr, tmdbLangOf } from '../lib/i18n';
import { setTmdbLang } from '../lib/tmdb';

const LanguageContext = createContext(null);
export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem('jfz_lang') || 'en');

  useEffect(() => {
    setTmdbLang(tmdbLangOf(lang));
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    document.body.classList.toggle('lang-he', lang === 'he');
    localStorage.setItem('jfz_lang', lang);
  }, [lang]);

  const setLang = (l) => setLangState(l);
  const toggle = () => setLangState((l) => (l === 'he' ? 'en' : 'he'));
  const t = (key) => tr(lang, key);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle, t, tmdbLang: tmdbLangOf(lang) }}>
      {children}
    </LanguageContext.Provider>
  );
}

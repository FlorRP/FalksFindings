import { createContext, useContext, useState } from 'react';
import { translations, Lang, Translations } from '../lib/translations';

type LangCtx = {
  lang: Lang;
  t: Translations;
  toggleLang: () => void;
};

const LanguageContext = createContext<LangCtx>({
  lang: 'en',
  t: translations.en,
  toggleLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem('ff-lang');
    return (saved === 'en' || saved === 'es') ? saved : 'en';
  });

  const toggleLang = () => {
    setLang(l => {
      const next = l === 'en' ? 'es' : 'en';
      localStorage.setItem('ff-lang', next);
      return next;
    });
  };

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}

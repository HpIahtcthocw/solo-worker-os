'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, type Lang, type TranslationDict } from '@/lib/i18n';

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: TranslationDict;
}

const Ctx = createContext<LangCtx | null>(null);

export function LanguageProvider({
  children,
  initialLang = 'en',
}: {
  children: ReactNode;
  initialLang?: Lang;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    // Sync with cookie in case it was changed in another tab
    const cookieMatch = document.cookie.match(/solo-lang=(en|zh)/);
    const saved = cookieMatch?.[1] as Lang | undefined;
    if (saved && saved !== lang) setLangState(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('solo-lang', l);
    document.cookie = `solo-lang=${l};path=/;max-age=31536000`;
  };

  return (
    <Ctx.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </Ctx.Provider>
  );
}

export function useLang(): LangCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}


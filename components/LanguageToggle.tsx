'use client';

import { useLang } from './LanguageProvider';
import { type Lang } from '@/lib/i18n';

export default function LanguageToggle() {
  const { lang, setLang } = useLang();
  const options: { value: Lang; label: string }[] = [
    { value: 'en', label: 'EN' },
    { value: 'zh', label: '\u4e2d' },
  ];
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-white/[0.06] bg-white/[0.03] p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => setLang(o.value)}
          className={`rounded-md px-2 py-0.5 text-[11px] font-bold transition-all duration-200 ${
            lang === o.value
              ? 'bg-amber-400/20 text-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.15)]'
              : 'text-white/40 hover:text-white/70'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

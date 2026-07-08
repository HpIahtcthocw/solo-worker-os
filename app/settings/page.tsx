'use client';

import { useState, useEffect } from 'react';
import { useLang } from '@/components/LanguageProvider';
import { translations } from '@/lib/i18n';

interface UserPrefs {
  theme: 'dark';
  compactMode: boolean;
  showTimestamps: boolean;
  defaultSuggestedPrompts: boolean;
}

const DEFAULT_PREFS: UserPrefs = {
  theme: 'dark',
  compactMode: false,
  showTimestamps: true,
  defaultSuggestedPrompts: true,
};

function loadPrefs(): UserPrefs {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem('solo-worker-prefs');
    if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_PREFS;
}

function savePrefs(prefs: UserPrefs) {
  localStorage.setItem('solo-worker-prefs', JSON.stringify(prefs));
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between">
      <span className="text-[14px] text-white/70">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 ${
          checked ? 'bg-amber-400/90' : 'bg-white/10'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </label>
  );
}

const SHORTCUTS_KEYS = [
  ['⌘', 'K'],
  ['↑', '↓'],
  ['↵'],
  ['Esc'],
  ['⌘', '↵'],
] as const;

export default function SettingsPage() {
  const { lang, setLang } = useLang();
  const t = translations[lang];
  const s = t.settings;
  const [prefs, setPrefs] = useState<UserPrefs>(DEFAULT_PREFS);
  const [saved, setSaved] = useState(false);

  // Avatar state
  const [avatarDesc, setAvatarDesc] = useState('');
  const [avatarPrompt, setAvatarPrompt] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load saved avatar
  useEffect(() => {
    try {
      const savedAvatar = localStorage.getItem('solo-worker-avatar');
      if (savedAvatar) setAvatarUrl(savedAvatar);
    } catch {}
  }, []);

  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

  function update<K extends keyof UserPrefs>(key: K, value: UserPrefs[K]) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    savePrefs(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function generateAvatarPrompt() {
    if (!avatarDesc.trim()) return;
    setAvatarLoading(true);
    try {
      const res = await fetch('/api/avatar/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: avatarDesc }),
      });
      const data = await res.json() as { prompt?: string; error?: string };
      if (data.prompt) setAvatarPrompt(data.prompt);
    } catch {}
    setAvatarLoading(false);
  }

  async function copyPrompt() {
    if (!avatarPrompt) return;
    await navigator.clipboard.writeText(avatarPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function saveAvatar() {
    if (!avatarUrl.trim()) return;
    localStorage.setItem('solo-worker-avatar', avatarUrl.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function resetAvatar() {
    setAvatarUrl('');
    localStorage.removeItem('solo-worker-avatar');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const SHORTCUTS = SHORTCUTS_KEYS.map((keys, i) => ({
    keys,
    description: [s.shortcutPalette, s.shortcutNavigate, s.shortcutSelect, s.shortcutClose, s.shortcutSend][i],
  }));

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-[26px] font-extrabold tracking-tight text-white">{s.title}</h1>
          {saved && (
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-0.5 text-[11px] font-semibold text-emerald-400">
              {s.saved}
            </span>
          )}
        </div>
        <p className="text-[14px] text-white/40">{s.prefsDesc}</p>
      </div>

      {/* Language */}
      <section className="glass rounded-2xl p-6 space-y-5">
        <h2 className="text-[13px] font-bold uppercase tracking-widest text-white/30">{s.languageSection}</h2>
        <div className="flex gap-3">
          {(['en', 'zh'] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={`rounded-xl border px-5 py-2.5 text-[13px] font-semibold transition-all duration-300 ${
                lang === l
                  ? 'border-amber-400/40 bg-amber-400/10 text-amber-300'
                  : 'border-white/[0.06] bg-white/[0.02] text-white/50 hover:border-white/[0.12] hover:text-white/80'
              }`}
            >
              {l === 'en' ? 'English' : '中文'}
            </button>
          ))}
        </div>
      </section>

      {/* Display */}
      <section className="glass rounded-2xl p-6 space-y-5">
        <h2 className="text-[13px] font-bold uppercase tracking-widest text-white/30">{s.displaySection}</h2>
        <div className="space-y-5 divide-y divide-white/[0.04]">
          <Toggle
            checked={prefs.showTimestamps}
            onChange={(v) => update('showTimestamps', v)}
            label={s.showTimestamps}
          />
          <div className="pt-5">
            <Toggle
              checked={prefs.defaultSuggestedPrompts}
              onChange={(v) => update('defaultSuggestedPrompts', v)}
              label={s.showSuggestedPrompts}
            />
          </div>
          <div className="pt-5">
            <Toggle
              checked={prefs.compactMode}
              onChange={(v) => update('compactMode', v)}
              label={s.compactMode}
            />
          </div>
        </div>
      </section>

      {/* Brand Avatar */}
      <section className="glass rounded-2xl p-6 space-y-5">
        <h2 className="text-[13px] font-bold uppercase tracking-widest text-white/30">{s.avatarSection}</h2>
        <p className="text-[13px] text-white/40">{s.avatarDesc}</p>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-widest text-white/30">{s.avatarLabel}</label>
          <textarea
            value={avatarDesc}
            onChange={(e) => setAvatarDesc(e.target.value)}
            rows={3}
            placeholder={s.avatarPlaceholder}
            className="glass focus-ring w-full resize-none rounded-xl px-4 py-3 text-[13px] leading-relaxed text-white placeholder:text-white/25 focus:outline-none"
          />
          <button
            type="button"
            onClick={generateAvatarPrompt}
            disabled={avatarLoading || !avatarDesc.trim()}
            className="rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 px-5 py-2.5 text-[13px] font-bold text-black transition-all hover:scale-[1.02] disabled:opacity-40"
          >
            {avatarLoading ? s.avatarGenerating : s.avatarGenerateBtn}
          </button>
        </div>

        {avatarPrompt && (
          <div className="space-y-2 animate-fade-up">
            <label className="text-[11px] font-bold uppercase tracking-widest text-white/30">{s.avatarPromptLabel}</label>
            <div className="flex gap-2">
              <div className="glass flex-1 rounded-xl px-4 py-3 text-[13px] leading-relaxed text-white/70">
                {avatarPrompt}
              </div>
              <button
                type="button"
                onClick={copyPrompt}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-[12px] font-semibold text-white/50 transition-all hover:border-white/[0.12] hover:text-white/80"
              >
                {copied ? s.avatarPromptCopied : s.avatarCopyBtn}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-widest text-white/30">{s.avatarUrlLabel}</label>
          <input
            type="text"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder={s.avatarUrlPlaceholder}
            className="glass focus-ring w-full rounded-xl px-4 py-2.5 text-[13px] text-white placeholder:text-white/25 focus:outline-none"
          />
        </div>

        {avatarUrl && (
          <div className="space-y-3 animate-fade-up">
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/30">{s.avatarPreview}</p>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatarUrl} alt="Avatar preview" className="h-full w-full object-cover" />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={saveAvatar}
                  className="rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 px-5 py-2.5 text-[13px] font-bold text-black transition-all hover:scale-[1.02]"
                >
                  {s.avatarSaveBtn}
                </button>
                <button
                  type="button"
                  onClick={resetAvatar}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-[13px] font-semibold text-white/50 transition-all hover:border-white/[0.12] hover:text-white/80"
                >
                  {s.avatarReset}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Keyboard shortcuts */}
      <section className="glass rounded-2xl p-6 space-y-5">
        <h2 className="text-[13px] font-bold uppercase tracking-widest text-white/30">{s.keyboardSection}</h2>
        <div className="space-y-2">
          {SHORTCUTS.map((sc, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-white/[0.02]">
              <span className="text-[13px] text-white/60">{sc.description}</span>
              <div className="flex items-center gap-1">
                {sc.keys.map((k, j) => (
                  <kbd
                    key={j}
                    className="rounded-md border border-white/[0.1] bg-white/[0.04] px-2 py-1 font-mono text-[11px] text-white/40 min-w-[26px] text-center"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="glass rounded-2xl p-6 space-y-4">
        <h2 className="text-[13px] font-bold uppercase tracking-widest text-white/30">{s.aboutSection}</h2>
        <div className="space-y-2 text-[13px] text-white/50">
          <div className="flex justify-between">
            <span>{s.version}</span>
            <span className="font-mono text-white/30">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>{s.stack}</span>
            <span className="font-mono text-white/30">Next.js 14 · Supabase · Tailwind</span>
          </div>
        </div>
        <p className="text-[12px] text-white/25 pt-2">{s.aboutDesc}</p>
      </section>
    </div>
  );
}

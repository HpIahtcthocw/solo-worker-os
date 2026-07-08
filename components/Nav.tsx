'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useLang } from './LanguageProvider';
import LanguageToggle from './LanguageToggle';
import NotificationBell from './NotificationBell';
import SignOutButton from './SignOutButton';

export default function Nav() {
  const pathname = usePathname();
  const { t } = useLang();
  const [mobileOpen, setMobileOpen] = useState(false);
  const competitionMode = process.env.NEXT_PUBLIC_COMPETITION_MODE;
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('solo-worker-avatar');
      if (saved) setAvatarUrl(saved);
    } catch {}
  }, []);

  const links = [
    { href: '/dashboard',  label: t.nav.dashboard, icon: '⊡' },
    { href: '/chat',       label: t.nav.chat,      icon: '💬' },
    { href: '/projects',   label: t.nav.projects,  icon: '📋' },
    { href: '/knowledge',  label: t.nav.knowledge,  icon: '📚' },
    { href: '/settings',   label: t.nav.settings,   icon: '⚙' },
    ...(competitionMode === 'casper' ? [{ href: '/casper', label: 'Casper', icon: '⛓' }] : []),
  ];

  function openPalette() {
    document.dispatchEvent(new Event('open-command-palette'));
    setMobileOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/[0.04] bg-[#060608]/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/dashboard" className="group flex items-center gap-2.5">
            {avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={avatarUrl} alt="Solo Worker OS" className="h-9 w-9 rounded-xl object-cover ring-1 ring-inset ring-white/30 shadow-glow-amber transition-transform duration-300 group-hover:scale-105" />
            ) : (
              <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-sm font-extrabold text-black shadow-glow-amber transition-transform duration-300 group-hover:scale-105">
                S
                <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/30" />
              </span>
            )}
            <span className="hidden text-[15px] font-extrabold tracking-tight text-white sm:block">
              Solo Worker <span className="amber-text">OS</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-2 md:flex">
            <nav className="flex items-center gap-0.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
              {links.map((l) => {
                const active = pathname === l.href || pathname.startsWith(l.href + '/');
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`rounded-lg px-3.5 py-1.5 text-[13px] font-semibold transition-all duration-300 ease-expo ${
                      active
                        ? 'bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                        : 'text-white/40 hover:bg-white/5 hover:text-white/80'
                    }`}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </nav>

            {/* Cmd+K button */}
            <button
              type="button"
              onClick={openPalette}
              title="Quick search (⌘K)"
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[12px] font-medium text-white/35 transition-all duration-300 hover:border-white/[0.1] hover:bg-white/[0.05] hover:text-white/60"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
              </svg>
              <span className="hidden lg:block">Search</span>
              <kbd className="hidden rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono text-white/25 lg:block">
                ⌘K
              </kbd>
            </button>

            <LanguageToggle />
            <NotificationBell />
            <SignOutButton />
          </div>

          {/* Mobile right side */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={openPalette}
              title="Search (⌘K)"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] text-white/40 transition-colors hover:text-white/70"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
              </svg>
            </button>
            {/* Hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] text-white/40 transition-colors hover:text-white/70"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileOpen && (
          <div className="border-t border-white/[0.04] bg-[#060608]/95 px-4 py-3 md:hidden animate-slide-down">
            <nav className="flex flex-col gap-1">
              {links.map((l) => {
                const active = pathname === l.href || pathname.startsWith(l.href + '/');
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-semibold transition-all ${
                      active
                        ? 'bg-white/[0.08] text-white'
                        : 'text-white/50 hover:bg-white/[0.04] hover:text-white/80'
                    }`}
                  >
                    <span className="text-[16px]">{l.icon}</span>
                    {l.label}
                  </Link>
                );
              })}
              <div className="mt-2 border-t border-white/[0.04] pt-2 flex items-center justify-between">
                <LanguageToggle />
                <SignOutButton />
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

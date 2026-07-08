'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PaletteItem {
  type: 'page' | 'action' | 'project';
  icon: string;
  label: string;
  sub?: string;
  href: string;
}

const STATIC: PaletteItem[] = [
  { type: 'page',   icon: '⊡', label: 'Dashboard',               href: '/dashboard' },
  { type: 'page',   icon: '💬', label: 'Chat with Agent',         href: '/chat' },
  { type: 'page',   icon: '📋', label: 'All Projects',            href: '/projects' },
  { type: 'page',   icon: '⚙', label: 'Settings',                href: '/settings' },
  { type: 'action', icon: '👤', label: 'New client conversation',  href: '/chat?prefill=I+have+a+new+client+%E2%80%94+let+me+give+you+the+details' },
  { type: 'action', icon: '💰', label: 'Chase unpaid invoices',   href: '/chat?prefill=Which+projects+have+unpaid+invoices%3F+Help+me+write+reminders.' },
  { type: 'action', icon: '📊', label: 'Weekly business summary', href: '/chat?prefill=Give+me+a+summary+of+my+business+this+week.' },
  { type: 'action', icon: '📝', label: 'Draft a contract',        href: '/chat?prefill=Generate+a+contract+for+my+most+recent+project.' },
];

interface ProjectRow { id: string; client_name: string; project_type: string; status: string }

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [projects, setProjects] = useState<PaletteItem[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const items: PaletteItem[] = [...STATIC, ...projects];

  const filtered = query.trim()
    ? items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()) || (item.sub?.toLowerCase().includes(query.toLowerCase())))
    : items;

  // Keyboard shortcut to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Listen for custom event from Nav button
  useEffect(() => {
    const handler = () => setOpen(true);
    document.addEventListener('open-command-palette', handler);
    return () => document.removeEventListener('open-command-palette', handler);
  }, []);

  // Focus + fetch projects on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 10);
      fetch('/api/projects')
        .then((r) => r.json())
        .then((d: { projects?: ProjectRow[] }) => {
          const rows = d.projects ?? [];
          setProjects(
            rows.map((p) => ({
              type: 'project' as const,
              icon: p.status === 'paid' ? '✓' : p.status === 'active' ? '●' : '○',
              label: p.client_name,
              sub: p.project_type,
              href: `/project/${p.id}`,
            }))
          );
        })
        .catch(() => {});
    }
  }, [open]);

  // Reset selection on query change
  useEffect(() => setSelectedIdx(0), [query]);

  // Keyboard navigation inside palette
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && filtered[selectedIdx]) {
        navigate(filtered[selectedIdx].href);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, filtered, selectedIdx]);

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${selectedIdx}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIdx]);

  function navigate(href: string) {
    router.push(href);
    setOpen(false);
  }

  if (!open) return null;

  const TYPE_LABEL: Record<string, string> = {
    page: 'page',
    action: 'action',
    project: 'project',
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh]"
      onClick={() => setOpen(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-lg animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d10]/95 shadow-2xl backdrop-blur-2xl">
          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3.5">
            <svg className="h-4 w-4 flex-shrink-0 text-white/35" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages, projects, actions…"
              className="flex-1 bg-transparent text-[14px] text-white placeholder:text-white/30 focus:outline-none"
            />
            <kbd className="hidden rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[11px] font-mono text-white/30 sm:block">
              ESC
            </kbd>
          </div>

          {/* Results list */}
          <div ref={listRef} className="max-h-[320px] overflow-y-auto py-2">
            {filtered.length === 0 ? (
              <p className="px-5 py-8 text-center text-[13px] text-white/30">
                No results for &ldquo;{query}&rdquo;
              </p>
            ) : (
              <div>
                {filtered.map((item, i) => (
                  <button
                    key={`${item.href}-${i}`}
                    data-idx={i}
                    type="button"
                    onClick={() => navigate(item.href)}
                    onMouseEnter={() => setSelectedIdx(i)}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                      i === selectedIdx ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-[13px]">
                      {item.icon}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block truncate text-[13px] font-medium text-white/80">
                        {item.label}
                      </span>
                      {item.sub && (
                        <span className="block truncate text-[11px] text-white/35">{item.sub}</span>
                      )}
                    </span>
                    <span className="text-[11px] text-white/25 flex-shrink-0">
                      {TYPE_LABEL[item.type]}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 border-t border-white/[0.04] px-4 py-2">
            <span className="text-[11px] text-white/25">
              <kbd className="font-mono">↑↓</kbd> navigate &nbsp;
              <kbd className="font-mono">↵</kbd> open &nbsp;
              <kbd className="font-mono">ESC</kbd> close
            </span>
            <span className="ml-auto font-mono text-[11px] text-white/20">⌘K</span>
          </div>
        </div>
      </div>
    </div>
  );
}

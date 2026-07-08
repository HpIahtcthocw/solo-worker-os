'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { formatMoney, daysRemaining } from '@/lib/utils';
import type { Project, ProjectStatus } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import ProjectCard from '@/components/ProjectCard';
import { useLang } from '@/components/LanguageProvider';
import { translations } from '@/lib/i18n';

export default function ProjectsClient({ projects }: { projects: Project[] }) {
  const { lang } = useLang();
  const t = translations[lang];
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProjectStatus>('all');

  const STATUS_TABS: { key: 'all' | ProjectStatus; label: string }[] = [
    { key: 'all',       label: t.projects.filterAll },
    { key: 'active',    label: t.status.active },
    { key: 'delivered', label: t.status.delivered },
    { key: 'invoiced',  label: t.status.invoiced },
    { key: 'paid',      label: t.status.paid },
  ];

  const TABLE_HEADERS = [
    t.projects.client,
    t.projects.type,
    t.projects.budget,
    t.projects.status,
    t.projects.deadline,
    t.projects.daysLeft,
  ];

  const filtered = useMemo(() => {
    let list = projects;
    if (statusFilter !== 'all') list = list.filter((p) => p.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.client_name.toLowerCase().includes(q) ||
          p.project_type.toLowerCase().includes(q)
      );
    }
    return list;
  }, [projects, statusFilter, search]);

  // Sort: overdue first, then by deadline asc
  const sorted = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return [...filtered].sort((a, b) => {
      const aOverdue = a.status !== 'paid' && a.deadline < today;
      const bOverdue = b.status !== 'paid' && b.deadline < today;
      if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
      return a.deadline.localeCompare(b.deadline);
    });
  }, [filtered]);

  function dayStr(days: number, overdue: boolean) {
    if (overdue) return lang === 'zh' ? `逾期${Math.abs(days)}天` : `${Math.abs(days)}d overdue`;
    if (days === 0) return lang === 'zh' ? '今日截止' : 'due today';
    return lang === 'zh' ? `剩余${days}天` : `${days}d left`;
  }

  return (
    <div className="space-y-5">
      {/* Search + filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.projects.searchPlaceholder}
            className="glass w-full rounded-xl py-2.5 pl-9 pr-4 text-[14px] text-white placeholder:text-white/30 focus:border-amber-400/20 focus:outline-none transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
            >
              ×
            </button>
          )}
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
          {STATUS_TABS.map((tab) => {
            const count = tab.key === 'all' ? projects.length : projects.filter((p) => p.status === tab.key).length;
            const active = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all duration-300 ease-expo ${
                  active
                    ? 'bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                    : 'text-white/40 hover:bg-white/5 hover:text-white/70'
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`ml-1.5 text-[10px] ${active ? 'text-white/50' : 'text-white/25'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="glass flex flex-col items-center justify-center rounded-2xl px-8 py-20 text-center">
          {search || statusFilter !== 'all' ? (
            <>
              <p className="text-[15px] font-semibold text-white/70">{t.projects.noResults}</p>
              <p className="mt-1 text-[13px] text-white/35">{t.projects.noResultsDesc}</p>
              <button
                type="button"
                onClick={() => { setSearch(''); setStatusFilter('all'); }}
                className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-[13px] font-semibold text-white/50 transition-all hover:bg-white/[0.06]"
              >
                {t.projects.clearFilters}
              </button>
            </>
          ) : (
            <>
              <p className="text-[15px] font-semibold text-white/70">{t.projects.noProjects}</p>
              <p className="mt-1 text-[13px] text-white/35">{t.projects.noProjectsDesc}</p>
              <Link href="/chat" className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-amber-400/20 bg-amber-400/5 px-4 py-2 text-[13px] font-semibold text-amber-300 transition-all hover:bg-amber-400/10">
                {t.projects.goChat} →
              </Link>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="glass hidden overflow-hidden rounded-2xl sm:block">
            <table className="min-w-full divide-y divide-white/[0.04]">
              <thead className="bg-white/[0.02]">
                <tr>
                  {TABLE_HEADERS.map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-white/35">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {sorted.map((p) => {
                  const days = daysRemaining(p.deadline);
                  const overdue = days < 0 && p.status !== 'paid';
                  return (
                    <tr key={p.id} className="transition-colors hover:bg-white/[0.03]">
                      <td className="px-5 py-3.5">
                        <Link href={`/project/${p.id}`} className="text-[14px] font-semibold text-white/90 transition-colors hover:text-amber-300">
                          {p.client_name}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-[14px] text-white/50">{p.project_type}</td>
                      <td className="px-5 py-3.5 font-mono text-[14px] text-white/70">{formatMoney(Number(p.budget), p.currency)}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
                      <td className="px-5 py-3.5 font-mono text-[13px] text-white/50">{p.deadline}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[13px] font-bold ${overdue ? 'text-red-400' : days <= 3 ? 'text-amber-300' : 'text-white/35'}`}>
                          {dayStr(days, overdue)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="grid grid-cols-1 gap-3 sm:hidden">
            {sorted.map((p) => <ProjectCard key={p.id} project={p} lang={lang} />)}
          </div>
        </>
      )}

      <p className="text-right text-[12px] text-white/25">
        {sorted.length} / {projects.length} {t.projects.ofProjects}
      </p>
    </div>
  );
}

import { Suspense } from 'react';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase-server';
import { formatMoney, timeAgo, todayISO, getGreeting } from '@/lib/utils';
import type { Project, AgentAction } from '@/lib/types';
import ProjectCard from '@/components/ProjectCard';
import { getServerT, getServerLang } from '@/lib/i18n-server';

export const revalidate = 60;

// ─── tiny icons ──────────────────────────────────────────────────────────────
function IconBriefcase() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2ZM16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 7v5l3 3" />
    </svg>
  );
}
function IconBadgeCheck() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}
function IconAlert() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  );
}

const ACTION_ICONS: Record<string, string> = {
  project_created:    '✦',
  status_updated:     '→',
  contract_generated: '📋',
  followup_generated: '💬',
};

function summarizeAction(
  a: AgentAction,
  projectMap: Map<string, Project>,
  t: ReturnType<typeof getServerT>,
): string {
  const proj = a.project_id ? projectMap.get(a.project_id) : null;
  const who = proj ? `${proj.project_type} · ${proj.client_name}` : 'a project';
  switch (a.action_type) {
    case 'project_created':    return `${t.project.projectCreated}: ${who}`;
    case 'status_updated':     return `${t.project.statusUpdated}: ${who} → ${String((a.payload as { status?: string }).status ?? '')}`;
    case 'contract_generated': return `${t.project.contractGenerated}: ${who}`;
    case 'followup_generated': return `${t.project.followupGenerated}: ${who}`;
    default: return a.action_type;
  }
}

// ─── skeleton for the data section ───────────────────────────────────────────
function DataSkeleton() {
  return (
    <div className="space-y-6">
      {/* stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass rounded-2xl p-5 space-y-3 animate-pulse">
            <div className="h-3 w-20 rounded bg-white/[0.05]" />
            <div className="h-8 w-16 rounded bg-white/[0.05]" />
          </div>
        ))}
      </div>
      {/* quick actions */}
      <div className="flex flex-wrap gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-9 w-28 rounded-xl bg-white/[0.04] animate-pulse" />
        ))}
      </div>
      {/* content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass rounded-2xl p-5 space-y-3 animate-pulse">
              <div className="h-4 w-28 rounded bg-white/[0.05]" />
              <div className="h-3 w-20 rounded bg-white/[0.05]" />
              <div className="h-5 w-16 rounded bg-white/[0.05] mt-4" />
            </div>
          ))}
        </div>
        <div className="glass rounded-2xl p-4 space-y-3 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="h-5 w-5 rounded-md bg-white/[0.05] flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-full rounded bg-white/[0.05]" />
                <div className="h-2 w-14 rounded bg-white/[0.05]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── async data section (suspends) ───────────────────────────────────────────
async function DashboardData({ t, lang }: { t: ReturnType<typeof getServerT>; lang: ReturnType<typeof getServerLang> }) {
  const supabase = createServerClient();
  const today = todayISO();

  const [{ data: projects }, { data: actions }] = await Promise.all([
    supabase.from('projects').select('*').order('created_at', { ascending: false }),
    supabase.from('agent_actions').select('*').order('created_at', { ascending: false }).limit(8),
  ]);

  const projectList = (projects as Project[]) ?? [];
  const actionList  = (actions  as AgentAction[]) ?? [];
  const projectMap  = new Map(projectList.map((p) => [p.id, p]));

  const activeCount = projectList.filter((p) => p.status === 'active').length;
  const overdueCount = projectList.filter((p) => p.status !== 'paid' && p.deadline < today).length;
  const recentProjects = projectList.slice(0, 4);

  const invoiced = projectList.filter((p) => p.status === 'invoiced');
  const pendingByCurrency = new Map<string, number>();
  for (const p of invoiced) pendingByCurrency.set(p.currency, (pendingByCurrency.get(p.currency) ?? 0) + Number(p.budget));
  const pendingLabel = pendingByCurrency.size === 0
    ? '—'
    : [...pendingByCurrency.entries()].map(([cur, amt]) => formatMoney(amt, cur)).join(' · ');

  const paid = projectList.filter((p) => p.status === 'paid');
  const earnedByCurrency = new Map<string, number>();
  for (const p of paid) earnedByCurrency.set(p.currency, (earnedByCurrency.get(p.currency) ?? 0) + Number(p.budget));
  const earnedLabel = earnedByCurrency.size === 0
    ? '—'
    : [...earnedByCurrency.entries()].map(([cur, amt]) => formatMoney(amt, cur)).join(' · ');

  const STATS = [
    {
      label:  t.dashboard.activeProjects,
      value:  String(activeCount),
      icon:   <IconBriefcase />,
      color:  'text-amber-300',
      iconBg: 'bg-amber-400/10 text-amber-300',
      glow:   'bg-amber-400/6 group-hover:bg-amber-400/14',
      border: 'hover:border-amber-400/20',
      shadow: 'hover:shadow-glow-amber',
    },
    {
      label:  t.dashboard.pendingPayments,
      value:  pendingLabel,
      icon:   <IconClock />,
      color:  'text-teal-300',
      iconBg: 'bg-teal-400/10 text-teal-300',
      glow:   'bg-teal-400/6 group-hover:bg-teal-400/14',
      border: 'hover:border-teal-400/20',
      shadow: 'hover:shadow-glow-teal',
    },
    {
      label:  t.dashboard.totalEarned,
      value:  earnedLabel,
      icon:   <IconBadgeCheck />,
      color:  'text-emerald-300',
      iconBg: 'bg-emerald-400/10 text-emerald-300',
      glow:   'bg-emerald-400/6 group-hover:bg-emerald-400/14',
      border: 'hover:border-emerald-400/20',
      shadow: 'hover:shadow-glow-emerald',
    },
    {
      label:  t.dashboard.overdueFollowups,
      value:  String(overdueCount),
      icon:   <IconAlert />,
      color:  overdueCount > 0 ? 'text-red-400' : 'text-white/35',
      iconBg: overdueCount > 0 ? 'bg-red-400/10 text-red-400' : 'bg-white/[0.04] text-white/25',
      glow:   'bg-red-400/5 group-hover:bg-red-400/12',
      border: 'hover:border-red-400/20',
      shadow: 'hover:shadow-glow-coral',
    },
  ];

  const QUICK_ACTIONS = [
    { label: t.dashboard.quickActions.newClient,   href: `/chat?prefill=${encodeURIComponent(t.dashboard.quickActions.newClientPrefill)}` },
    { label: t.dashboard.quickActions.chase,       href: `/chat?prefill=${encodeURIComponent(t.dashboard.quickActions.chasePrefill)}` },
    { label: t.dashboard.quickActions.weekly,      href: `/chat?prefill=${encodeURIComponent(t.dashboard.quickActions.weeklyPrefill)}` },
    { label: t.dashboard.quickActions.overdue,     href: '/projects' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STATS.map((c, i) => (
          <div
            key={c.label}
            className={`card-shine glass glass-hover group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 ${c.border} ${c.shadow} stagger-${i + 1} animate-fade-up`}
          >
            <div className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl transition-all duration-500 ${c.glow}`} />
            <div className="relative">
              <div className={`mb-3 inline-flex items-center justify-center rounded-xl p-2 ${c.iconBg}`}>{c.icon}</div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">{c.label}</p>
              <p className={`mt-1.5 font-mono text-2xl font-bold ${c.color} sm:text-3xl truncate`}>{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        {QUICK_ACTIONS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="inline-flex items-center rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-[13px] font-semibold text-white/50 transition-all duration-300 ease-expo hover:border-amber-400/20 hover:bg-amber-400/5 hover:text-amber-300 hover:-translate-y-0.5"
          >
            {a.label}
          </Link>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent projects */}
        <section className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-white/80">{t.dashboard.recentProjects}</h2>
            <Link href="/projects" className="group flex items-center gap-1 text-[13px] font-semibold text-amber-300 transition-colors hover:text-amber-400">
              {t.dashboard.viewAll}
              <svg className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <div className="glass rounded-2xl overflow-hidden">
              {/* Hero */}
              <div className="relative px-8 py-10 text-center">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-400/5 via-transparent to-violet-400/5" />
                <div className="relative">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-glow-amber">
                    <svg className="h-7 w-7 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-4 3v-3Z" />
                    </svg>
                  </div>
                  <h3 className="text-[20px] font-extrabold tracking-tight text-white">{t.dashboard.onboardTitle}</h3>
                  <p className="mt-2 text-[14px] text-white/45">{t.dashboard.onboardDesc}</p>
                </div>
              </div>
              {/* Steps */}
              <div className="grid grid-cols-1 gap-px bg-white/[0.04] sm:grid-cols-3">
                {[
                  { n: '1', title: t.dashboard.onboardStep1, desc: t.dashboard.onboardStep1Desc },
                  { n: '2', title: t.dashboard.onboardStep2, desc: t.dashboard.onboardStep2Desc },
                  { n: '3', title: t.dashboard.onboardStep3, desc: t.dashboard.onboardStep3Desc },
                ].map((s) => (
                  <div key={s.n} className="flex items-start gap-3 bg-[#060608] px-5 py-5">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-amber-400/10 text-[13px] font-bold text-amber-300">{s.n}</span>
                    <div>
                      <p className="text-[13px] font-bold text-white/80">{s.title}</p>
                      <p className="mt-0.5 text-[12px] text-white/35">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* CTA */}
              <div className="border-t border-white/[0.04] bg-white/[0.01] px-8 py-6">
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-white/25">{t.dashboard.onboardTry}</p>
                <p className="mb-4 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 font-mono text-[13px] italic text-amber-300/70">
                  {t.dashboard.onboardExample}
                </p>
                <Link
                  href="/chat"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 px-5 py-2.5 text-[14px] font-bold text-black shadow-glow-amber transition-all duration-300 hover:scale-[1.03]"
                >
                  {t.dashboard.onboardCta}
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {recentProjects.map((p, i) => (
                <div key={p.id} className={`stagger-${i + 1} animate-fade-up`}>
                  <ProjectCard project={p} lang={lang} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Activity feed */}
        <section>
          <h2 className="mb-4 text-[15px] font-bold text-white/80">{t.dashboard.recentActivity}</h2>
          <div className="glass rounded-2xl p-3">
            {actionList.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.02]">
                  <span className="h-2 w-2 animate-pulse-soft rounded-full bg-white/20" />
                </div>
                <p className="text-[13px] text-white/35">{t.dashboard.noActivity}</p>
              </div>
            ) : (
              <ol className="space-y-0">
                {actionList.map((a, i) => (
                  <li key={a.id} className="relative flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.03]">
                    {i < actionList.length - 1 && (
                      <span className="absolute left-[22px] top-[36px] h-[calc(100%-8px)] w-px bg-white/[0.05]" />
                    )}
                    <span className="relative z-10 mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-amber-400/10 text-[11px] text-amber-300">
                      {ACTION_ICONS[a.action_type] ?? '·'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium leading-snug text-white/65">{summarizeAction(a, projectMap, t)}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-white/25">{timeAgo(a.created_at, lang)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

// ─── page shell (sync — renders immediately) ──────────────────────────────────
export default function DashboardPage() {
  const t = getServerT();
  const lang = getServerLang();
  const greeting = getGreeting(lang);

  return (
    <div className="space-y-10 animate-fade-up">
      {/* Header — no DB needed, renders instantly */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse-soft" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-300">{t.dashboard.overview}</span>
          </div>
          <h1 className="text-[38px] font-extrabold tracking-tight gradient-text leading-none">
            {greeting} 👋
          </h1>
          <p className="mt-2.5 text-[15px] text-white/40">{t.dashboard.subtitle}</p>
        </div>
        <Link
          href="/chat"
          className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 px-5 py-2.5 text-[14px] font-bold text-black shadow-glow-amber transition-all duration-300 ease-expo hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(251,191,36,0.35)]"
        >
          <svg className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-4 3v-3Z" />
          </svg>
          {t.dashboard.newConversation}
        </Link>
      </div>

      {/* Data section — Supabase fetches here, skeleton shows while loading */}
      <Suspense fallback={<DataSkeleton />}>
        <DashboardData t={t} lang={lang} />
      </Suspense>
    </div>
  );
}

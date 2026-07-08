import Link from 'next/link';
import { createServerClient } from '@/lib/supabase-server';
import type { Project } from '@/lib/types';
import ProjectsClient from '@/components/ProjectsClient';
import { getServerT, getServerLang } from '@/lib/i18n-server';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const t = getServerT();
  const lang = getServerLang();
  const supabase = createServerClient();
  const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
  const projects = (data as Project[]) ?? [];

  const addChatPrefill = encodeURIComponent(
    lang === 'zh'
      ? '我有个新客户，让我告诉你详情'
      : 'I have a new client — let me give you the details'
  );

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse-soft" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-300">{t.projects.pipeline}</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight gradient-text">{t.projects.title}</h1>
          <p className="mt-2 text-[15px] text-white/40">
            <span className="font-mono text-white/70">{projects.length}</span> {t.projects.total}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/api/export/csv"
            download="projects.csv"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-[13px] font-semibold text-white/50 transition-all hover:bg-white/[0.05] hover:text-white/80"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v7.69l2.47-2.47a.75.75 0 1 1 1.06 1.06l-3.75 3.75a.75.75 0 0 1-1.06 0L5.72 9.97a.75.75 0 1 1 1.06-1.06l2.47 2.47V3.75A.75.75 0 0 1 10 3ZM3.75 15a.75.75 0 0 0 0 1.5h12.5a.75.75 0 0 0 0-1.5H3.75Z" clipRule="evenodd" />
            </svg>
            {t.projects.exportCsv}
          </a>
          <Link
            href={`/chat?prefill=${addChatPrefill}`}
            className="inline-flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-2.5 text-[13px] font-semibold text-amber-300 transition-all hover:bg-amber-400/10"
          >
            {t.projects.addViaChat}
          </Link>
        </div>
      </div>

      <ProjectsClient projects={projects} />
    </div>
  );
}

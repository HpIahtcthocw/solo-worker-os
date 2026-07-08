import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';
import { formatMoney, daysRemaining, timeAgo } from '@/lib/utils';
import type { Project, AgentAction } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import Markdown from '@/components/Markdown';
import CopyButton from '@/components/CopyButton';
import FollowUpGenerator from '@/components/FollowUpGenerator';
import ProjectStatusButtons from '@/components/ProjectStatusButtons';
import WorkflowTracker from '@/components/WorkflowTracker';
import { getServerT, getServerLang } from '@/lib/i18n-server';

export const dynamic = 'force-dynamic';

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const t = getServerT();
  const lang = getServerLang();
  const supabase = createServerClient();
  const { data: project } = await supabase.from('projects').select('*').eq('id', params.id).single();
  if (!project) notFound();
  const { data: actions } = await supabase.from('agent_actions').select('*').eq('project_id', params.id).order('created_at', { ascending: false });
  const actionList = (actions as AgentAction[]) ?? [];
  const p = project as Project;
  const days = daysRemaining(p.deadline);
  const overdue = days < 0 && p.status !== 'paid';
  const contractAction = actionList.find((a) => a.action_type === 'contract_generated');
  const contractText = contractAction ? String((contractAction.payload as { contract?: string }).contract ?? '') : '';

  const ACTION_LABELS: Record<string, string> = {
    project_created: t.project.projectCreated,
    status_updated: t.project.statusUpdated,
    contract_generated: t.project.contractGenerated,
    followup_generated: t.project.followupGenerated,
  };

  const ACTION_ICONS: Record<string, string> = {
    project_created: '✦',
    status_updated: '→',
    contract_generated: '📋',
    followup_generated: '💬',
  };

  const chatPrefill = encodeURIComponent(
    lang === 'zh'
      ? `告诉我关于 ${p.client_name} 的 ${p.project_type} 项目详情。`
      : `Tell me about the ${p.project_type} project for ${p.client_name}.`
  );

  const contractPrefill = encodeURIComponent(
    lang === 'zh'
      ? `为 ${p.client_name} 的 ${p.project_type} 项目生成合同`
      : `Generate a contract for ${p.client_name}'s ${p.project_type} project`
  );

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Back + chat link */}
      <div className="flex items-center justify-between">
        <Link href="/projects" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-white/40 transition-colors hover:text-white/80">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.7 4.3a1 1 0 0 1 0 1.4L8.4 10l4.3 4.3a1 1 0 0 1-1.4 1.4l-5-5a1 1 0 0 1 0-1.4l5-5a1 1 0 0 1 1.4 0Z" clipRule="evenodd" />
          </svg>
          {t.project.backToProjects}
        </Link>
        <Link
          href={`/chat?prefill=${chatPrefill}`}
          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/20 bg-amber-400/5 px-3.5 py-1.5 text-[13px] font-semibold text-amber-300 transition-all hover:bg-amber-400/10"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-4 3v-3Z" />
          </svg>
          {t.project.openInChat}
        </Link>
      </div>

      {/* Project header card */}
      <div className="glass relative overflow-hidden rounded-2xl p-6">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-400/5 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-widest text-amber-300">{p.project_type}</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white">{p.client_name}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={p.status} label={t.status[p.status]} />
            <ProjectStatusButtons projectId={p.id} currentStatus={p.status} />
          </div>
        </div>

        <dl className="relative mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: t.project.budget, value: formatMoney(Number(p.budget), p.currency) },
            { label: t.project.deadline, value: p.deadline },
            {
              label: t.project.daysLeft,
              value: overdue ? `${Math.abs(days)}d ${t.project.overdue}` : days === 0 ? t.project.dueToday : `${days}d`,
              cls: overdue ? 'text-red-400' : days <= 3 ? 'text-amber-300' : 'text-white',
            },
            { label: t.project.created, value: p.created_at.slice(0, 10) },
          ].map((d) => (
            <div key={d.label} className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-3">
              <dt className="text-[11px] font-bold uppercase tracking-widest text-white/30">{d.label}</dt>
              <dd className={`mt-1.5 font-mono text-lg font-bold ${d.cls ?? 'text-white'}`}>{d.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Workflow tracker */}
      <WorkflowTracker projectId={p.id} />

      {/* Follow-up generator */}
      <FollowUpGenerator projectId={p.id} />

      {/* Contract */}
      <div className="glass rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-white/80">{t.project.contract}</h2>
          {contractText && (
            <div className="flex items-center gap-2">
              <a
                href={`/api/export/contract/${p.id}`}
                download
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[12px] font-semibold text-white/50 transition-all hover:bg-white/[0.06] hover:text-white/80"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v7.69l2.47-2.47a.75.75 0 1 1 1.06 1.06l-3.75 3.75a.75.75 0 0 1-1.06 0L5.72 9.97a.75.75 0 1 1 1.06-1.06l2.47 2.47V3.75A.75.75 0 0 1 10 3ZM3.75 15a.75.75 0 0 0 0 1.5h12.5a.75.75 0 0 0 0-1.5H3.75Z" clipRule="evenodd" />
                </svg>
                {t.project.downloadContract}
              </a>
              <CopyButton text={contractText} label={t.project.copyContract} />
            </div>
          )}
        </div>
        {contractText ? (
          <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-5">
            <Markdown content={contractText} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] px-8 py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <svg className="h-6 w-6 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z" />
              </svg>
            </div>
            <p className="text-[14px] font-semibold text-white/50">{t.project.noContract}</p>
            <Link
              href={`/chat?prefill=${contractPrefill}`}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-amber-400/20 bg-amber-400/5 px-4 py-2 text-[13px] font-semibold text-amber-300 transition-all hover:bg-amber-400/10"
            >
              {t.project.askContract} →
            </Link>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="glass rounded-2xl p-6">
        <h2 className="mb-4 text-[15px] font-bold text-white/80">{t.project.timeline}</h2>
        {actionList.length === 0 ? (
          <p className="text-[13px] text-white/35">{t.project.noActions}</p>
        ) : (
          <ol className="relative ml-3 border-l border-white/[0.08]">
            {actionList.map((a) => (
              <li key={a.id} className="mb-5 ml-5 last:mb-0">
                <span className="absolute -left-[5px] mt-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[14px] font-semibold text-white/90">
                      {ACTION_ICONS[a.action_type] ?? '·'} {ACTION_LABELS[a.action_type] ?? a.action_type}
                    </p>
                    <p className="mt-0.5 text-[12px] text-white/40">
                      {a.action_type === 'status_updated'
                        ? `→ ${String((a.payload as { status?: string }).status ?? '')}`
                        : a.action_type === 'followup_generated'
                        ? `${t.project.toneLabel}: ${String((a.payload as { tone?: string }).tone ?? '')}`
                        : ''}
                    </p>
                  </div>
                  <p className="flex-shrink-0 font-mono text-[11px] text-white/30">{timeAgo(a.created_at, lang)}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

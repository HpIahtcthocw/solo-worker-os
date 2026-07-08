import Link from 'next/link';
import StatusBadge from './StatusBadge';
import { formatMoney, daysRemaining } from '@/lib/utils';
import type { Project } from '@/lib/types';
import type { Lang } from '@/lib/i18n';

const STATUS_BAR: Record<string, string> = {
  active:    'from-amber-400   to-amber-500/60',
  delivered: 'from-violet-400  to-violet-500/60',
  invoiced:  'from-teal-400    to-teal-500/60',
  paid:      'from-emerald-400 to-emerald-500/60',
};

const STATUS_GLOW: Record<string, string> = {
  active:    'group-hover:shadow-glow-amber',
  delivered: 'group-hover:shadow-glow-violet',
  invoiced:  'group-hover:shadow-glow-teal',
  paid:      'group-hover:shadow-glow-emerald',
};

const STATUS_ORB: Record<string, string> = {
  active:    'group-hover:bg-amber-400/10',
  delivered: 'group-hover:bg-violet-400/10',
  invoiced:  'group-hover:bg-teal-400/10',
  paid:      'group-hover:bg-emerald-400/10',
};

export default function ProjectCard({ project, lang = 'en' }: { project: Project; lang?: Lang }) {
  const days = daysRemaining(project.deadline);
  const overdue = days < 0 && project.status !== 'paid';
  const bar  = STATUS_BAR[project.status]  ?? STATUS_BAR.active;
  const glow = STATUS_GLOW[project.status] ?? '';
  const orb  = STATUS_ORB[project.status]  ?? '';

  const dayStr = overdue
    ? lang === 'zh' ? `逾期${Math.abs(days)}天` : `${Math.abs(days)}d overdue`
    : days === 0
    ? lang === 'zh' ? '今日截止' : 'due today'
    : lang === 'zh' ? `剩余${days}天` : `${days}d left`;

  return (
    <Link
      href={`/project/${project.id}`}
      className={`card-shine glass glass-hover group relative block overflow-hidden rounded-2xl transition-all duration-300 ease-expo hover:-translate-y-0.5 ${glow}`}
    >
      {/* Status accent strip */}
      <div className={`h-[3px] w-full bg-gradient-to-r ${bar} opacity-70`} />

      <div className="relative p-5">
        {/* Ambient glow orb */}
        <div className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl transition-all duration-500 bg-transparent ${orb}`} />

        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-bold leading-tight text-white">
              {project.project_type}
            </p>
            <p className="mt-0.5 truncate text-[13px] text-white/40">{project.client_name}</p>
          </div>
          <StatusBadge status={project.status} />
        </div>

        {/* Footer row */}
        <div className="mt-4 flex items-center justify-between border-t border-white/[0.05] pt-3">
          <span className="font-mono text-[17px] font-bold text-white/90 tracking-tight">
            {formatMoney(Number(project.budget), project.currency)}
          </span>
          <span
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors ${
              overdue
                ? 'bg-red-400/10 text-red-400'
                : days === 0
                ? 'bg-amber-400/15 text-amber-300'
                : days <= 3
                ? 'bg-amber-400/10 text-amber-300/80'
                : 'bg-white/[0.04] text-white/35'
            }`}
          >
            {dayStr}
          </span>
        </div>
      </div>
    </Link>
  );
}

import type { ProjectStatus } from '@/lib/types';

const STYLES: Record<ProjectStatus, { bg: string; text: string; ring: string; dot: string; glow: string }> = {
  active: {
    bg: 'bg-amber-400/10',
    text: 'text-amber-300',
    ring: 'ring-amber-400/25',
    dot: 'bg-amber-400',
    glow: 'shadow-[0_0_8px_rgba(251,191,36,0.4)]',
  },
  delivered: {
    bg: 'bg-violet-400/10',
    text: 'text-violet-300',
    ring: 'ring-violet-400/25',
    dot: 'bg-violet-400',
    glow: '',
  },
  invoiced: {
    bg: 'bg-teal-400/10',
    text: 'text-teal-300',
    ring: 'ring-teal-400/25',
    dot: 'bg-teal-400',
    glow: '',
  },
  paid: {
    bg: 'bg-emerald-400/10',
    text: 'text-emerald-300',
    ring: 'ring-emerald-400/25',
    dot: 'bg-emerald-400',
    glow: '',
  },
};

export default function StatusBadge({ status, label }: { status: ProjectStatus; label?: string }) {
  const s = STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${s.bg} px-2.5 py-1 text-[11px] font-bold ${s.text} ring-1 ring-inset ${s.ring}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot} ${status === 'active' ? 'animate-pulse-soft' : ''} ${s.glow}`} />
      {label ?? status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

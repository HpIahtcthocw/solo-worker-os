'use client';

import type { ReactNode } from 'react';

interface CompetitionBadgeProps {
  /** 'qwen' | 'casper' | 'default' */
  mode?: 'qwen' | 'casper' | 'default';
  /** Optional label override */
  label?: string;
  /** Show as compact chip or full badge */
  variant?: 'chip' | 'badge';
  children?: ReactNode;
}

const config = {
  qwen: {
    label: 'Global AI Hackathon · Qwen Cloud',
    accent: 'from-purple-500/20 to-blue-500/20',
    border: 'border-purple-400/30',
    text: 'text-purple-300',
    dot: 'bg-purple-400',
    glow: 'shadow-[0_0_12px_rgba(168,85,247,0.2)]',
  },
  casper: {
    label: 'Casper Agentic Buildathon 2026',
    accent: 'from-cyan-500/20 to-teal-500/20',
    border: 'border-cyan-400/30',
    text: 'text-cyan-300',
    dot: 'bg-cyan-400',
    glow: 'shadow-[0_0_12px_rgba(34,211,238,0.2)]',
  },
  default: {
    label: 'Solo Worker OS',
    accent: 'from-amber-400/10 to-amber-600/10',
    border: 'border-amber-400/20',
    text: 'text-amber-300',
    dot: 'bg-amber-400',
    glow: 'shadow-[0_0_8px_rgba(251,191,36,0.15)]',
  },
} as const;

export default function CompetitionBadge({
  mode = 'default',
  label,
  variant = 'chip',
  children,
}: CompetitionBadgeProps) {
  const c = config[mode];
  const displayLabel = label ?? c.label;

  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center gap-3 rounded-2xl border ${c.border} bg-gradient-to-br ${c.accent} px-5 py-3 ${c.glow} transition-all duration-300`}
      >
        <span className={`h-2 w-2 rounded-full ${c.dot} animate-pulse-soft shadow-[0_0_8px_currentColor]`} />
        <div>
          <p className={`text-[12px] font-bold uppercase tracking-widest ${c.text}`}>
            {displayLabel}
          </p>
          {children && <p className="mt-0.5 text-[12px] text-white/40">{children}</p>}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border ${c.border} ${c.glow} px-3 py-1 transition-all duration-300`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot} animate-pulse-soft`} />
      <span className={`text-[11px] font-bold uppercase tracking-widest ${c.text}`}>
        {displayLabel}
      </span>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProjectStatus } from '@/lib/types';

const NEXT_STATUS: Partial<Record<ProjectStatus, { status: ProjectStatus; label: string; color: string }>> = {
  active:    { status: 'delivered', label: 'Mark as Delivered', color: 'violet' },
  delivered: { status: 'invoiced',  label: 'Mark as Invoiced',  color: 'teal' },
  invoiced:  { status: 'paid',      label: 'Mark as Paid ✓',   color: 'emerald' },
};

const COLOR_MAP: Record<string, string> = {
  violet:  'border-violet-400/25 bg-violet-400/8 text-violet-300 hover:border-violet-400/40 hover:bg-violet-400/15',
  teal:    'border-teal-400/25 bg-teal-400/8 text-teal-300 hover:border-teal-400/40 hover:bg-teal-400/15',
  emerald: 'border-emerald-400/25 bg-emerald-400/8 text-emerald-300 hover:border-emerald-400/40 hover:bg-emerald-400/15',
};

export default function ProjectStatusButtons({
  projectId,
  currentStatus,
}: {
  projectId: string;
  currentStatus: ProjectStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const transition = NEXT_STATUS[currentStatus];
  if (!transition) return null;

  async function updateStatus() {
    setLoading(true);
    try {
      const res = await fetch(`/api/project/${projectId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: transition!.status }),
      });
      if (!res.ok) throw new Error('Update failed');
      setDone(true);
      setTimeout(() => router.refresh(), 600);
    } catch {
      setLoading(false);
    }
  }

  const colorCls = done
    ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
    : COLOR_MAP[transition.color] ?? COLOR_MAP.teal;

  return (
    <button
      type="button"
      onClick={() => void updateStatus()}
      disabled={loading || done}
      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-[13px] font-semibold transition-all duration-300 ease-expo disabled:cursor-not-allowed disabled:opacity-60 ${colorCls}`}
    >
      {done ? (
        <>
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
          </svg>
          Updated!
        </>
      ) : loading ? (
        <>
          <span className="h-3 w-3 animate-pulse-soft rounded-full bg-current opacity-70" />
          Updating…
        </>
      ) : (
        transition.label
      )}
    </button>
  );
}

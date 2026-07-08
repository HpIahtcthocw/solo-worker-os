import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-service';
import { getAgent } from '@/lib/agent';
import { Resend } from 'resend';
import type { Project } from '@/lib/types';

export const dynamic = 'force-dynamic';

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // dev: open
  return req.headers.get('x-cron-secret') === secret;
}

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const resend = getResend();
  if (!resend) return; // skip if not configured
  await resend.emails.send({
    from: process.env.NOTIFICATION_FROM_EMAIL ?? 'Solo Worker OS <onboarding@resend.dev>',
    to,
    subject,
    html,
  });
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const type = new URL(req.url).searchParams.get('type') ?? 'all';
  const results: Record<string, unknown> = {};

  const supabase = createServiceClient();
  const today = new Date().toISOString().slice(0, 10);
  const notifyEmail = process.env.NOTIFICATION_EMAIL;

  // ── 1. Deadline reminders ─────────────────────────────────
  if (type === 'all' || type === 'deadlines') {
    const threeDaysOut = new Date();
    threeDaysOut.setDate(threeDaysOut.getDate() + 3);
    const cutoff = threeDaysOut.toISOString().slice(0, 10);

    const { data: urgentProjects } = await supabase
      .from('projects')
      .select('id, client_name, project_type, deadline, status, budget, currency')
      .lte('deadline', cutoff)
      .neq('status', 'paid')
      .order('deadline', { ascending: true });

    const projects = (urgentProjects as Project[]) ?? [];
    const created: string[] = [];

    for (const p of projects) {
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', p.id)
        .eq('type', 'deadline_reminder')
        .gte('created_at', today + 'T00:00:00Z');

      if ((count ?? 0) > 0) continue;

      const daysLeft = Math.ceil(
        (new Date(p.deadline).getTime() - Date.now()) / 86400000
      );
      const isOverdue = daysLeft < 0;

      const title = isOverdue
        ? `OVERDUE: ${p.project_type} for ${p.client_name}`
        : `Due in ${daysLeft}d: ${p.project_type} for ${p.client_name}`;

      const body = isOverdue
        ? `The project "${p.project_type}" for ${p.client_name} was due on ${p.deadline} and is now ${Math.abs(daysLeft)} day(s) overdue. Status: ${p.status}. Budget: ${p.currency} ${p.budget}.`
        : `Deadline approaching: "${p.project_type}" for ${p.client_name} is due on ${p.deadline} (${daysLeft} day(s) left). Status: ${p.status}. Budget: ${p.currency} ${p.budget}.`;

      await supabase.from('notifications').insert({
        type: 'deadline_reminder',
        title,
        body,
        project_id: p.id,
      });

      if (notifyEmail) {
        await sendEmail(
          notifyEmail,
          `[Solo Worker OS] ${title}`,
          `<p>${body}</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/projects/${p.id}">查看项目</a></p>`
        ).catch(() => {}); // don't fail cron if email fails
      }

      created.push(p.id);
    }

    results.deadlines = { checked: projects.length, created: created.length };
  }

  // ── 2. Weekly report (Mondays or ?type=weekly) ────────────
  if (type === 'weekly' || (type === 'all' && new Date().getDay() === 1)) {
    try {
      const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      const projectList = (projects as Project[]) ?? [];
      const active   = projectList.filter((p) => p.status === 'active').length;
      const invoiced = projectList.filter((p) => p.status === 'invoiced').length;
      const paid     = projectList.filter((p) => p.status === 'paid').length;
      const overdue  = projectList.filter(
        (p) => p.status !== 'paid' && p.deadline < today
      ).length;

      const agent = await getAgent();
      const prompt = `You are a business analyst assistant. Write a concise weekly business summary for a solo freelancer.

Current data:
- Active projects: ${active}
- Awaiting payment (invoiced): ${invoiced}
- Completed & paid this period: ${paid}
- Overdue projects: ${overdue}
- Total projects: ${projectList.length}

Write a 3-4 sentence summary covering: overall health, immediate priorities, and one concrete recommendation. Be direct and actionable. No markdown headers, just plain paragraphs.`;

      const reportText = await agent.runStream({
        system: 'You are a concise business analyst. Respond in plain text, no markdown.',
        messages: [{ role: 'user', content: prompt }],
        tools: [],
        executeTool: async (_name: string, _input: Record<string, unknown>) => ({ toolResult: '', clientSummary: '' }),
        callbacks: { onText: () => {}, onTool: () => {} },
      });

      await supabase.from('notifications').insert({
        type: 'weekly_report',
        title: `Weekly Business Summary — ${today}`,
        body: reportText,
        project_id: null,
      });

      if (notifyEmail) {
        await sendEmail(
          notifyEmail,
          `[Solo Worker OS] Weekly Report — ${today}`,
          `<p>${reportText.replace(/\n/g, '<br>')}</p>`
        ).catch(() => {});
      }

      results.weekly_report = { generated: true };
    } catch (e) {
      results.weekly_report = { error: String(e) };
    }
  }

  return NextResponse.json({ ok: true, date: today, results });
}

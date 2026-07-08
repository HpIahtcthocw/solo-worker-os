import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createServiceClient } from '@/lib/supabase-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const userClient = createSupabaseServerClient();
  const { data: { user } } = await userClient.auth.getUser().catch(() => ({ data: { user: null } }));
  const supabase = user ? userClient : createServiceClient();

  const { data } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  return NextResponse.json({ notifications: data ?? [] });
}

export async function PATCH(req: NextRequest) {
  const userClient = createSupabaseServerClient();
  const { data: { user } } = await userClient.auth.getUser().catch(() => ({ data: { user: null } }));
  const supabase = user ? userClient : createServiceClient();

  const body = await req.json() as { id?: string; all?: boolean };

  if (body.all) {
    await supabase.from('notifications').update({ read: true }).eq('read', false);
  } else if (body.id) {
    await supabase.from('notifications').update({ read: true }).eq('id', body.id);
  }

  return NextResponse.json({ ok: true });
}

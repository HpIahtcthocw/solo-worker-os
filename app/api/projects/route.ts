import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createServiceClient } from '@/lib/supabase-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const userClient = createSupabaseServerClient();
  const { data: { user } } = await userClient.auth.getUser().catch(() => ({ data: { user: null } }));
  const supabase = user ? userClient : createServiceClient();

  const { data } = await supabase
    .from('projects')
    .select('id, client_name, project_type, status')
    .order('created_at', { ascending: false })
    .limit(20);

  return NextResponse.json({ projects: data ?? [] });
}

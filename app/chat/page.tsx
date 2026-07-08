import ChatClient, { type UIMessage } from '@/components/ChatClient';
import { getServerT } from '@/lib/i18n-server';

export const dynamic = 'force-dynamic';

export default async function ChatPage() {
  const t = getServerT();

  // Load messages client-side to avoid server-side Supabase timeout
  const initialMessages: UIMessage[] = [];

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse-soft" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-300">{t.chat.agent}</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight gradient-text">{t.chat.title}</h1>
        <p className="mt-2 text-[15px] text-white/40">{t.chat.subtitle}</p>
      </div>
      <ChatClient initialMessages={initialMessages} />
    </div>
  );
}

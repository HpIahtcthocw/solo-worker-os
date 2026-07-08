'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ChatMessage, { type ToolChip } from './ChatMessage';
import { useLang } from './LanguageProvider';

export interface UIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  tools?: ToolChip[];
  timestamp: number;
}

interface Props { initialMessages: UIMessage[] }

const SUGGESTED_PROMPTS_EN = [
  { icon: '👤', text: "I have a new client — let me give you the details" },
  { icon: '⏰', text: "Which projects are overdue or due soon?" },
  { icon: '📋', text: "Generate a contract for my most recent project" },
  { icon: '💬', text: "Write a payment reminder for an unpaid invoice" },
];

function ChatClientInner({ initialMessages }: Props) {
  const { t } = useLang();
  const suggestedPrompts = t.chat.suggested ?? SUGGESTED_PROMPTS_EN;
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<UIMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastMsg = messages[messages.length - 1];

  useEffect(() => {
    const prefill = searchParams.get('prefill');
    if (prefill) setInput(decodeURIComponent(prefill));
  }, [searchParams]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  function updateMessage(id: string, updater: (m: UIMessage) => UIMessage) {
    setMessages((prev) => prev.map((m) => (m.id === id ? updater(m) : m)));
  }

  function stopStreaming() {
    abortRef.current?.abort();
  }

  function clearConversation() {
    if (streaming) return;
    setMessages([]);
  }

  async function send(overrideText?: string) {
    const text = (overrideText ?? input).trim();
    if (!text || streaming) return;

    const userMsg: UIMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      tools: [],
      timestamp: Date.now(),
    };
    const assistantId = crypto.randomUUID();
    const history = [...messages, userMsg];

    setMessages([
      ...history,
      { id: assistantId, role: 'assistant', content: '', tools: [], timestamp: Date.now() },
    ]);
    setInput('');
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => 'Request failed');
        updateMessage(assistantId, (m) => ({ ...m, content: `Error: ${errText}` }));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split('\n\n');
        buffer = chunks.pop() ?? '';
        for (const chunk of chunks) {
          const line = chunk.trim();
          if (!line.startsWith('data: ')) continue;
          let data: { type: string; delta?: string; name?: string; summary?: string; message?: string };
          try { data = JSON.parse(line.slice(6)); } catch { continue; }
          if (data.type === 'text' && data.delta) {
            updateMessage(assistantId, (m) => ({ ...m, content: m.content + data.delta }));
          } else if (data.type === 'tool' && data.name) {
            updateMessage(assistantId, (m) => ({
              ...m,
              tools: [...(m.tools ?? []), { name: data.name!, summary: data.summary ?? '' }],
            }));
          } else if (data.type === 'error') {
            updateMessage(assistantId, (m) => ({
              ...m,
              content: m.content + `\n\n⚠️ ${data.message ?? 'Unknown error'}`,
            }));
          }
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        updateMessage(assistantId, (m) => ({
          ...m,
          content: m.content || t.chat.stoppedGen,
        }));
      } else {
        const msg = err instanceof Error ? err.message : String(err);
        updateMessage(assistantId, (m) => ({ ...m, content: m.content + `\n\n⚠️ ${msg}` }));
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  const charCount = input.length;
  const isLastStreaming = streaming && lastMsg?.role === 'assistant';
  const userCount = messages.filter((m) => m.role === 'user').length;

  return (
    <div className="flex h-[calc(100vh-8.5rem)] flex-col gap-3">
      {/* Conversation bar */}
      {messages.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] px-3.5 py-2">
          <div className="flex items-center gap-2">
            {isLastStreaming && (
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-amber-400" />
                <span className="text-[12px] text-amber-300/70 font-medium">{t.chat.working}</span>
              </span>
            )}
            {!isLastStreaming && (
              <span className="text-[12px] text-white/25 font-mono">
                {userCount} {userCount === 1 ? t.chat.message : t.chat.messages}
              </span>
            )}
          </div>
          <button
            onClick={clearConversation}
            disabled={streaming}
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] text-white/30 transition-colors hover:bg-white/[0.04] hover:text-white/60 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
            </svg>
            {t.chat.clear}
          </button>
        </div>
      )}

      {/* Messages area */}
      <div ref={scrollRef} className="chat-scroll flex-1 space-y-4 overflow-y-auto rounded-2xl glass p-5">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-8 text-center">
            <div>
              <div className="relative mb-5 inline-block">
                <div className="absolute inset-0 animate-glow-pulse rounded-3xl bg-amber-400/10 blur-2xl" />
                <div className="relative flex h-16 w-16 animate-float items-center justify-center rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-400/10 to-amber-600/5">
                  <svg className="h-8 w-8 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-4 3v-3Z" />
                  </svg>
                </div>
              </div>
              <p className="text-[16px] font-bold text-white/80">{t.chat.startConversation}</p>
              <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-white/35">{t.chat.tryExample}</p>
            </div>

            {/* Suggested prompts */}
            <div className="grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
              {suggestedPrompts.map((p, i) => (
                <button
                  key={p.text}
                  type="button"
                  onClick={() => void send(p.text)}
                  className={`card-shine glass glass-hover group rounded-xl px-4 py-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-400/15 stagger-${i + 1} animate-fade-up`}
                >
                  <span className="mb-1.5 block text-[17px]">{p.icon}</span>
                  <span className="block text-[12px] font-medium leading-snug text-white/55 group-hover:text-white/75">
                    {p.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <ChatMessage
              key={m.id}
              role={m.role}
              content={m.content}
              tools={m.tools}
              timestamp={m.timestamp}
              isStreaming={isLastStreaming && m.id === lastMsg?.id}
            />
          ))
        )}
      </div>

      {/* Input area */}
      <div className="focus-ring glass-strong rounded-2xl transition-all duration-300">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder={t.chat.placeholder}
          className="max-h-48 w-full resize-none bg-transparent px-4 pt-3.5 pb-1 text-[14px] leading-relaxed text-white placeholder:text-white/25 focus:outline-none"
        />
        <div className="flex items-center justify-between px-3 pb-3 pt-1.5">
          <span className="select-none text-[11px] text-white/20">
            {charCount > 300 ? (
              <span className={charCount > 900 ? 'text-red-400' : 'text-white/35'}>
                {charCount} {t.chat.message}
              </span>
            ) : (
              <span className="hidden sm:inline">{t.chat.newLine}</span>
            )}
          </span>
          <div className="flex items-center gap-2">
            {streaming && (
              <button
                onClick={stopStreaming}
                type="button"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-[12px] font-semibold text-white/55 transition-all duration-200 hover:bg-white/[0.08] hover:text-white/80"
              >
                <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="3" y="3" width="10" height="10" rx="1.5" />
                </svg>
                {t.chat.stop}
              </button>
            )}
            <button
              type="button"
              onClick={() => void send()}
              disabled={streaming || !input.trim()}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 px-4 text-[13px] font-bold text-black shadow-glow-amber transition-all duration-300 ease-expo hover:scale-[1.03] hover:shadow-[0_0_28px_rgba(251,191,36,0.4)] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100"
            >
              {streaming ? (
                <>
                  <span className="h-3 w-3 animate-pulse-soft rounded-full bg-black/60" />
                  {t.chat.working}
                </>
              ) : (
                <>
                  {t.chat.send}
                  <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.903 6.115a.75.75 0 0 0 .836.503l4.272-.978a.75.75 0 0 1 .36 1.453l-4.272.978a.75.75 0 0 0-.57.882l1.903 6.115a.75.75 0 0 0 1.302.26l14.996-14.996a.75.75 0 0 0-.26-1.302L3.105 2.288Z" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatClient({ initialMessages }: Props) {
  return (
    <Suspense>
      <ChatClientInner initialMessages={initialMessages} />
    </Suspense>
  );
}

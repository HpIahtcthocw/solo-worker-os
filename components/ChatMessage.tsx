import Markdown from './Markdown';
import { formatChatTime } from '@/lib/utils';

export interface ToolChip { name: string; summary: string }

interface Props {
  role: 'user' | 'assistant';
  content: string;
  tools?: ToolChip[];
  timestamp?: number;
  isStreaming?: boolean;
}

export default function ChatMessage({ role, content, tools, timestamp, isStreaming }: Props) {
  const isUser = role === 'user';
  const timeStr = timestamp ? formatChatTime(timestamp) : '';

  return (
    <div className={`flex gap-3 animate-fade-up ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Assistant avatar */}
      {!isUser && (
        <div className="flex-shrink-0 mt-0.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-glow-amber">
            <span className="text-[10px] font-extrabold text-black tracking-tight">AI</span>
            <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/25" />
          </div>
        </div>
      )}

      <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'} max-w-[82%]`}>
        {/* Name + time row */}
        <div className={`flex items-center gap-2 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-[12px] font-semibold text-white/30">
            {isUser ? 'You' : 'Agent'}
          </span>
          {timeStr && (
            <span className="text-[11px] text-white/20 font-mono">{timeStr}</span>
          )}
        </div>

        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${
            isUser
              ? 'rounded-tr-sm bg-gradient-to-br from-white/[0.1] to-white/[0.06] text-white ring-1 ring-inset ring-white/10 shadow-inner-top'
              : 'rounded-tl-sm glass text-white/90'
          }`}
        >
          {content ? (
            isUser ? (
              <span className="whitespace-pre-wrap">{content}</span>
            ) : (
              <span>
                <Markdown content={content} />
                {isStreaming && (
                  <span className="ml-0.5 inline-block h-[1em] w-0.5 animate-cursor-blink bg-amber-400 align-text-bottom opacity-90" />
                )}
              </span>
            )
          ) : (
            /* Typing indicator */
            <span className="inline-flex items-center gap-1.5 py-0.5">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </span>
          )}
        </div>

        {/* Tool chips */}
        {!isUser && tools && tools.length > 0 && (
          <div className="mt-0.5 flex flex-wrap gap-1.5 px-1">
            {tools.map((t, i) => (
              <span
                key={i}
                title={t.summary}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/20 bg-amber-400/6 px-2.5 py-1 text-[11px] font-semibold text-amber-300/80 transition-colors hover:border-amber-400/35 hover:text-amber-300"
              >
                <svg className="h-3 w-3 flex-shrink-0 opacity-70" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11.3 1.04a1 1 0 0 1 .6 1.27l-4 12a1 1 0 1 1-1.9-.62l4-12a1 1 0 0 1 1.3-.65ZM6.7 5.3a1 1 0 0 1 0 1.4L4.4 9l2.3 2.3a1 1 0 1 1-1.4 1.4l-3-3a1 1 0 0 1 0-1.4l3-3a1 1 0 0 1 1.4 0Zm6.6 0a1 1 0 0 1 1.4 0l3 3a1 1 0 0 1 0 1.4l-3 3a1 1 0 1 1-1.4-1.4L15.6 9l-2.3-2.3a1 1 0 0 1 0-1.4Z" />
                </svg>
                {t.name}
                {t.summary && (
                  <span className="max-w-[160px] truncate text-[10px] font-normal text-amber-300/50">
                    · {t.summary}
                  </span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="flex-shrink-0 mt-0.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.07] ring-1 ring-inset ring-white/10">
            <svg className="h-4 w-4 text-white/40" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

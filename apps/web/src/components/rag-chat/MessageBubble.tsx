'use client';

import ReactMarkdown from 'react-markdown';
import { SourceCard, type Source } from './SourceCard';

type Props = {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  isStreaming?: boolean;
};

export function MessageBubble({ role, content, sources, isStreaming }: Props) {
  const isUser = role === 'user';

  return (
    <div className={`flex w-full gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div
          className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #7c6ff7, #a78bfa)' }}
        >
          AI
        </div>
      )}

      <div className={`flex max-w-[80%] flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
          style={
            isUser
              ? {
                  background: 'linear-gradient(135deg, #7c6ff7, #9d98ff)',
                  color: '#fff',
                  borderBottomRightRadius: '4px',
                }
              : {
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  borderBottomLeftRadius: '4px',
                }
          }
        >
          {isUser ? (
            <p style={{ whiteSpace: 'pre-wrap' }}>{content}</p>
          ) : (
            <div className="prose prose-sm max-w-none prose-invert">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
          {isStreaming && (
            <span
              className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse rounded-full"
              style={{ background: 'var(--accent)', verticalAlign: 'middle' }}
            />
          )}
        </div>

        {!isUser && sources && sources.length > 0 && !isStreaming && (
          <div className="w-full space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Sources
            </p>
            {sources.map((s, i) => (
              <SourceCard key={i} source={s} index={i + 1} />
            ))}
          </div>
        )}
      </div>

      {isUser && (
        <div
          className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }}
        >
          U
        </div>
      )}
    </div>
  );
}

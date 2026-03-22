'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, BookOpen, Loader2 } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import type { Source } from './SourceCard';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
};

type Props = {
  conversationId: string | null;
  workspaceName: string | null;
};

const LOADING_STEPS = [
  'Searching knowledge base…',
  'Reranking results…',
  'Generating answer…',
];

export function ChatWindow({ conversationId, workspaceName }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!conversationId) { setMessages([]); return; }
    setLoadingHistory(true);
    fetch(`/api/conversations/${conversationId}/messages`)
      .then((r) => r.json())
      .then((data) => {
        const msgs: ChatMessage[] = (data.messages ?? []).map((m: {
          id: string; role: 'user' | 'assistant'; content: string; sources?: Source[];
        }) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          sources: m.sources ?? [],
        }));
        setMessages(msgs);
      })
      .catch(() => setMessages([]))
      .finally(() => setLoadingHistory(false));
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const startLoadingSteps = () => {
    setLoadingStep(0);
    let step = 0;
    stepTimerRef.current = setInterval(() => {
      step = Math.min(step + 1, LOADING_STEPS.length - 1);
      setLoadingStep(step);
    }, 4000);
  };

  const stopLoadingSteps = () => {
    if (stepTimerRef.current) {
      clearInterval(stepTimerRef.current);
      stepTimerRef.current = null;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !conversationId || isLoading) return;

    const userContent = input.trim();
    setInput('');

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: userContent,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    startLoadingSteps();

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: userContent }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error((err as { error?: string }).error ?? 'Request failed');
      }

      const data = await res.json() as { message: ChatMessage; sources: Source[] };

      const assistantMsg: ChatMessage = {
        id: data.message.id,
        role: 'assistant',
        content: data.message.content,
        sources: data.sources ?? [],
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, something went wrong: ${(err as Error).message}`,
        sources: [],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      stopLoadingSteps();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  if (!conversationId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)' }}
        >
          <BookOpen size={24} style={{ color: 'var(--accent)' }} />
        </div>
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            RAG Chat
          </h2>
          <p className="mt-1 max-w-sm text-sm" style={{ color: 'var(--text-secondary)' }}>
            Select a workspace and start a conversation to chat with your ingested documents.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-3.5"
        style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface)' }}
      >
        <div
          className="h-2 w-2 rounded-full"
          style={{
            background: isLoading ? '#f59e0b' : '#22c55e',
            boxShadow: `0 0 6px ${isLoading ? '#f59e0b' : '#22c55e'}`,
          }}
        />
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {workspaceName ?? 'Workspace Chat'}
        </span>
        {isLoading && (
          <span className="ml-auto flex items-center gap-1.5 text-xs font-medium" style={{ color: '#a78bfa' }}>
            <Loader2 size={12} className="animate-spin" />
            {LOADING_STEPS[loadingStep]}
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {loadingHistory ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={20} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen size={32} className="mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Ask anything about your documents
            </p>
            <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              The AI will search your knowledge base and cite its sources
            </p>
            <div className="mt-6 grid gap-2 text-left">
              {[
                'Summarize the key concepts in my documents',
                'What does the research say about RAG?',
                'Explain the main findings',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => { setInput(suggestion); textareaRef.current?.focus(); }}
                  className="rounded-xl px-4 py-2.5 text-xs transition-all hover:opacity-80"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    textAlign: 'left',
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg) => (
              msg.content.trim() ? (
                <MessageBubble
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  sources={msg.sources}
                />
              ) : null
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                  style={{ background: 'linear-gradient(135deg, #7c6ff7, #a78bfa)', color: '#fff' }}
                >
                  AI
                </div>
                <div
                  className="flex items-center gap-2.5 rounded-2xl rounded-bl-sm px-4 py-3"
                  style={{ background: 'var(--surface-elevated, #1e1e2e)', border: '1px solid #3b3b52' }}
                >
                  <Loader2 size={13} className="animate-spin" style={{ color: '#a78bfa' }} />
                  <span className="text-sm font-medium" style={{ color: '#c4b5fd' }}>
                    {LOADING_STEPS[loadingStep]}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-5 pb-5 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div
          className="flex items-end gap-3 rounded-2xl px-4 py-3"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your documents… (Enter to send, Shift+Enter for newline)"
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none bg-transparent text-sm outline-none disabled:opacity-50"
            style={{ color: 'var(--text-primary)', maxHeight: '120px', overflowY: 'auto' }}
          />
          <button
            onClick={() => void handleSend()}
            disabled={!input.trim() || isLoading}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all disabled:opacity-40"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            {isLoading
              ? <Loader2 size={14} className="animate-spin" />
              : <Send size={14} />}
          </button>
        </div>
        <p className="mt-2 text-center text-[10px]" style={{ color: 'var(--text-muted)' }}>
          Answers grounded in your workspace documents
        </p>
      </div>
    </div>
  );
}

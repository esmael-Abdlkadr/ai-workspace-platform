'use client';

import { useState } from 'react';
import { ArrowUp, Loader2 } from 'lucide-react';

type Props = { onSubmit: (prompt: string) => void; isLoading: boolean; disabled?: boolean };

export function ChatInput({ onSubmit, isLoading, disabled }: Props) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading || disabled) return;
    onSubmit(prompt.trim());
    setPrompt('');
  };

  const canSubmit = !isLoading && !disabled && prompt.trim().length > 0;

  return (
    <form onSubmit={handleSubmit}>
      <div
        className="relative rounded-xl transition-all"
        style={{
          background: 'var(--surface-2)',
          border: `1px solid ${isLoading ? 'var(--accent)60' : 'var(--border)'}`,
          boxShadow: isLoading ? '0 0 24px var(--accent)10' : 'none',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <textarea
          placeholder={disabled ? 'Select a workspace first…' : 'Ask a research question or request a document to be written…'}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isLoading || disabled}
          rows={5}
          className="w-full resize-none rounded-xl px-4 py-3.5 text-sm outline-none disabled:cursor-not-allowed"
          style={{ background: 'transparent', color: 'var(--text-primary)' }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e);
          }}
        />
        <div className="flex items-center justify-between px-3 pb-3">
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>⌘ Enter to send</span>
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-all disabled:opacity-30"
            style={{
              background: canSubmit ? 'var(--accent)' : 'var(--surface-3)',
              color: '#fff',
              boxShadow: canSubmit ? '0 0 16px var(--accent)40' : 'none',
            }}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </form>
  );
}

'use client';

import { useState } from 'react';
import { ChevronDown, FileText } from 'lucide-react';

export type Source = {
  documentTitle: string;
  chunkText: string;
  source: string;
  score: number;
};

export function SourceCard({ source, index }: { source: Source; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <button
      onClick={() => setExpanded((v) => !v)}
      className="w-full rounded-xl text-left transition-all"
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold"
          style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
        >
          {index}
        </span>
        <FileText size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <span className="flex-1 truncate text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          {source.documentTitle || source.source}
        </span>
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {(source.score * 100).toFixed(0)}%
        </span>
        <ChevronDown
          size={12}
          style={{
            color: 'var(--text-muted)',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s',
            flexShrink: 0,
          }}
        />
      </div>
      {expanded && (
        <div
          className="px-3 pb-3 text-xs leading-relaxed"
          style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)' }}
        >
          <p className="pt-2">{source.chunkText}</p>
        </div>
      )}
    </button>
  );
}

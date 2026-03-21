'use client';

import { useState } from 'react';
import { Search, Loader2, Brain, Sparkles } from 'lucide-react';
import { api, type Memory } from '@/lib/api';

type Props = { workspaceId: string };

export function MemorySearch({ workspaceId }: Props) {
  const [query, setQuery] = useState('');
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true); setError(null);
    try {
      const { memories: m } = await api.memory.search(query.trim(), workspaceId);
      setMemories(m); setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div
          className="flex flex-1 items-center gap-2 rounded-xl px-3"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
        >
          <Search className="h-4 w-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
          <input
            placeholder="Search memories by topic or concept..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            className="flex-1 bg-transparent py-2.5 text-sm outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-xl transition-all disabled:opacity-40"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </button>
      </form>

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--danger-dim)', color: 'var(--danger)' }}>
          {error}
        </div>
      )}

      {searched && memories.length === 0 && (
        <div
          className="flex flex-col items-center justify-center gap-2 rounded-xl p-10"
          style={{ border: '1px dashed var(--border)', background: 'var(--surface)' }}
        >
          <Brain className="h-7 w-7 opacity-20" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No memories found for this query.</p>
        </div>
      )}

      {memories.length > 0 && (
        <div className="flex flex-col gap-2">
          {memories.map((mem, i) => (
            <div
              key={mem.id}
              className="flex gap-3 rounded-xl p-4"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}
            >
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold"
                style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
              >
                {i + 1}
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <p className="text-sm leading-relaxed line-clamp-4" style={{ color: 'var(--text-secondary)' }}>{mem.content}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3" style={{ color: 'var(--accent)' }} />
                      <span className="text-[11px] font-medium" style={{ color: 'var(--accent)' }}>
                        {(mem.similarity * 100).toFixed(1)}% match
                      </span>
                    </div>
                    {mem.importanceScore != null && !isNaN(mem.importanceScore) && (
                      <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        importance {(mem.importanceScore * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

type Props = { workspaceId: string; onSuccess: () => void };

export function IngestForm({ workspaceId, onSuccess }: Props) {
  const [type, setType] = useState<'text' | 'url'>('text');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ chunkCount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setResult(null); setLoading(true);
    try {
      const body = type === 'text'
        ? { type: 'text' as const, content, workspaceId, title: title || undefined }
        : { type: 'url' as const, url, workspaceId, title: title || undefined };
      const res = await api.documents.ingest(body);
      if (res.status === 'error') throw new Error('Document produced zero chunks — try longer content');
      setResult({ chunkCount: res.chunkCount });
      setContent(''); setUrl(''); setTitle('');
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ingestion failed');
    } finally { setLoading(false); }
  };

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}
    >
      <p className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Ingest Document</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex gap-1.5">
          {(['text', 'url'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
              style={
                type === t
                  ? { background: 'var(--accent)', color: '#fff' }
                  : { background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
              }
            >
              {t === 'text' ? 'Plain Text' : 'URL'}
            </button>
          ))}
        </div>

        <input
          className="w-full rounded-lg px-3 py-2 text-sm outline-none"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
        />

        {type === 'text' ? (
          <textarea
            className="w-full resize-none rounded-lg px-3 py-2 text-sm outline-none"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            placeholder="Paste document content here (min 100 characters)..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
            rows={5}
          />
        ) : (
          <input
            type="url"
            className="w-full rounded-lg px-3 py-2 text-sm outline-none"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            placeholder="https://example.com/article"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
        )}

        <button
          type="submit"
          disabled={loading || (type === 'text' ? !content.trim() : !url.trim())}
          className="flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-all disabled:opacity-40"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Ingesting...</> : <><Upload className="h-4 w-4" />Ingest</>}
        </button>

        {result && (
          <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium" style={{ background: 'var(--success-dim)', color: 'var(--success)' }}>
            <CheckCircle2 className="h-3.5 w-3.5" />
            Ingested with {result.chunkCount} chunk{result.chunkCount !== 1 ? 's' : ''}
          </div>
        )}
        {error && (
          <div className="rounded-lg px-3 py-2 text-xs" style={{ background: 'var(--danger-dim)', color: 'var(--danger)' }}>
            {error}
          </div>
        )}
      </form>
    </div>
  );
}

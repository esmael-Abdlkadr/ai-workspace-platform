'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Loader2, CheckCircle2, FileText, X } from 'lucide-react';
import { api } from '@/lib/api';

type Props = { workspaceId: string; onSuccess: () => void };
type Tab = 'text' | 'url' | 'pdf';

export function IngestForm({ workspaceId, onSuccess }: Props) {
  const [type, setType] = useState<Tab>('text');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ chunkCount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.toLowerCase().endsWith('.pdf')) {
      setPdfFile(file);
      if (!title) setTitle(file.name.replace('.pdf', ''));
    } else {
      setError('Only PDF files are supported');
    }
  }, [title]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfFile(file);
      if (!title) setTitle(file.name.replace('.pdf', ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setResult(null); setLoading(true);
    try {
      if (type === 'pdf') {
        if (!pdfFile) throw new Error('Please select a PDF file');
        const formData = new FormData();
        formData.append('file', pdfFile);
        formData.append('workspaceId', workspaceId);
        if (title) formData.append('title', title);

        const res = await fetch('/api/documents/ingest/pdf', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json() as { status?: string; chunkCount?: number; error?: string };
        if (!res.ok) throw new Error(data.error ?? 'PDF ingestion failed');
        if (data.status === 'error') throw new Error('PDF produced zero chunks — try a different file');
        setResult({ chunkCount: data.chunkCount ?? 0 });
        setPdfFile(null); setTitle('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        const body = type === 'text'
          ? { type: 'text' as const, content, workspaceId, title: title || undefined }
          : { type: 'url' as const, url, workspaceId, title: title || undefined };
        const res = await api.documents.ingest(body);
        if (res.status === 'error') throw new Error('Document produced zero chunks — try longer content');
        setResult({ chunkCount: res.chunkCount });
        setContent(''); setUrl(''); setTitle('');
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ingestion failed');
    } finally { setLoading(false); }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'pdf', label: 'PDF Upload' },
    { id: 'url', label: 'URL' },
    { id: 'text', label: 'Plain Text' },
  ];

  const canSubmit = !loading && (
    type === 'text' ? content.trim().length >= 100 :
    type === 'url' ? url.trim().length > 0 :
    pdfFile !== null
  );

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}
    >
      <p className="mb-3 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
        Ingest Document
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Tab switcher */}
        <div className="flex gap-1.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => { setType(t.id); setError(null); setResult(null); }}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
              style={
                type === t.id
                  ? { background: 'var(--accent)', color: '#fff' }
                  : { background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Title (always shown) */}
        <input
          className="w-full rounded-lg px-3 py-2 text-sm outline-none"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
        />

        {/* PDF Drop zone */}
        {type === 'pdf' && (
          pdfFile ? (
            <div
              className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--accent)', color: 'var(--text-primary)' }}
            >
              <FileText size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{pdfFile.name}</p>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {(pdfFile.size / 1024).toFixed(0)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setPdfFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className="shrink-0 rounded-lg p-1 hover:opacity-70"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl py-8 transition-all"
              style={{
                border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border)'}`,
                background: dragging ? 'var(--accent-dim)' : 'var(--surface-2)',
              }}
            >
              <Upload size={22} style={{ color: dragging ? 'var(--accent)' : 'var(--text-muted)' }} />
              <p className="text-sm font-medium" style={{ color: dragging ? 'var(--accent)' : 'var(--text-secondary)' }}>
                Drop PDF here or click to browse
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Max 20 MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          )
        )}

        {/* URL input */}
        {type === 'url' && (
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

        {/* Plain text area */}
        {type === 'text' && (
          <textarea
            className="w-full resize-none rounded-lg px-3 py-2 text-sm outline-none"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            placeholder="Paste document content here (min 100 characters)..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
            rows={5}
          />
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-all disabled:opacity-40"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          {loading
            ? <><Loader2 className="h-4 w-4 animate-spin" />Ingesting…</>
            : <><Upload className="h-4 w-4" />Ingest</>}
        </button>

        {result && (
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium"
            style={{ background: 'var(--success-dim)', color: 'var(--success)' }}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Ingested successfully — {result.chunkCount} chunk{result.chunkCount !== 1 ? 's' : ''} created
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

import { FileText, Globe, FileType } from 'lucide-react';
import type { Document } from '@/lib/api';

const sourceIcons: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  url: Globe,
  text: FileType,
  pdf: FileText,
};

const statusStyle: Record<string, { bg: string; color: string }> = {
  complete:   { bg: 'var(--success-dim)', color: 'var(--success)' },
  processing: { bg: 'var(--warning-dim)', color: 'var(--warning)' },
  error:      { bg: 'var(--danger-dim)',  color: 'var(--danger)' },
  pending:    { bg: 'var(--surface-3)',   color: 'var(--text-muted)' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function DocumentList({ documents }: { documents: Document[] }) {
  if (documents.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-2 rounded-xl p-10"
        style={{ border: '1px dashed var(--border)', background: 'var(--surface)' }}
      >
        <FileText className="h-7 w-7 opacity-20" style={{ color: 'var(--text-muted)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No documents yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {documents.map((doc) => {
        const Icon = sourceIcons[doc.sourceType] ?? FileText;
        const s = statusStyle[doc.status] ?? statusStyle.pending;
        return (
          <div
            key={doc.id}
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ background: 'var(--surface-2)' }}
            >
              <Icon className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{doc.title}</p>
              {doc.sourceUrl && (
                <a
                  href={doc.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate text-[11px] hover:underline"
                  style={{ color: 'var(--text-muted)', maxWidth: '280px' }}
                >
                  {doc.sourceUrl}
                </a>
              )}
            </div>
            <span className="hidden shrink-0 text-[11px] sm:block" style={{ color: 'var(--text-muted)' }}>
              {formatDate(doc.createdAt)}
            </span>
            <span
              className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
              style={s}
            >
              {doc.status}
            </span>
          </div>
        );
      })}
    </div>
  );
}

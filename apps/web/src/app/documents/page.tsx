'use client';

import { useState, useCallback } from 'react';
import { RefreshCw, FileText } from 'lucide-react';
import { DocumentList } from '@/components/documents/DocumentList';
import { IngestForm } from '@/components/documents/IngestForm';
import { WorkspaceSelector } from '@/components/workspace/WorkspaceSelector';
import { api, type Document, type Workspace } from '@/lib/api';

export default function DocumentsPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  const fetchDocs = useCallback(async (id: string) => {
    setLoading(true); setError(null);
    try {
      const { documents: d } = await api.documents.list(id);
      setDocuments(d); setFetched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally { setLoading(false); }
  }, []);

  const handleWorkspaceChange = (ws: Workspace) => {
    setWorkspace(ws);
    fetchDocs(ws.id);
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)30' }}>
          <FileText className="h-4 w-4" style={{ color: 'var(--accent)' }} />
        </div>
        <div className="flex-1">
          <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Documents</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Ingest and manage knowledge base documents.</p>
        </div>
        <div className="flex items-center gap-2">
          {fetched && workspace && (
            <button
              onClick={() => fetchDocs(workspace.id)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium hover:opacity-80"
              style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </button>
          )}
          <div className="w-52">
            <WorkspaceSelector value={workspace?.id ?? null} onChange={handleWorkspaceChange} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-6">
        {error && (
          <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--danger-dim)', color: 'var(--danger)', border: '1px solid var(--danger)30' }}>
            {error}
          </div>
        )}

        {!workspace ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl p-12" style={{ border: '1px dashed var(--border)', background: 'var(--surface)' }}>
            <FileText className="h-8 w-8 opacity-20" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Select a workspace to manage documents.</p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {loading ? (
                <div className="flex flex-col gap-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'var(--surface)' }} />
                  ))}
                </div>
              ) : <DocumentList documents={documents} />}
            </div>
            <IngestForm workspaceId={workspace.id} onSuccess={() => fetchDocs(workspace.id)} />
          </div>
        )}
      </div>
    </div>
  );
}

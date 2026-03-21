'use client';

import { useState } from 'react';
import { Library, RefreshCw, ExternalLink, Download, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { WorkspaceSelector } from '@/components/workspace/WorkspaceSelector';
import { api, type Output, type Workspace } from '@/lib/api';

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60);
}

function downloadMd(content: string, prompt: string) {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slugify(prompt)}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function OutputsPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchOutputs = async (id: string) => {
    setLoading(true);
    try {
      const { outputs: o } = await api.outputs.list(id);
      setOutputs(o); setFetched(true);
    } catch {}
    finally { setLoading(false); }
  };

  const handleWorkspaceChange = (ws: Workspace) => {
    setWorkspace(ws);
    fetchOutputs(ws.id);
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)30' }}>
          <Library className="h-4 w-4" style={{ color: 'var(--accent)' }} />
        </div>
        <div className="flex-1">
          <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Outputs</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>All AI-generated documents saved from completed workflows.</p>
        </div>
        <div className="flex items-center gap-2">
          {fetched && workspace && (
            <button
              onClick={() => fetchOutputs(workspace.id)}
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

      <div className="flex flex-col gap-3 p-6">
        {!workspace && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl p-12" style={{ border: '1px dashed var(--border)', background: 'var(--surface)' }}>
            <Library className="h-8 w-8 opacity-20" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Select a workspace to view saved outputs.</p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: 'var(--surface)' }} />
            ))}
          </div>
        )}

        {fetched && !loading && outputs.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl p-12" style={{ border: '1px dashed var(--border)', background: 'var(--surface)' }}>
            <FileText className="h-8 w-8 opacity-20" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No completed outputs yet. Run a workflow in Chat first.</p>
          </div>
        )}

        {outputs.map((output) => (
          <div
            key={output.id}
            className="flex flex-col overflow-hidden rounded-xl"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}
          >
            <div
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:opacity-80 transition-opacity"
              style={{ borderBottom: expanded === output.id ? '1px solid var(--border-subtle)' : 'none' }}
              onClick={() => setExpanded(expanded === output.id ? null : output.id)}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--accent-dim)' }}>
                <FileText className="h-4 w-4" style={{ color: 'var(--accent)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{output.prompt}</p>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {output.completedAt ? formatDate(output.completedAt) : formatDate(output.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {output.notionPageUrl && (
                  <a
                    href={output.notionPageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium hover:opacity-80"
                    style={{ background: 'var(--accent-dim)', color: 'var(--accent-hover)' }}
                  >
                    <ExternalLink className="h-3 w-3" />
                    Notion
                  </a>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); downloadMd(output.result, output.prompt); }}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium hover:opacity-80"
                  style={{ background: 'var(--surface-3)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                >
                  <Download className="h-3 w-3" />
                  .md
                </button>
              </div>
            </div>

            {expanded === output.id && (
              <div className="overflow-y-auto p-5" style={{ maxHeight: '50vh' }}>
                <style>{`
                  .out-prose h1,.out-prose h2,.out-prose h3{color:var(--text-primary);font-weight:600;margin-top:1.2em;margin-bottom:0.4em}
                  .out-prose h1{font-size:1.2em}.out-prose h2{font-size:1.05em}.out-prose h3{font-size:.95em;color:var(--accent-hover)}
                  .out-prose p{color:var(--text-secondary);line-height:1.7;margin-bottom:.7em}
                  .out-prose ul,.out-prose ol{color:var(--text-secondary);padding-left:1.25em}
                  .out-prose li{margin-bottom:.2em}
                  .out-prose strong{color:var(--text-primary);font-weight:600}
                  .out-prose code{background:var(--surface-3);color:var(--accent-hover);padding:.1em .3em;border-radius:4px;font-size:.85em}
                `}</style>
                <div className="out-prose">
                  <ReactMarkdown>{output.result}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

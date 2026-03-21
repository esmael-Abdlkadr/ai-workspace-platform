'use client';

import { useEffect, useState } from 'react';
import { Plus, ChevronDown, Loader2, Check, Layers } from 'lucide-react';
import { api, type Workspace } from '@/lib/api';
import { cn } from '@/lib/utils';

type Props = {
  value: string | null;
  onChange: (workspace: Workspace) => void;
};

export function WorkspaceSelector({ value, onChange }: Props) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const selected = workspaces.find((w) => w.id === value) ?? null;

  useEffect(() => {
    api.workspaces.list()
      .then(({ workspaces: ws }) => {
        setWorkspaces(ws);
        if (ws.length === 1 && !value) onChange(ws[0]!);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const { workspace } = await api.workspaces.create({ name: newName.trim() });
      setWorkspaces((prev) => [...prev, workspace]);
      onChange(workspace);
      setNewName('');
      setCreating(false);
      setOpen(false);
    } catch {}
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="flex h-10 items-center gap-2 rounded-xl px-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
        <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--text-muted)' }} />
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading workspaces…</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:opacity-80"
        style={{
          background: 'var(--surface-2)',
          border: `1px solid ${open ? 'var(--accent)60' : 'var(--border)'}`,
          color: selected ? 'var(--text-primary)' : 'var(--text-muted)',
        }}
      >
        <Layers className="h-4 w-4 shrink-0" style={{ color: selected ? 'var(--accent)' : 'var(--text-muted)' }} />
        <span className="flex-1 truncate text-left">
          {selected ? selected.name : 'Select workspace…'}
        </span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 transition-transform', open && 'rotate-180')}
          style={{ color: 'var(--text-muted)' }}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-1.5 flex w-64 flex-col overflow-hidden rounded-xl shadow-xl"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', boxShadow: '0 16px 48px #00000060' }}
        >
          {workspaces.length === 0 && !creating && (
            <p className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>
              No workspaces yet. Create one below.
            </p>
          )}

          {workspaces.map((ws) => (
            <button
              key={ws.id}
              type="button"
              onClick={() => { onChange(ws); setOpen(false); }}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:opacity-80 text-left"
              style={{
                background: ws.id === value ? 'var(--accent-dim)' : 'transparent',
                color: ws.id === value ? 'var(--accent-hover)' : 'var(--text-secondary)',
              }}
            >
              <div
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold uppercase"
                style={{ background: 'var(--surface-3)', color: 'var(--accent)' }}
              >
                {ws.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{ws.name}</p>
              </div>
              {ws.id === value && <Check className="h-3.5 w-3.5 shrink-0" />}
            </button>
          ))}

          <div style={{ borderTop: workspaces.length > 0 ? '1px solid var(--border-subtle)' : 'none' }}>
            {!creating ? (
              <button
                type="button"
                onClick={() => setCreating(true)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: 'var(--accent)' }}
              >
                <Plus className="h-4 w-4" />
                New workspace
              </button>
            ) : (
              <form onSubmit={handleCreate} className="flex flex-col gap-2 p-2">
                <input
                  autoFocus
                  placeholder="Workspace name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ background: 'var(--surface-3)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={saving || !newName.trim()}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all disabled:opacity-40"
                    style={{ background: 'var(--accent)', color: '#fff' }}
                  >
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCreating(false); setNewName(''); }}
                    className="rounded-lg px-3 py-2 text-xs font-medium"
                    style={{ background: 'var(--surface-3)', color: 'var(--text-muted)' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

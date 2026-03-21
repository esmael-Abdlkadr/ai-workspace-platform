'use client';

import { useState } from 'react';
import { Brain } from 'lucide-react';
import { MemorySearch } from '@/components/memory/MemorySearch';
import { WorkspaceSelector } from '@/components/workspace/WorkspaceSelector';
import type { Workspace } from '@/lib/api';

export default function MemoryPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)30' }}>
          <Brain className="h-4 w-4" style={{ color: 'var(--accent)' }} />
        </div>
        <div className="flex-1">
          <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Memory</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Search long-term memories stored by the Memory agent.</p>
        </div>
        <div className="w-52">
          <WorkspaceSelector value={workspace?.id ?? null} onChange={setWorkspace} />
        </div>
      </div>

      <div className="flex flex-col gap-4 p-6">
        {!workspace ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl p-12" style={{ border: '1px dashed var(--border)', background: 'var(--surface)' }}>
            <Brain className="h-8 w-8 opacity-20" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Select a workspace to search memories.</p>
          </div>
        ) : (
          <MemorySearch workspaceId={workspace.id} />
        )}
      </div>
    </div>
  );
}

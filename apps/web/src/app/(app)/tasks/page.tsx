'use client';

import { useState } from 'react';
import { RefreshCw, ListTodo } from 'lucide-react';
import { TaskList } from '@/components/tasks/TaskList';
import { WorkspaceSelector } from '@/components/workspace/WorkspaceSelector';
import { api, type Task, type Workspace } from '@/lib/api';

export default function TasksPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  const fetchTasks = async (id: string) => {
    setLoading(true); setError(null);
    try {
      const { tasks: t } = await api.tasks.list(id);
      setTasks(t); setFetched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally { setLoading(false); }
  };

  const handleWorkspaceChange = (ws: Workspace) => {
    setWorkspace(ws);
    fetchTasks(ws.id);
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)30' }}>
          <ListTodo className="h-4 w-4" style={{ color: 'var(--accent)' }} />
        </div>
        <div className="flex-1">
          <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Tasks</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>All workflow runs for the selected workspace.</p>
        </div>
        <div className="flex items-center gap-2">
          {fetched && workspace && (
            <button
              onClick={() => fetchTasks(workspace.id)}
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

      <div className="p-6 flex flex-col gap-4">
        {error && (
          <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--danger-dim)', color: 'var(--danger)', border: '1px solid var(--danger)30' }}>
            {error}
          </div>
        )}

        {!workspace && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl p-12" style={{ border: '1px dashed var(--border)', background: 'var(--surface)' }}>
            <ListTodo className="h-8 w-8 opacity-20" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Select a workspace to view tasks.</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'var(--surface)' }} />
            ))}
          </div>
        ) : fetched && <TaskList tasks={tasks} />}
      </div>
    </div>
  );
}

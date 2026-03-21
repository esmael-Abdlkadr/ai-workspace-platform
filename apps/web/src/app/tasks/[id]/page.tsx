'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { TaskStatusBadge } from '@/components/tasks/TaskStatusBadge';
import { ResultCard } from '@/components/chat/ResultCard';
import { api, type Task } from '@/lib/api';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.tasks.get(id)
      .then(({ task: t }) => setTask(t))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load task'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <Link
        href="/tasks"
        className="flex w-fit items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all hover:opacity-80"
        style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Tasks
      </Link>

      {loading && (
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 rounded-xl animate-pulse" style={{ background: 'var(--surface)' }} />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--danger-dim)', color: 'var(--danger)', border: '1px solid var(--danger)30' }}>
          {error}
        </div>
      )}

      {task && (
        <div className="flex flex-col gap-4">
          <div
            className="rounded-xl p-4"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-lg font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
                {task.prompt}
              </p>
              <TaskStatusBadge status={task.status} />
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>
              <span>Created {formatDate(task.createdAt)}</span>
              {task.completedAt && <span>· Completed {formatDate(task.completedAt)}</span>}
              {task.currentStep && task.status === 'running' && (
                <span style={{ color: 'var(--accent)' }}>· Running: {task.currentStep}</span>
              )}
            </div>
          </div>

          {task.result ? (
            <ResultCard result={task.result} notionPageUrl={task.notionPageUrl} title={task.prompt} />
          ) : task.errorMessage ? (
            <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--danger-dim)', color: 'var(--danger)', border: '1px solid var(--danger)30' }}>
              Error: {task.errorMessage}
            </div>
          ) : (
            <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              Workflow is {task.status}
              {task.currentStep ? ` — current step: ${task.currentStep}` : ''}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

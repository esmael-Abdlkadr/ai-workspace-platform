import Link from 'next/link';
import { ArrowRight, MessageSquare } from 'lucide-react';
import { TaskStatusBadge } from './TaskStatusBadge';
import type { Task } from '@/lib/api';

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function TaskList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 rounded-xl p-12"
        style={{ border: '1px dashed var(--border)', background: 'var(--surface)' }}
      >
        <MessageSquare className="h-8 w-8 opacity-20" style={{ color: 'var(--text-muted)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No tasks yet. Start one from the Chat page.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {tasks.map((task) => (
        <Link
          key={task.id}
          href={`/tasks/${task.id}`}
          className="group flex items-center gap-4 rounded-xl px-4 py-3.5 transition-all hover:opacity-90"
          style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {task.prompt}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {timeAgo(task.createdAt)}
              </span>
              {task.currentStep && task.status === 'running' && (
                <span className="text-[11px]" style={{ color: 'var(--accent)' }}>
                  · {task.currentStep}
                </span>
              )}
            </div>
          </div>
          <TaskStatusBadge status={task.status} />
          <ArrowRight
            className="h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
            style={{ color: 'var(--text-muted)' }}
          />
        </Link>
      ))}
    </div>
  );
}

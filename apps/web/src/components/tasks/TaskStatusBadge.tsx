import type { TaskStatus } from '@/lib/api';

const config: Record<TaskStatus, { label: string; bg: string; color: string }> = {
  pending:  { label: 'Pending',  bg: 'var(--surface-3)',   color: 'var(--text-muted)' },
  running:  { label: 'Running',  bg: 'var(--warning-dim)', color: 'var(--warning)' },
  complete: { label: 'Complete', bg: 'var(--success-dim)', color: 'var(--success)' },
  error:    { label: 'Error',    bg: 'var(--danger-dim)',  color: 'var(--danger)' },
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const c = config[status] ?? config.pending;
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
      style={{ background: c.bg, color: c.color }}
    >
      {status === 'running' && (
        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: c.color }} />
      )}
      {c.label}
    </span>
  );
}

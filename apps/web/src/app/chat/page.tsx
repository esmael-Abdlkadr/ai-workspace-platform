'use client';

import { useState, useEffect } from 'react';
import { ChatInput } from '@/components/chat/ChatInput';
import { WorkflowVisualizer } from '@/components/chat/WorkflowVisualizer';
import { ResultCard } from '@/components/chat/ResultCard';
import { WorkspaceSelector } from '@/components/workspace/WorkspaceSelector';
import { useSSE } from '@/lib/use-sse';
import { api, type Task, type Workspace } from '@/lib/api';
import { Zap } from 'lucide-react';

export default function ChatPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sseUrl = taskId ? `/api/tasks/${taskId}/stream` : null;
  const sse = useSSE(sseUrl);

  useEffect(() => {
    if ((sse.status === 'complete' || sse.status === 'error') && taskId) {
      api.tasks.get(taskId)
        .then(({ task: t }) => { setTask(t); setIsLoading(false); })
        .catch(() => setIsLoading(false));
    }
  }, [sse.status, taskId]);

  const handleSubmit = async (prompt: string) => {
    if (!workspace) return;
    setError(null); setTask(null); setTaskId(null); setIsLoading(true);
    try {
      const { taskId: id } = await api.tasks.create({ prompt, workspaceId: workspace.id });
      setTaskId(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start workflow');
      setIsLoading(false);
    }
  };

  const isActive = isLoading || (sse.status !== null && sse.status !== 'complete' && sse.status !== 'error');
  const showVisualizer = sse.currentStep || sse.status;
  const showResult = task?.result;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)30' }}>
          <Zap className="h-4 w-4" style={{ color: 'var(--accent)' }} />
        </div>
        <div className="flex-1">
          <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Chat</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Submit a research prompt and watch the multi-agent workflow run in real time.</p>
        </div>
        <div className="w-56">
          <WorkspaceSelector value={workspace?.id ?? null} onChange={setWorkspace} />
        </div>
      </div>

      <div className="flex flex-1 gap-0 overflow-hidden">
        <div className="flex w-full flex-col gap-4 overflow-y-auto p-6 md:w-[420px] md:border-r" style={{ borderColor: 'var(--border-subtle)' }}>
          {!workspace && (
            <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--warning-dim)', color: 'var(--warning)', border: '1px solid var(--warning)30' }}>
              Select or create a workspace first (top right).
            </div>
          )}
          <ChatInput onSubmit={handleSubmit} isLoading={isActive} disabled={!workspace} />
          {error && (
            <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--danger-dim)', border: '1px solid var(--danger)30', color: 'var(--danger)' }}>
              {error}
            </div>
          )}
        </div>

        <div className="hidden flex-1 flex-col gap-4 overflow-y-auto p-6 md:flex">
          {!showVisualizer && !showResult && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 opacity-40">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: 'var(--surface-2)' }}>
                <Zap className="h-7 w-7" style={{ color: 'var(--text-muted)' }} />
              </div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Workflow output will appear here</p>
            </div>
          )}
          {showVisualizer && <WorkflowVisualizer currentStep={sse.currentStep} status={sse.status} />}
          {showResult && <ResultCard result={task.result!} notionPageUrl={task.notionPageUrl} title={task.prompt} />}
          {sse.status === 'error' && !task?.result && (
            <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--danger-dim)', border: '1px solid var(--danger)30', color: 'var(--danger)' }}>
              Workflow failed: {task?.errorMessage ?? 'Unknown error'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

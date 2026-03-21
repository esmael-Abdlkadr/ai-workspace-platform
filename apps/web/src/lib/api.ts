export type TaskStatus = 'pending' | 'running' | 'complete' | 'error';

export type Workspace = {
  id: string;
  name: string;
  createdAt: string;
};

export type Task = {
  id: string;
  workspaceId: string;
  prompt: string;
  status: TaskStatus;
  result: string | null;
  currentStep: string | null;
  notionPageUrl: string | null;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
};

export type Document = {
  id: string;
  workspaceId: string;
  title: string;
  sourceUrl: string | null;
  sourceType: string;
  status: string;
  errorMessage: string | null;
  createdAt: string;
};

export type Output = {
  id: string;
  prompt: string;
  result: string;
  notionPageUrl: string | null;
  completedAt: string | null;
  createdAt: string;
};

export type Memory = {
  id: string;
  workspaceId: string;
  content: string;
  importanceScore: number;
  createdAt: string;
  similarity: number;
};

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export const api = {
  workspaces: {
    list: () =>
      fetch('/api/workspaces').then((r) => json<{ workspaces: Workspace[] }>(r)),
    create: (body: { name: string }) =>
      fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then((r) => json<{ workspace: Workspace }>(r)),
  },
  tasks: {
    create: (body: { prompt: string; workspaceId: string }) =>
      fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then((r) => json<{ taskId: string; status: TaskStatus }>(r)),

    list: (workspaceId: string, limit = 50) =>
      fetch(`/api/tasks?workspaceId=${workspaceId}&limit=${limit}`).then(
        (r) => json<{ tasks: Task[] }>(r),
      ),

    get: (id: string) =>
      fetch(`/api/tasks/${id}`).then((r) => json<{ task: Task }>(r)),
  },

  documents: {
    ingest: (body: { type: 'text' | 'url'; content?: string; url?: string; workspaceId: string; title?: string }) =>
      fetch('/api/documents/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then((r) => json<{ documentId: string; chunkCount: number; status: string }>(r)),

    list: (workspaceId: string) =>
      fetch(`/api/documents?workspaceId=${workspaceId}`).then(
        (r) => json<{ documents: Document[] }>(r),
      ),

    search: (body: { query: string; workspaceId: string; topK?: number }) =>
      fetch('/api/documents/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then((r) => json<{ context: string; chunks: { text: string; source: string; semanticScore: number }[] }>(r)),
  },

  memory: {
    search: (query: string, workspaceId: string, limit = 5) =>
      fetch(`/api/memory?query=${encodeURIComponent(query)}&workspaceId=${workspaceId}&limit=${limit}`).then(
        (r) => json<{ memories: Memory[] }>(r),
      ),
  },

  outputs: {
    list: (workspaceId: string, limit = 50) =>
      fetch(`/api/outputs?workspaceId=${workspaceId}&limit=${limit}`).then(
        (r) => json<{ outputs: Output[] }>(r),
      ),
  },
};

'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Loader2, MessageSquare, Zap, ChevronDown, ChevronUp, FlaskConical, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

type Workspace = { id: string; name: string };

type Props = {
  conversationId: string | null;
  onNewConversationNeeded: () => Promise<string | null>;
  onTitleUpdated?: () => void;
};

const SUGGESTIONS = [
  'Explain quantum computing in simple terms',
  'Write a Python function to parse JSON from a URL',
  'What are the key differences between RAG and fine-tuning?',
  'Help me outline a research paper on AI agents',
];

const THINKING_STEPS = ['Thinking…', 'Processing…', 'Writing response…'];

function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end gap-2.5">
      <div
        className="max-w-[75%] rounded-2xl rounded-br-sm px-4 py-2.5 text-sm"
        style={{ background: 'var(--accent)', color: '#fff' }}
      >
        {content}
      </div>
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
      >
        U
      </div>
    </div>
  );
}

function AssistantBubble({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(true);
  const isLong = content.length > 800;

  return (
    <div className="flex items-start gap-2.5">
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
        style={{ background: 'linear-gradient(135deg, #7c6ff7, #a78bfa)', color: '#fff' }}
      >
        AI
      </div>
      <div className="min-w-0 flex-1">
        <div
          className="rounded-2xl rounded-bl-sm px-4 py-3 text-sm"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', overflow: 'hidden', maxHeight: expanded ? 'none' : '200px', transition: 'max-height 0.3s ease' }}
        >
          <div className="prose prose-invert max-w-none prose-sm">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
        {isLong && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="mt-1 flex items-center gap-1 text-[10px] transition-opacity hover:opacity-70"
            style={{ color: 'var(--text-muted)' }}
          >
            {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            {expanded ? 'Collapse' : 'Expand'}
          </button>
        )}
      </div>
    </div>
  );
}

export function AIChatWindow({ conversationId, onNewConversationNeeded, onTitleUpdated }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeConvId, setActiveConvId] = useState<string | null>(conversationId);
  const [showResearchPanel, setShowResearchPanel] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');
  const [isResearching, setIsResearching] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const skipHistoryReloadRef = useRef(false);

  useEffect(() => {
    setActiveConvId(conversationId);
  }, [conversationId]);

  useEffect(() => {
    if (!showResearchPanel) return;
    fetch('/api/workspaces')
      .then((r) => r.json())
      .then((d) => {
        const ws = (d.workspaces ?? []) as Workspace[];
        setWorkspaces(ws);
        if (ws[0]) setSelectedWorkspaceId(ws[0].id);
      })
      .catch(() => setWorkspaces([]));
  }, [showResearchPanel]);

  const handleDeepResearch = async () => {
    if (!input.trim() || !selectedWorkspaceId || isResearching) return;
    setIsResearching(true);
    const prompt = input.trim();
    setInput('');
    setShowResearchPanel(false);

    // Ensure we have a conversation to attach messages to
    let convId = activeConvId;
    if (!convId) {
      convId = await onNewConversationNeeded();
      if (!convId) { setIsResearching(false); return; }
      skipHistoryReloadRef.current = true;
      setActiveConvId(convId);
    }

    // Add user message to UI and save to DB
    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: `🔬 **Deep Research:** ${prompt}` };
    setMessages((prev) => [...prev, userMsg]);
    await fetch(`/api/chat/conversations/${convId}/messages/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'user', content: userMsg.content }),
    });

    // Add in-progress placeholder
    const placeholderId = `dr-${Date.now()}`;
    setMessages((prev) => [...prev, {
      id: placeholderId,
      role: 'assistant',
      content: '_Researching… The multi-agent workflow is running. This may take a minute._',
    }]);

    try {
      // Start the task
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, workspaceId: selectedWorkspaceId }),
      });
      if (!res.ok) throw new Error('Failed to start task');
      const { taskId } = await res.json() as { taskId: string };

      onTitleUpdated?.();

      // Poll until task completes (max 5 mins)
      const pollStart = Date.now();
      const MAX_MS = 5 * 60 * 1000;
      while (Date.now() - pollStart < MAX_MS) {
        await new Promise((r) => setTimeout(r, 4000));
        const pollRes = await fetch(`/api/tasks/${taskId}`);
        if (!pollRes.ok) continue;
        const { task } = await pollRes.json() as { task: { status: string; result?: string; errorMessage?: string } };

        if (task.status === 'complete' && task.result) {
          const finalContent = `### Deep Research Result\n\n${task.result}`;
          // Replace placeholder with real result in UI
          setMessages((prev) => prev.map((m) =>
            m.id === placeholderId ? { ...m, content: finalContent } : m,
          ));
          // Persist to DB
          await fetch(`/api/chat/conversations/${convId}/messages/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: 'assistant', content: finalContent }),
          });
          onTitleUpdated?.();
          break;
        } else if (task.status === 'error') {
          const errContent = `Research failed: ${task.errorMessage ?? 'Unknown error'}`;
          setMessages((prev) => prev.map((m) =>
            m.id === placeholderId ? { ...m, content: errContent } : m,
          ));
          await fetch(`/api/chat/conversations/${convId}/messages/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: 'assistant', content: errContent }),
          });
          break;
        }
        // Still running — update placeholder text with elapsed time
        const elapsed = Math.floor((Date.now() - pollStart) / 1000);
        setMessages((prev) => prev.map((m) =>
          m.id === placeholderId
            ? { ...m, content: `_Researching… ${elapsed}s elapsed. The multi-agent workflow is still running._` }
            : m,
        ));
      }
    } catch (err) {
      const errContent = `Failed to run deep research: ${(err as Error).message}`;
      setMessages((prev) => prev.map((m) =>
        m.id === placeholderId ? { ...m, content: errContent } : m,
      ));
    } finally {
      setIsResearching(false);
    }
  };

  useEffect(() => {
    if (!activeConvId) { setMessages([]); return; }
    // Skip reload if we just created this conversation inline (messages are already in state)
    if (skipHistoryReloadRef.current) {
      skipHistoryReloadRef.current = false;
      return;
    }
    setLoadingHistory(true);
    fetch(`/api/chat/conversations/${activeConvId}/messages`)
      .then((r) => r.json())
      .then((data) => {
        setMessages((data.messages ?? []).map((m: Message) => ({
          id: m.id,
          role: m.role,
          content: m.content,
        })));
      })
      .catch(() => setMessages([]))
      .finally(() => setLoadingHistory(false));
  }, [activeConvId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const startThinking = () => {
    setThinkingStep(0);
    let step = 0;
    stepTimerRef.current = setInterval(() => {
      step = Math.min(step + 1, THINKING_STEPS.length - 1);
      setThinkingStep(step);
    }, 2000);
  };

  const stopThinking = () => {
    if (stepTimerRef.current) { clearInterval(stepTimerRef.current); stepTimerRef.current = null; }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    let convId = activeConvId;
    if (!convId) {
      convId = await onNewConversationNeeded();
      if (!convId) return;
      // Mark that we should NOT reload history when activeConvId updates —
      // the messages are already in local state from this send flow
      skipHistoryReloadRef.current = true;
      setActiveConvId(convId);
    }

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: content.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    startThinking();

    try {
      const res = await fetch(`/api/chat/conversations/${convId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error((err as { error?: string }).error ?? 'Request failed');
      }

      const data = await res.json() as { message: Message };
      setMessages((prev) => [...prev, { id: data.message.id, role: 'assistant', content: data.message.content }]);
      onTitleUpdated?.();
    } catch (err) {
      setMessages((prev) => [...prev, {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Something went wrong: ${(err as Error).message}`,
      }]);
    } finally {
      setIsLoading(false);
      stopThinking();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  };

  if (!conversationId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
        <div>
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: 'linear-gradient(135deg, #7c6ff7 0%, #a78bfa 100%)', boxShadow: '0 0 30px rgba(124,111,247,0.3)' }}
          >
            <Zap size={28} color="#fff" />
          </div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>AI Assistant</h2>
          <p className="mt-1.5 max-w-sm text-sm" style={{ color: 'var(--text-secondary)' }}>
            Ask anything — research, writing, coding, analysis. Start a new conversation or pick one from the sidebar.
          </p>
        </div>
        <div className="grid w-full max-w-md gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => void sendMessage(s)}
              className="rounded-xl px-4 py-3 text-left text-sm transition-all hover:opacity-80"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Status bar */}
      <div
        className="flex items-center gap-2.5 px-5 py-2.5"
        style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface)' }}
      >
        <MessageSquare size={13} style={{ color: 'var(--accent)' }} />
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>AI Assistant</span>
        {isLoading && (
          <span className="ml-auto flex items-center gap-1.5 text-xs font-medium" style={{ color: '#a78bfa' }}>
            <Loader2 size={11} className="animate-spin" />
            {THINKING_STEPS[thinkingStep]}
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {loadingHistory ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={20} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-5">
            {messages.filter((m) => m.content.trim()).map((msg) =>
              msg.role === 'user'
                ? <UserBubble key={msg.id} content={msg.content} />
                : <AssistantBubble key={msg.id} content={msg.content} />
            )}
            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                  style={{ background: 'linear-gradient(135deg, #7c6ff7, #a78bfa)', color: '#fff' }}
                >
                  AI
                </div>
                <div
                  className="flex items-center gap-2 rounded-2xl rounded-bl-sm px-4 py-3"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <Loader2 size={12} className="animate-spin" style={{ color: '#a78bfa' }} />
                  <span className="text-sm font-medium" style={{ color: '#c4b5fd' }}>
                    {THINKING_STEPS[thinkingStep]}
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-5 pb-5 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="mx-auto max-w-3xl">
          {/* Deep Research Panel */}
          {showResearchPanel && (
            <div
              className="mb-3 rounded-xl p-3"
              style={{ background: 'var(--surface)', border: '1px solid var(--accent)', borderColor: '#7c6ff7' }}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#a78bfa' }}>
                  <FlaskConical size={12} /> Deep Research Mode
                </span>
                <button onClick={() => setShowResearchPanel(false)}>
                  <X size={13} style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>
              <p className="mb-2.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                Runs multi-agent workflow (Researcher → Writer → Critic) on your prompt. Select a workspace:
              </p>
              <div className="flex items-center gap-2">
                <select
                  value={selectedWorkspaceId}
                  onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                  className="flex-1 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                  style={{ background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                >
                  {workspaces.length === 0
                    ? <option>No workspaces — create one first</option>
                    : workspaces.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)
                  }
                </select>
                <button
                  onClick={() => void handleDeepResearch()}
                  disabled={!input.trim() || !selectedWorkspaceId || isResearching || workspaces.length === 0}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-40"
                  style={{ background: '#7c6ff7', color: '#fff' }}
                >
                  {isResearching ? <Loader2 size={11} className="animate-spin" /> : <FlaskConical size={11} />}
                  Run Research
                </button>
              </div>
            </div>
          )}

          <div
            className="flex items-end gap-3 rounded-2xl px-4 py-3"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            {/* Deep research toggle */}
            <button
              onClick={() => setShowResearchPanel((v) => !v)}
              title="Deep Research mode"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all hover:opacity-80"
              style={{
                background: showResearchPanel ? '#7c6ff7' : 'var(--surface-elevated, #1e1e2e)',
                border: '1px solid var(--border)',
                color: showResearchPanel ? '#fff' : 'var(--text-muted)',
              }}
            >
              <FlaskConical size={13} />
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message AI Assistant… (Enter to send, Shift+Enter for newline)"
              rows={1}
              disabled={isLoading}
              className="flex-1 resize-none bg-transparent text-sm outline-none disabled:opacity-50"
              style={{ color: 'var(--text-primary)', maxHeight: '160px', overflowY: 'auto' }}
            />
            <button
              onClick={() => void sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all disabled:opacity-40"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </div>
          <p className="mt-2 text-center text-[10px]" style={{ color: 'var(--text-muted)' }}>
            AI can make mistakes · Groq llama-3.3-70b-versatile ·{' '}
            <button onClick={() => setShowResearchPanel((v) => !v)} className="underline underline-offset-2 hover:opacity-70" style={{ color: '#a78bfa' }}>
              Deep Research
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
